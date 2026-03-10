import { useState, useEffect, useCallback, useRef } from 'react';
import { useGeminiLive, GeminiState } from './useGeminiLive';

// ── Types ─────────────────────────────────────────────────────────────────────

export type IntroState = 'idle' | 'waiting' | 'speaking' | 'paused' | 'stopped' | 'interrupted';

export interface UseAriaIntroReturn {
  introState: IntroState;
  geminiState: GeminiState;
  isSpeaking: boolean;
  isListening: boolean;
  transcript: string;
  sessionId: string | null;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  enableVoice: () => void;
  disableVoice: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const INTRO_DELAY_MS = 5000;

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAriaIntro(): UseAriaIntroReturn {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [introState, setIntroState] = useState<IntroState>('idle');

  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introFiredRef = useRef(false);
  const audioEverReceivedRef = useRef(false); // true once first audio chunk arrives

  const {
    state: geminiState,
    isSpeaking,
    isListening,
    transcript,
    sendControlMessage,
    startListening,
    stopListening,
  } = useGeminiLive({ sessionId, enabled: !!sessionId });

  // ── Create session on mount ───────────────────────────────────────────────
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
        // Non-blocking — page still works without session
      }
    }
    init();
  }, []);

  // ── Trigger intro after delay once Gemini WS is ready ────────────────────
  useEffect(() => {
    if (
      geminiState === 'ready' &&
      introState === 'waiting' &&
      !introFiredRef.current
    ) {
      delayRef.current = setTimeout(() => {
        introFiredRef.current = true;
        sendControlMessage('start_intro');
        // Stay in 'waiting' — bar stays visible.
        // Will transition to 'speaking' when first audio chunk arrives.
      }, INTRO_DELAY_MS);
    }
    // If WS or Gemini hits error state, stop intro and surface it
    if (geminiState === 'error' && introState === 'waiting') {
      setIntroState('stopped');
    }

    return () => {
      if (delayRef.current) clearTimeout(delayRef.current);
    };
  }, [geminiState, introState, sendControlMessage]);

  // ── Transition to 'speaking' when first audio chunk arrives ─────────────
  useEffect(() => {
    if (isSpeaking && !audioEverReceivedRef.current) {
      audioEverReceivedRef.current = true;
    }
    if (
      isSpeaking &&
      (introState === 'waiting' || introState === 'speaking')
    ) {
      setIntroState('speaking');
    }
  }, [isSpeaking, introState]);

  // ── Detect natural end — only after audio was confirmed ──────────────────
  const prevSpeakingRef = useRef(false);
  useEffect(() => {
    const wasSpeak = prevSpeakingRef.current;
    prevSpeakingRef.current = isSpeaking;

    if (wasSpeak && !isSpeaking && audioEverReceivedRef.current) {
      if (introState === 'speaking') {
        // Gemini finished speaking — hide bar
        setIntroState('stopped');
      }
    }
  }, [isSpeaking, introState]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const pause = useCallback(() => {
    sendControlMessage('pause_intro');
    setIntroState('paused');
  }, [sendControlMessage]);

  const resume = useCallback(() => {
    sendControlMessage('resume_intro');
    setIntroState('speaking');
  }, [sendControlMessage]);

  const stop = useCallback(() => {
    if (delayRef.current) clearTimeout(delayRef.current);
    sendControlMessage('stop_intro');
    setIntroState('stopped');
  }, [sendControlMessage]);

  const enableVoice = useCallback(() => startListening(), [startListening]);
  const disableVoice = useCallback(() => stopListening(), [stopListening]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (delayRef.current) clearTimeout(delayRef.current);
    };
  }, []);

  return {
    introState,
    geminiState,
    isSpeaking,
    isListening,
    transcript,
    sessionId,
    pause,
    resume,
    stop,
    enableVoice,
    disableVoice,
  };
}