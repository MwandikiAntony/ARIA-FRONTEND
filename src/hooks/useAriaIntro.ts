/**
 * useAriaIntro.ts — PATCHED (3 additions, nothing removed or changed)
 *
 * Passes sendBinary, sendText, and subscribeToMessages through from
 * useGeminiLive so useNavigationSession can access them.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGeminiLive, GeminiState } from './useGeminiLive';

// ── Types ─────────────────────────────────────────────────────────────────────

export type IntroState =
  | 'idle'
  | 'waiting'
  | 'ready_to_activate'
  | 'active'
  | 'muted'
  | 'paused'
  | 'stopped';

export interface UseAriaIntroReturn {
  introState: IntroState;
  geminiState: GeminiState;
  isSpeaking: boolean;
  isListening: boolean;
  transcript: string;
  sessionId: string | null;
  // NEW — passed through from useGeminiLive for useNavigationSession
  sendBinary: (data: ArrayBuffer) => void;
  sendText: (text: string) => void;
  subscribeToMessages: (handler: (msg: any) => void) => () => void;
  // ─────────────────────────────────────────────────────────────────
  activate: () => Promise<void>;
  stop: () => void;
  mute: () => void;
  unmute: () => void;
  pause: () => void;
  resume: () => void;
  enableVoice: () => void;
  disableVoice: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAriaIntro(): UseAriaIntroReturn {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [introState, setIntroState] = useState<IntroState>('idle');

  const introFiredRef = useRef(false);
  const micStartedRef = useRef(false);

  const {
    state: geminiState,
    isSpeaking,
    isListening,
    transcript,
    sendControlMessage,
    sendBinary,             // NEW
    sendText,               // NEW
    subscribeToMessages,    // NEW
    startListening,
    stopListening,
  } = useGeminiLive({ sessionId, enabled: !!sessionId });

  // ── Step 1: Create backend session on mount ───────────────────────────────

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/sessions/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_type: 'dashboard' }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setSessionId(data.session_id);
        setIntroState('waiting');
      } catch {
        // Non-blocking
      }
    }
    init();
  }, []);

  // ── Step 2: Watch for WS ready ────────────────────────────────────────────

  useEffect(() => {
    if (
      geminiState === 'ready' &&
      introState === 'waiting' &&
      !introFiredRef.current
    ) {
      setIntroState('ready_to_activate');
    }

    if (geminiState === 'error') {
      setIntroState('stopped');
    }
  }, [geminiState, introState]);

  // ── activate() ────────────────────────────────────────────────────────────

  const activate = useCallback(async () => {
    if (introFiredRef.current) return;
    if (geminiState !== 'ready' && introState !== 'ready_to_activate') return;

    introFiredRef.current = true;

    if (!micStartedRef.current) {
      micStartedRef.current = true;
      try {
        await startListening();
      } catch (err) {
        console.error('[useAriaIntro] Mic failed to start:', err);
      }
    }

    sendControlMessage('start_intro');
    setIntroState('active');
  }, [geminiState, introState, sendControlMessage, startListening]);

  // ── Controls ──────────────────────────────────────────────────────────────

  const stop = useCallback(() => {
    sendControlMessage('stop_intro');
    stopListening();
    setIntroState('stopped');
    introFiredRef.current = false;
    micStartedRef.current = false;
  }, [sendControlMessage, stopListening]);

  const mute = useCallback(() => {
    stopListening();
    setIntroState('muted');
  }, [stopListening]);

  const unmute = useCallback(() => {
    startListening().catch(console.error);
    setIntroState('active');
  }, [startListening]);

  const pause = mute;
  const resume = unmute;

  const enableVoice = useCallback(() => {
    startListening().catch(console.error);
  }, [startListening]);

  const disableVoice = stopListening;

  return {
    introState,
    geminiState,
    isSpeaking,
    isListening,
    transcript,
    sessionId,
    sendBinary,             // NEW
    sendText,               // NEW
    subscribeToMessages,    // NEW
    activate,
    stop,
    mute,
    unmute,
    pause,
    resume,
    enableVoice,
    disableVoice,
  };
}