/**
 * useGeminiLive.ts — PATCHED
 *
 * ADDED (3 things, nothing removed or changed):
 *
 * 1. sendBinary(data: ArrayBuffer)
 *    Sends raw binary over the WebSocket. Used by useMediaCapture to send
 *    video frames with the [10-byte "video" header][JPEG] wire format.
 *
 * 2. sendText(text: string)
 *    Sends a raw JSON string over the WebSocket. Used by useNavigationSession
 *    to send GPS messages and set_mode without going through sendControlMessage.
 *
 * 3. subscribeToMessages(handler) → unsubscribe()
 *    Lets useNavigationSession receive navigation-specific WS messages
 *    (detection, agent_state, environment_update) that useGeminiLive
 *    doesn't handle itself. Handlers are stored in a Set and called for
 *    every incoming JSON message. Multiple callers can subscribe at once.
 *
 * All existing behaviour, logging, and return values are unchanged.
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type GeminiState =
  | 'idle'
  | 'connecting'
  | 'ready'
  | 'speaking'
  | 'listening'
  | 'error';

export interface UseGeminiLiveOptions {
  sessionId: string | null;
  enabled?: boolean;
}

export interface UseGeminiLiveReturn {
  state: GeminiState;
  isSpeaking: boolean;
  isListening: boolean;
  isMicStreaming: boolean;
  transcript: string;
  sendControlMessage: (action: string, payload?: Record<string, unknown>) => void;
  sendBinary: (data: ArrayBuffer) => void;                              // NEW
  sendText: (text: string) => void;                                     // NEW
  subscribeToMessages: (handler: (msg: any) => void) => () => void;    // NEW
  startListening: () => Promise<void>;
  stopListening: () => void;
  error: string | null;
}

// ── Audio Playback ────────────────────────────────────────────────────────────

function createAudioPlayer() {
  let audioCtx: AudioContext | null = null;
  let nextPlayTime = 0;
  let chunksPlayed = 0;

  function initContext() {
    if (!audioCtx) {
      audioCtx = new AudioContext({ sampleRate: 24000 });
      nextPlayTime = audioCtx.currentTime + 0.01;
      console.log('[PLAYBACK] ✅ AudioContext created (sampleRate=24000, state=' + audioCtx.state + ')');
    } else if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        console.log('[PLAYBACK] ▶️ AudioContext resumed from suspended state');
      });
    } else {
      console.log('[PLAYBACK] AudioContext already running (state=' + audioCtx.state + ')');
    }
  }

  function getCtx(): AudioContext {
    if (!audioCtx) {
      console.warn('[PLAYBACK] ⚠️ getCtx() called without initContext() — creating fallback context');
      audioCtx = new AudioContext({ sampleRate: 24000 });
      nextPlayTime = audioCtx.currentTime + 0.01;
    }
    return audioCtx;
  }

  function playPCM16(pcmData: ArrayBuffer): number {
    const ctx = getCtx();

    if (ctx.state === 'suspended') {
      console.warn('[PLAYBACK] ⚠️ AudioContext suspended — attempting resume before playback');
      ctx.resume();
    }

    if (ctx.state === 'closed') {
      console.error('[PLAYBACK] ❌ AudioContext is closed — cannot play audio');
      return 0;
    }

    const int16 = new Int16Array(pcmData);
    if (int16.length === 0) {
      console.warn('[PLAYBACK] ⚠️ Empty PCM buffer received — skipping');
      return 0;
    }

    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }

    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const startAt = Math.max(ctx.currentTime + 0.01, nextPlayTime);
    source.start(startAt);
    nextPlayTime = startAt + buffer.duration;
    chunksPlayed++;

    if (chunksPlayed <= 10 || chunksPlayed % 20 === 0) {
      console.log(
        `[PLAYBACK] 🔊 Playing chunk #${chunksPlayed}: ${int16.length} samples, ` +
        `${buffer.duration.toFixed(3)}s, startAt=${startAt.toFixed(3)}, ` +
        `ctx.state=${ctx.state}`
      );
    }

    return buffer.duration;
  }

  function stopPlayback() {
    if (audioCtx) {
      nextPlayTime = audioCtx.currentTime + 0.01;
      console.log('[PLAYBACK] ⏹️ Playback stopped (barge-in)');
    }
  }

  function close() {
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
      nextPlayTime = 0;
      console.log(`[PLAYBACK] 🔒 AudioContext closed (played ${chunksPlayed} chunks total)`);
    }
  }

  return { initContext, playPCM16, stopPlayback, close };
}

// ── Binary frame decoder ──────────────────────────────────────────────────────

function extractAudioFromFrame(data: ArrayBuffer): ArrayBuffer | null {
  try {
    if (data.byteLength <= 10) {
      console.warn(`[AUDIO-IN] ⚠️ Frame too small: ${data.byteLength} bytes`);
      return null;
    }
    const header = new TextDecoder()
      .decode(new Uint8Array(data, 0, 10))
      .replace(/\0/g, '');
    if (header !== 'audio') {
      console.warn(`[AUDIO-IN] ⚠️ Unexpected header: '${header}' (expected 'audio')`);
      return null;
    }
    const payload = data.slice(10);
    return payload;
  } catch (e) {
    console.error('[AUDIO-IN] ❌ Frame decode error:', e);
    return null;
  }
}

// ── Audio frame encoder ───────────────────────────────────────────────────────

function buildAudioFrame(pcmBuffer: ArrayBuffer): ArrayBuffer {
  const metaObj = {
    format: 'pcm16le',
    sample_rate: 16000,
    timestamp: Date.now() / 1000,
    size: pcmBuffer.byteLength,
  };
  const metaBytes = new TextEncoder().encode(JSON.stringify(metaObj));

  const total = 10 + 4 + metaBytes.length + pcmBuffer.byteLength;
  const frame = new ArrayBuffer(total);
  const u8 = new Uint8Array(frame);
  const dv = new DataView(frame);

  const headerBytes = new TextEncoder().encode('audio');
  u8.set(headerBytes, 0);
  dv.setUint32(10, metaBytes.length, false);
  u8.set(metaBytes, 14);
  u8.set(new Uint8Array(pcmBuffer), 14 + metaBytes.length);

  return frame;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ??
  'ws://localhost:8000';

const RMS_THRESHOLD = 0.0;

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGeminiLive({
  sessionId,
  enabled = true,
}: UseGeminiLiveOptions): UseGeminiLiveReturn {
  const [state, setState] = useState<GeminiState>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioPlayer = useRef(createAudioPlayer());
  const speakingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const captureCtxRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micActiveRef = useRef(false);
  const audioOutCountRef = useRef(0);
  const audioInCountRef = useRef(0);

  // NEW: message subscriber registry
  const messageSubscribersRef = useRef<Set<(msg: any) => void>>(new Set());

  // ── Mic streaming ──────────────────────────────────────────────────────────

  const startListening = useCallback(async () => {
    if (micActiveRef.current) return;

    try {
      audioPlayer.current.initContext();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const ctx = new AudioContext({ sampleRate: 16000 });
      captureCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);

      let workletLoaded = false;
      try {
        await ctx.audioWorklet.addModule('/pcm-processor.js');
        const worklet = new AudioWorkletNode(ctx, 'pcm-processor');
        workletNodeRef.current = worklet;

        worklet.port.onmessage = (e) => {
          if (e.data instanceof ArrayBuffer) sendPCMChunk(e.data);
        };

        source.connect(worklet);
        worklet.connect(ctx.destination);
        workletLoaded = true;
        console.log('[MIC] ✅ Using AudioWorklet (pcm-processor.js)');
      } catch (workletErr) {
        console.warn('[MIC] ⚠️ AudioWorklet failed, falling back to ScriptProcessor:', workletErr);
      }

      if (!workletLoaded) {
        const bufferSize = 4096;
        const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
        scriptProcessorRef.current = processor;

        processor.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          const nativeRate = ctx.sampleRate;
          const targetRate = 16000;
          const ratio = nativeRate / targetRate;
          const outputLength = Math.round(input.length / ratio);
          const output = new Float32Array(outputLength);

          for (let i = 0; i < outputLength; i++) {
            output[i] = input[Math.floor(i * ratio)];
          }

          const int16 = new Int16Array(outputLength);
          for (let i = 0; i < outputLength; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, output[i] * 32768));
          }

          sendPCMChunk(int16.buffer);
        };

        source.connect(processor);
        processor.connect(ctx.destination);
        console.log(`[MIC] ✅ Using ScriptProcessor fallback (bufferSize=${bufferSize}, nativeRate=${ctx.sampleRate}→16000)`);
      }

      micActiveRef.current = true;
      setIsListening(true);
      setState('listening');
      console.log('[MIC] ✅ Mic capture active — streaming to backend');

    } catch (err) {
      console.error('[MIC] ❌ Mic init failed:', err);
      setError('Microphone access denied or unavailable');
    }
  }, []);

  function sendPCMChunk(pcmBuffer: ArrayBuffer) {
    const ws = wsRef.current;
    if (ws?.readyState !== WebSocket.OPEN) return;

    const int16 = new Int16Array(pcmBuffer);
    let sumSq = 0;
    for (let i = 0; i < int16.length; i++) {
      const n = int16[i] / 0x8000;
      sumSq += n * n;
    }
    const rms = Math.sqrt(sumSq / int16.length);

    if (rms < RMS_THRESHOLD) return;

    audioOutCountRef.current++;
    const count = audioOutCountRef.current;

    if (count <= 5 || count % 50 === 0) {
      console.log(
        `[AUDIO-OUT] 📤 Chunk #${count} → backend: ${int16.length} samples, rms=${rms.toFixed(4)}`
      );
    }

    ws.send(buildAudioFrame(pcmBuffer));
  }

  const stopListening = useCallback(() => {
    console.log('[MIC] 🛑 Stopping mic capture...');
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;

    captureCtxRef.current?.close();
    captureCtxRef.current = null;
    workletNodeRef.current = null;
    scriptProcessorRef.current = null;

    micActiveRef.current = false;
    setIsListening(false);

    if (state === 'listening') setState('ready');
    console.log(`[MIC] Stopped. Sent ${audioOutCountRef.current} audio chunks total`);
  }, [state]);

  // ── WebSocket connection ───────────────────────────────────────────────────

  useEffect(() => {
    if (!enabled || !sessionId) return;

    const wsUrl = `${WS_BASE}/ws/${sessionId}`;
    console.log(`[WS] 🔌 Connecting to: ${wsUrl}`);
    setState('connecting');

    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[WS] ✅ Connected to backend (session=${sessionId})`);
      setState('ready');
      setError(null);

      heartbeatRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
          console.debug('[WS] 💓 Heartbeat sent');
        }
      }, 20_000);
    };

    ws.onclose = (event) => {
      console.log(`[WS] 🔌 Disconnected: code=${event.code}, reason='${event.reason}', wasClean=${event.wasClean}`);
      setState('idle');
      setIsSpeaking(false);
      setIsListening(false);
      micActiveRef.current = false;
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };

    ws.onerror = (e) => {
      console.error('[WS] ❌ WebSocket error:', e);
      setError('WebSocket connection failed');
      setState('error');
    };

    ws.onmessage = (event) => {
      // ── Binary frame (audio from Gemini) ──────────────────────────────────
      if (event.data instanceof ArrayBuffer) {
        audioInCountRef.current++;
        const count = audioInCountRef.current;

        if (count <= 10 || count % 20 === 0) {
          console.log(
            `[AUDIO-IN] 🔊 Audio chunk #${count} ← Gemini: ${event.data.byteLength} bytes total`
          );
        }

        const pcm = extractAudioFromFrame(event.data);
        if (pcm && pcm.byteLength > 0) {
          console.debug(`[AUDIO-IN] Extracted PCM: ${pcm.byteLength} bytes → playback`);
          audioPlayer.current.playPCM16(pcm);
          setIsSpeaking(true);
          setState('speaking');

          if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
          speakingTimerRef.current = setTimeout(() => {
            setIsSpeaking(false);
            setState(micActiveRef.current ? 'listening' : 'ready');
          }, 400);
        } else {
          console.warn(`[AUDIO-IN] ⚠️ Could not extract PCM from ${event.data.byteLength}b frame`);
        }
        return;
      }

      // ── JSON message ──────────────────────────────────────────────────────
      try {
        const msg = JSON.parse(event.data as string);
        console.debug('[WS] JSON message:', msg.type, msg);

        if (msg.type === 'connected') {
          console.log(`[WS] ✅ Server confirmed connection: session=${msg.session_id}`);
        }

        if (msg.type === 'intro_started') {
          console.log('[WS] ✅ intro_started — Gemini session created, greeting sent');
        }

        if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: msg.timestamp }));
        }

        if (msg.type === 'pong') {
          const latency = Date.now() - msg.timestamp;
          console.debug(`[WS] 🏓 Pong received, latency=${latency}ms`);
        }

        if (msg.type === 'interrupted') {
          console.log('[WS] ⚡ Barge-in detected — stopping playback');
          audioPlayer.current.stopPlayback();
          setIsSpeaking(false);
          if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
          setState(micActiveRef.current ? 'listening' : 'ready');
        }

        if (msg.type === 'gemini_text') {
          console.log(`[WS] 💬 Gemini text: '${msg.text}'`);
          setTranscript(msg.text ?? '');
        }

        if (msg.type === 'transcription') {
          console.log(`[WS] 📝 Transcription [${msg.role}]: '${msg.text}'`);
          setTranscript(msg.text ?? '');
        }

        if (msg.type === 'error') {
          console.error('[WS] ❌ Server error:', msg.error);
          setError(msg.error);
          setState('error');
        }

        // NEW: fan out to all navigation subscribers
        // detection, agent_state, environment_update arrive here and are
        // forwarded to any subscriber registered via subscribeToMessages()
        messageSubscribersRef.current.forEach((handler) => {
          try { handler(msg); } catch { /* subscriber errors don't kill WS */ }
        });

      } catch {
        // Not JSON — ignore
      }
    };

    return () => {
      console.log('[WS] 🧹 Cleanup: closing WebSocket and audio');
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      ws.close(1000, 'Component unmounted');
      audioPlayer.current.close();
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      captureCtxRef.current?.close();
    };
  }, [sessionId, enabled]);

  // ── sendControlMessage (unchanged) ────────────────────────────────────────

  const sendControlMessage = useCallback(
    (action: string, payload: Record<string, unknown> = {}) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log(`[WS] 📤 Control: action='${action}'`, payload);
        wsRef.current.send(JSON.stringify({ type: 'control', action, ...payload }));
      } else {
        console.warn(`[WS] ⚠️ sendControlMessage('${action}') — WS not open (state=${wsRef.current?.readyState})`);
      }
    },
    []
  );

  // ── NEW: sendBinary ────────────────────────────────────────────────────────
  // Sends raw ArrayBuffer over the WS. Used by useMediaCapture for video frames.

  const sendBinary = useCallback((data: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    } else {
      console.warn('[WS] ⚠️ sendBinary — WS not open');
    }
  }, []);

  // ── NEW: sendText ──────────────────────────────────────────────────────────
  // Sends a raw JSON string over the WS. Used for GPS messages and set_mode.

  const sendText = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(text);
    } else {
      console.warn('[WS] ⚠️ sendText — WS not open');
    }
  }, []);

  // ── NEW: subscribeToMessages ───────────────────────────────────────────────
  // Registers a handler for incoming JSON messages. Returns an unsubscribe fn.
  // Used by useNavigationSession to receive detection / agent_state messages.

  const subscribeToMessages = useCallback((handler: (msg: any) => void) => {
    messageSubscribersRef.current.add(handler);
    return () => { messageSubscribersRef.current.delete(handler); };
  }, []);

  return {
    state,
    isSpeaking,
    isListening,
    isMicStreaming: isListening,
    transcript,
    sendControlMessage,
    sendBinary,             // NEW
    sendText,               // NEW
    subscribeToMessages,    // NEW
    startListening,
    stopListening,
    error,
  };
}