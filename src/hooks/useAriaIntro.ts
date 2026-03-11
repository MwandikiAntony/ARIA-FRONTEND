/**
 * useAriaIntro.ts  — MODIFIED
 *
 * WHAT CHANGED vs original and WHY:
 *
 * 1. PERSISTENT AGENT AFTER INTRO (was: stopped after intro finished)
 *    Old: When isSpeaking went false after intro audio ended → setIntroState('stopped')
 *         → AriaIntroBar hid itself → Gemini session idle → user lost the assistant
 *    New: When intro audio ends → setIntroState('active')
 *         → Mic streaming starts → ARIA keeps listening indefinitely
 *         → Agent stays alive until user explicitly mutes or stops it
 *
 * 2. NEW STATES: 'active' and 'muted' (was: 'idle'|'waiting'|'speaking'|'paused'|'stopped'|'interrupted')
 *    'active' — intro done, mic streaming, ARIA listening for questions
 *    'muted'  — user muted ARIA (mic stopped, no audio output), session still open
 *    These map to the requirement: "remain on until user mute it or closes it"
 *
 * 3. VOICE ENABLE IS NOW REAL MIC STREAMING (was: SpeechRecognition)
 *    enableVoice() → startListening() → now starts PCM AudioWorklet capture
 *    disableVoice() → stopListening() → stops mic stream
 *    This means ARIA actually hears you via the Live API, not via text transcription
 *
 * 4. MUTE/UNMUTE CONTROLS (new)
 *    mute(): stops mic streaming, stays in 'muted' state, session stays open
 *    unmute(): restarts mic streaming, returns to 'active' state
 *    This implements "remain on until user mute it" requirement
 *
 * 5. ECHO: enableVoice is only called AFTER intro audio ends (isSpeaking = false)
 *    WHY: If we started mic streaming while ARIA is speaking the introduction,
 *    ARIA's own voice would be captured and sent back as input — causing feedback.
 *    We wait for the intro to finish before enabling mic input.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGeminiLive, GeminiState } from './useGeminiLive';

// ── Types ─────────────────────────────────────────────────────────────────────

export type IntroState =
  | 'idle'
  | 'waiting'
  | 'speaking'
  | 'active'        // NEW: intro done, agent listening persistently
  | 'paused'
  | 'muted'         // NEW: user muted, session still open
  | 'stopped'
  | 'interrupted';

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
  mute: () => void;        // NEW
  unmute: () => void;      // NEW
  enableVoice: () => void;
  disableVoice: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// Delay before triggering intro after Gemini WS is ready.
// Gives the user time to see the page before audio starts.
const INTRO_DELAY_MS = 1500;

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

  // ── Trigger intro once Gemini WS is ready ────────────────────────────────
  useEffect(() => {
    if (
      geminiState === 'ready' &&
      introState === 'waiting' &&
      !introFiredRef.current
    ) {
      delayRef.current = setTimeout(() => {
        introFiredRef.current = true;
        sendControlMessage('start_intro');
        // Stays in 'waiting' until first audio chunk arrives
      }, INTRO_DELAY_MS);
    }

    if (geminiState === 'error' && introState === 'waiting') {
      setIntroState('stopped');
    }

    return () => {
      if (delayRef.current) clearTimeout(delayRef.current);
    };
  }, [geminiState, introState, sendControlMessage]);

  // ── Transition to 'speaking' when first audio chunk arrives ──────────────
  useEffect(() => {
    if (isSpeaking && !audioEverReceivedRef.current) {
      audioEverReceivedRef.current = true;
    }
    if (isSpeaking && (introState === 'waiting' || introState === 'speaking')) {
      setIntroState('speaking');
    }
  }, [isSpeaking, introState]);

  // ── Transition to 'active' when intro audio finishes ────────────────────
  //
  // CHANGED from original:
  // Old: setIntroState('stopped') → bar hid → agent died
  // New: setIntroState('active') → bar stays visible → mic streaming starts
  //
  // WHY wait for intro to finish before starting mic:
  //   If mic streamed during the intro, ARIA's own intro audio would be
  //   captured by the mic and sent back to Gemini as user input, causing
  //   ARIA to hear herself and potentially respond mid-introduction.
  //   Browser AEC helps but isn't perfect, especially on laptop speakers.
  //   The safest approach is: mic OFF during intro playback, ON after.
  const prevSpeakingRef = useRef(false);
  useEffect(() => {
    const wasSpeak = prevSpeakingRef.current;
    prevSpeakingRef.current = isSpeaking;

    if (wasSpeak && !isSpeaking && audioEverReceivedRef.current) {
      if (introState === 'speaking') {
        // Intro finished — enter persistent listening mode
        setIntroState('active');
        // Start PCM mic streaming now that ARIA is done speaking
        startListening().catch(console.error);
      }
    }
  }, [isSpeaking, introState, startListening]);

  // ── Controls ──────────────────────────────────────────────────────────────

  const pause = useCallback(() => {
    sendControlMessage('pause_intro');
    stopListening();
    setIntroState('paused');
  }, [sendControlMessage, stopListening]);

  const resume = useCallback(() => {
    sendControlMessage('resume_intro');
    if (introState === 'paused') {
      startListening().catch(console.error);
      setIntroState('active');
    }
  }, [sendControlMessage, introState, startListening]);

  const stop = useCallback(() => {
    if (delayRef.current) clearTimeout(delayRef.current);
    sendControlMessage('stop_intro');
    stopListening();
    setIntroState('stopped');
  }, [sendControlMessage, stopListening]);

  /**
   * mute — stop sending mic audio, keep Gemini session open.
   *
   * WHY keep session open:
   *   Closing and recreating the Gemini session on every mute would lose
   *   conversation context and incur session startup latency (~500ms).
   *   Keeping it open means unmute is instant — mic streaming just resumes.
   */
  const mute = useCallback(() => {
    stopListening();
    setIntroState('muted');
  }, [stopListening]);

  /**
   * unmute — resume mic streaming, return to active state.
   */
  const unmute = useCallback(() => {
    startListening().catch(console.error);
    setIntroState('active');
  }, [startListening]);

  const enableVoice = useCallback(() => {
    startListening().catch(console.error);
  }, [startListening]);

  const disableVoice = useCallback(() => {
    stopListening();
  }, [stopListening]);

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
    mute,
    unmute,
    enableVoice,
    disableVoice,
  };
}