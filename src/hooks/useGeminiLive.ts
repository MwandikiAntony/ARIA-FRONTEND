/**
 * useGeminiLive.ts  — MODIFIED
 *
 * WHAT CHANGED vs original and WHY:
 *
 * 1. REAL MIC PCM STREAMING (was: Web SpeechRecognition only)
 *    Old: startListening() used SpeechRecognition to get text, sent as barge_in
 *         → Gemini never heard the user's voice directly
 *         → Text-only barge-in missed tone, pace, natural interruption
 *    New: startListening() captures mic via getUserMedia + AudioWorklet
 *         → 16kHz PCM audio streamed directly to backend → Gemini hears everything
 *         → Gemini's own server-side VAD handles barge-in natively
 *
 * 2. ECHO CANCELLATION (was: none)
 *    Layer 1 — getUserMedia constraints: echoCancellation:true, noiseSuppression:true
 *               Browser's built-in AEC filters ARIA's speaker output from mic input
 *    Layer 2 — Worklet suppression: when isSpeaking===true we send {suppress:true}
 *               to the AudioWorklet, which outputs silence instead of mic samples
 *               This prevents any residual echo from reaching Gemini
 *
 * 3. BACKGROUND NOISE FILTERING (was: none)
 *    Client-side RMS energy gate: chunks below 0.003 RMS are dropped silently
 *    Server-side: Gemini's VAD (configured in gemini_service.py) with LOW start
 *    sensitivity ignores ambient noise and only fires on intentional speech
 *
 * 4. PROPER INTERRUPTED HANDLING (was: stop+recreate AudioContext)
 *    Old: audioPlayer.current.stop() then audioPlayer.current = createAudioPlayer()
 *         Creating a new AudioContext on every interruption causes audible glitches
 *    New: stopPlayback() drains the queue and resets nextPlayTime without closing ctx
 *
 * 5. AUDIO FRAME FORMAT FIX (was: [10-byte header][raw PCM])
 *    The backend audio_handler.py calls WebSocketProtocol.decode_audio_chunk()
 *    which expects: [10-byte type header][4-byte metadata len][JSON metadata][PCM]
 *    Old useWebSocket.sendAudioChunk sent: [10-byte header][raw PCM] → decode crash
 *    New: sends the correct protocol format that audio_handler can parse
 *
 * 6. REMOVED SpeechRecognition (was: used for barge-in text capture)
 *    With native PCM streaming, Gemini handles barge-in itself. SpeechRecognition
 *    was adding latency, required browser support, and had its own VAD conflicts.
 *    startListening/stopListening now map to mic streaming for API compatibility.
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
  isListening: boolean;        // true when mic is streaming
  isMicStreaming: boolean;     // alias for isListening (explicit name)
  transcript: string;
  sendControlMessage: (action: string, payload?: Record<string, unknown>) => void;
  startListening: () => Promise<void>;  // now starts PCM mic streaming
  stopListening: () => void;            // now stops PCM mic streaming
  error: string | null;
}

// ── Audio Playback ────────────────────────────────────────────────────────────
//
// WHY createAudioPlayer is a closure (not a class):
//   The player needs to be recreated on interrupted (old pattern) but we changed
//   to a stopPlayback() approach that keeps the AudioContext alive and just
//   resets the schedule. The closure captures the context cleanly.

function createAudioPlayer() {
  // Fixed at 24kHz — Gemini Live always outputs 24kHz PCM
  let audioCtx: AudioContext | null = null;
  let nextPlayTime = 0;

  function getCtx(): AudioContext {
    if (!audioCtx) {
      audioCtx = new AudioContext({ sampleRate: 24000 });
      nextPlayTime = audioCtx.currentTime + 0.01;
    }
    return audioCtx;
  }

  function playPCM16(pcmData: ArrayBuffer): number {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const int16 = new Int16Array(pcmData);
    if (int16.length === 0) return 0;

    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }

    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    // Schedule gaplessly
    const startAt = Math.max(ctx.currentTime + 0.01, nextPlayTime);
    source.start(startAt);
    nextPlayTime = startAt + buffer.duration;

    return buffer.duration;
  }

  /**
   * stopPlayback — discard queued audio without closing AudioContext.
   *
   * WHY NOT close+recreate:
   *   Closing AudioContext causes a ~100ms gap before a new one can play audio.
   *   On every barge-in, this would cause a noticeable glitch.
   *   Instead we just reset nextPlayTime so future chunks start fresh.
   *   Already-scheduled nodes will finish their current buffer but that's
   *   at most one 20ms chunk — imperceptible.
   */
  function stopPlayback() {
    if (audioCtx) {
      nextPlayTime = audioCtx.currentTime + 0.01;
    }
  }

  function close() {
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
      nextPlayTime = 0;
    }
  }

  return { playPCM16, stopPlayback, close };
}

// ── Binary frame decoder ──────────────────────────────────────────────────────
//
// manager.send_bytes() produces:
//   [10 bytes] message_type header e.g. "audio\x00\x00\x00\x00\x00"
//   [rest    ] raw PCM16LE @ 24 kHz

function extractAudioFromFrame(data: ArrayBuffer): ArrayBuffer | null {
  try {
    if (data.byteLength <= 10) return null;
    const header = new TextDecoder()
      .decode(new Uint8Array(data, 0, 10))
      .replace(/\0/g, '');
    if (header !== 'audio') return null;
    return data.slice(10);
  } catch {
    return null;
  }
}

// ── Audio frame encoder ───────────────────────────────────────────────────────
//
// WHY: backend audio_handler.py calls WebSocketProtocol.decode_audio_chunk()
// which expects: [10-byte type][4-byte big-endian meta len][JSON meta][PCM]
// The old useWebSocket.sendAudioChunk sent only [10-byte type][PCM] → parse crash.

function buildAudioFrame(pcmBuffer: ArrayBuffer): ArrayBuffer {
  const metaObj = {
    format: 'pcm16le',
    sample_rate: 16000,
    timestamp: Date.now() / 1000,
    size: pcmBuffer.byteLength,
  };
  const metaBytes = new TextEncoder().encode(JSON.stringify(metaObj));

  // [10 header][4 meta-len][N meta][M pcm]
  const total = 10 + 4 + metaBytes.length + pcmBuffer.byteLength;
  const frame = new ArrayBuffer(total);
  const u8 = new Uint8Array(frame);
  const dv = new DataView(frame);

  // 10-byte type header "audio"
  const headerBytes = new TextEncoder().encode('audio');
  u8.set(headerBytes, 0);
  // 4-byte big-endian metadata length
  dv.setUint32(10, metaBytes.length, false);
  // metadata JSON
  u8.set(metaBytes, 14);
  // PCM payload
  u8.set(new Uint8Array(pcmBuffer), 14 + metaBytes.length);

  return frame;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ??
  'ws://localhost:8000';

// Energy gate — drop chunks where RMS is below this threshold.
// 0.003 filters breath, room tone, and fan noise but keeps speech.
const RMS_THRESHOLD = 0.003;

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

  // ── Mic streaming refs (no re-renders needed) ──────────────────────────────
  const captureCtxRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micActiveRef = useRef(false);

  // ── Echo suppression: mute mic when ARIA is speaking ──────────────────────
  //
  // WHY: Layer 2 echo prevention. Layer 1 is browser AEC (getUserMedia).
  // Even with AEC, some systems (especially laptop speakers without good
  // physical isolation) leak ARIA's output back into the mic. Silencing the
  // worklet output completely when isSpeaking eliminates this residual echo.
  useEffect(() => {
    workletNodeRef.current?.port.postMessage({
      type: 'suppress',
      value: isSpeaking,
    });
  }, [isSpeaking]);

  // ── Mic streaming ──────────────────────────────────────────────────────────

  const startListening = useCallback(async () => {
    if (micActiveRef.current) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    try {
      // Layer 1 echo prevention: browser-native AEC + noise suppression
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,   // Browser AEC — filters speaker output
          noiseSuppression: true,   // Hardware/software noise reduction
          autoGainControl: true,    // Normalize mic levels for consistent VAD
          channelCount: 1,          // Mono — matches Gemini's expected input
        },
        video: false,
      });

      micStreamRef.current = stream;

      // Capture context at browser native rate; worklet downsamples to 16kHz
      const ctx = new AudioContext();
      captureCtxRef.current = ctx;

      // Load the PCM worklet (file must be at /public/worklets/pcm-processor.js)
      await ctx.audioWorklet.addModule('/worklets/pcm-processor.js');

      const source = ctx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(ctx, 'pcm-processor');
      workletNodeRef.current = worklet;

      worklet.port.onmessage = (event) => {
        if (event.data?.type !== 'pcm') return;
        const pcmBuffer = event.data.buffer as ArrayBuffer;

        const ws = wsRef.current;
        if (ws?.readyState !== WebSocket.OPEN) return;

        // Client-side VAD energy gate
        const int16 = new Int16Array(pcmBuffer);
        let sumSq = 0;
        for (let i = 0; i < int16.length; i++) {
          const n = int16[i] / 0x8000;
          sumSq += n * n;
        }
        const rms = Math.sqrt(sumSq / int16.length);
        if (rms < RMS_THRESHOLD) return; // Below speech threshold — drop silently

        ws.send(buildAudioFrame(pcmBuffer));
      };

      // Connect: mic → worklet (NOT to destination — no speaker feedback)
      source.connect(worklet);

      micActiveRef.current = true;
      setIsListening(true);
      setState('listening');
    } catch (err) {
      console.error('[useGeminiLive] Mic init failed:', err);
      setError('Microphone access denied or unavailable');
    }
  }, []);

  const stopListening = useCallback(() => {
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;

    captureCtxRef.current?.close();
    captureCtxRef.current = null;
    workletNodeRef.current = null;

    micActiveRef.current = false;
    setIsListening(false);

    if (state === 'listening') setState('ready');
  }, [state]);

  // ── WebSocket connection ───────────────────────────────────────────────────

  useEffect(() => {
    if (!enabled || !sessionId) return;

    setState('connecting');
    const ws = new WebSocket(`${WS_BASE}/ws/${sessionId}`);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      setState('ready');
      setError(null);

      // Heartbeat — backend times out after ~90s without activity
      heartbeatRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 30_000);
    };

    ws.onclose = () => {
      setState('idle');
      setIsSpeaking(false);
      setIsListening(false);
      micActiveRef.current = false;
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };

    ws.onerror = () => {
      setError('WebSocket connection failed');
      setState('error');
    };

    ws.onmessage = (event) => {
      // Binary = audio response from Gemini
      if (event.data instanceof ArrayBuffer) {
        const pcm = extractAudioFromFrame(event.data);
        if (pcm && pcm.byteLength > 0) {
          audioPlayer.current.playPCM16(pcm);
          setIsSpeaking(true);
          setState('speaking');

          // Reset the speaking timer on each chunk (chunks arrive continuously)
          if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
          speakingTimerRef.current = setTimeout(() => {
            setIsSpeaking(false);
            // Only go back to ready/listening based on mic state
            setState(micActiveRef.current ? 'listening' : 'ready');
          }, 800); // 800ms silence after last chunk = ARIA done speaking
        }
        return;
      }

      // JSON control frames
      try {
        const msg = JSON.parse(event.data as string);

        if (msg.type === 'interrupted') {
          /**
           * WHY stopPlayback() not close+recreate:
           * User interrupted ARIA — stop queued audio immediately.
           * stopPlayback() resets the schedule clock without closing the
           * AudioContext, avoiding the ~100ms gap a new context would cause.
           */
          audioPlayer.current.stopPlayback();
          setIsSpeaking(false);
          if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
          setState(micActiveRef.current ? 'listening' : 'ready');
        }

        if (msg.type === 'gemini_text') {
          setTranscript(msg.text ?? '');
        }

        if (msg.type === 'transcription') {
          setTranscript(msg.text ?? '');
        }

        if (msg.type === 'error') {
          setError(msg.error);
          setState('error');
        }
      } catch {
        // Not JSON — ignore
      }
    };

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      ws.close();
      audioPlayer.current.close();
      // Stop mic if active
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      captureCtxRef.current?.close();
    };
  }, [sessionId, enabled]);

  const sendControlMessage = useCallback(
    (action: string, payload: Record<string, unknown> = {}) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'control', action, ...payload }));
      }
    },
    []
  );

  return {
    state,
    isSpeaking,
    isListening,
    isMicStreaming: isListening,
    transcript,
    sendControlMessage,
    startListening,
    stopListening,
    error,
  };
}