/**
 * useCoachSession.ts
 *
 * WHY THIS FILE EXISTS:
 * The coach page previously had no real session logic — all data was hardcoded
 * static values in each component. This hook:
 *   1. Creates a backend session (POST /api/v1/sessions/start with type='coach')
 *   2. Opens the Gemini Live WebSocket via useAriaIntro (same pattern as navigate)
 *   3. Sends a coach-mode system prompt so ARIA speaks as a coach, not navigator
 *   4. Drives agent state from WS messages (same useAgentState hook)
 *   5. Tracks real metrics from backend coach_metrics WS messages
 *   6. Accumulates timeline events from coach_hint WS messages
 *   7. Manages session timer, mic, camera, pause/mute controls
 *   8. Exposes mode switching: when user says "navigate" or clicks switch,
 *      sends a mode_switch control message and can redirect to /navigate
 *
 * Pattern mirrors useAriaIntro + useNavigationSession but for coach mode.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAriaIntro } from './useAriaIntro';
import { useAgentState, AgentState } from './useAgentState';
import { useMediaCapture } from './useMediaCapture';
import type {
  CoachMode,
  CoachSessionState,
  CoachMetrics,
  HintEvent,
  CoachSessionPhase,
} from '@/lib/types/coach.types';
import { DEFAULT_METRICS } from '@/lib/types/coach.types';

// ── Coach mode system prompts ─────────────────────────────────────────────────

const COACH_SYSTEM_PROMPTS: Record<CoachMode, string> = {
  interview: `You are ARIA in Coach Mode for an interview session. Your role is to help the user ace their interview.
Monitor their speaking pace (target 120-140 WPM), detect filler words (um, uh, like, you know), 
observe eye contact and confidence posture. Give whisper-style hints at exactly the right moment — 
never interrupt a strong answer. Say things like "Slow down", "Great answer — pause before next", 
"Make eye contact", "You're using 'um' a lot — take a breath". 
If the user asks about navigation, tell them: "Navigation mode is available — you can switch to it from the navbar. 
I'm here to focus on your interview right now. Ready to continue?"`,

  presentation: `You are ARIA in Coach Mode for a presentation. Help the user deliver a compelling, clear, high-energy presentation.
Focus on: pacing, vocal variety, pausing for emphasis, energy levels, and slide transition cues.
Give hints like "Add more energy here", "Great pause — let that point land", "Speed up — you're losing momentum".
If the user asks about navigation: "Navigation mode is one tap away in the navbar — I'm your presentation coach right now. Let's keep going!"`,

  music: `You are ARIA in Coach Mode for a music performance. Help the singer or musician with their stage presence and delivery.
Focus on: breathing technique, performance energy, engagement with the audience, mic technique, stage confidence.
Give hints like "Project more", "Great breath support", "Connect with the audience — look up", "Hold that note with confidence".
If the user asks about navigation: "Navigation is available in the navbar — I'm focused on your performance right now. You're doing great!"`,

  mc: `You are ARIA in Coach Mode for MC / public speaking. Help the user command the room with confidence and charisma.
Focus on: crowd energy, transition phrases, humor timing, voice projection, pacing between segments.
Give hints like "Pick up the energy", "Great crowd moment", "Slow down on the announcement", "Project to the back of the room".
If the user asks about navigation: "Navigation is a tap away in the navbar — right now I'm your MC coach. The crowd is yours!"`,

  sermon: `You are ARIA in Coach Mode for a sermon or ministry delivery. Help the speaker deliver a powerful, moving message.
Focus on: passion and conviction in delivery, pausing for reflection moments, connecting emotionally, clarity of key points.
Give hints like "Let that scripture breathe — pause", "Great conviction here", "Bring your volume up — project faith", "Slow down on the key message".
If the user asks about navigation: "Navigation mode is available in the navbar — I'm here to support your message delivery right now. Carry on."`,

  negotiation: `You are ARIA in Coach Mode for a negotiation. Help the user negotiate with confidence, clarity, and strategic calm.
Focus on: confident tone (not aggressive), strategic pauses, clear value statements, listening cues, managing emotional tone.
Give hints like "Pause — let them respond", "Strong position — hold it", "Lower your pace — you sound rushed", "Great anchor — now be silent".
If the user asks about navigation: "Navigation mode is just a tap away in the navbar — I'm helping you win this negotiation right now."`,
};

// ── Mode intro messages ───────────────────────────────────────────────────────

const MODE_INTROS: Record<CoachMode, string> = {
  interview: "start_coach_interview",
  presentation: "start_coach_presentation",
  music: "start_coach_music",
  mc: "start_coach_mc",
  sermon: "start_coach_sermon",
  negotiation: "start_coach_negotiation",
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseCoachSessionReturn {
  // Session state
  session: CoachSessionState;

  // Agent
  agentState: AgentState;
  urgencyScore: number;

  // Media
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCapturing: boolean;

  // AI
  isSpeaking: boolean;
  isListening: boolean;
  transcript: string;

  // Actions
  selectMode: (mode: CoachMode) => void;
  startSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleMic: () => void;
  switchToNavigation: () => void;
}

export function useCoachSession(): UseCoachSessionReturn {
  const [session, setSession] = useState<CoachSessionState>({
    phase: 'idle',
    mode: null,
    sessionId: null,
    startTime: null,
    elapsedSeconds: 0,
    metrics: { ...DEFAULT_METRICS },
    events: [],
    isMuted: false,
    isCameraOn: false,
    isMicOn: false,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventIdRef = useRef(0);

  // ── Aria intro (Gemini Live session) ─────────────────────────────────────
  const aria = useAriaIntro();

  // ── Agent state driven by WS messages ────────────────────────────────────
  const wsMessage = aria.subscribeToMessages
    ? undefined  // subscribeToMessages is callback-based; wsMessage below handles it
    : undefined;

  const [lastWsMessage, setLastWsMessage] = useState<any>(null);

  useEffect(() => {
    if (!aria.subscribeToMessages) return;
    const unsub = aria.subscribeToMessages((msg) => {
      setLastWsMessage(msg);
      handleWsMessage(msg);
    });
    return unsub;
  }, [aria.subscribeToMessages]); // eslint-disable-line react-hooks/exhaustive-deps

  const { currentState: agentState, urgencyScore, transitionTo } = useAgentState({
    wsMessage: lastWsMessage,
    mode: 'coach',
    isSpeaking: aria.isSpeaking,
  });

  // ── Media capture ─────────────────────────────────────────────────────────
  const { videoRef, isCapturing, startCapture, stopCapture } = useMediaCapture({
    sendFrame: aria.sendBinary,
    enabled: session.isCameraOn && session.phase === 'active',
  });

  // ── Handle WS messages from backend ──────────────────────────────────────
  const handleWsMessage = useCallback((msg: any) => {
    if (!msg?.type) return;

    if (msg.type === 'coach_metrics') {
      setSession(prev => ({
        ...prev,
        metrics: { ...prev.metrics, ...msg.metrics },
      }));
    }

    if (msg.type === 'coach_hint') {
      const newEvent: HintEvent = {
        id: `evt_${++eventIdRef.current}`,
        time: formatElapsed(Date.now()),
        message: msg.hint,
        type: `${msg.category} · ${msg.hint_type}`,
        color: msg.hint_type === 'good' ? 'green' : msg.hint_type === 'warn' ? 'amber' : 'cyan',
        hintType: msg.hint_type,
        timestamp: msg.timestamp ?? Date.now(),
      };
      setSession(prev => ({
        ...prev,
        events: [newEvent, ...prev.events].slice(0, 50), // keep last 50
      }));
    }

    if (msg.type === 'mode_switch_request') {
      // Backend is telling us user asked to switch modes
      if (msg.target_mode === 'navigation') {
        switchToNavigation();
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Session timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (session.phase === 'active') {
      timerRef.current = setInterval(() => {
        setSession(prev => ({
          ...prev,
          elapsedSeconds: prev.startTime
            ? Math.floor((Date.now() - prev.startTime) / 1000)
            : prev.elapsedSeconds + 1,
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session.phase]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const selectMode = useCallback((mode: CoachMode) => {
    setSession(prev => ({ ...prev, mode, phase: 'ready' }));
  }, []);

  const startSession = useCallback(async () => {
    if (!session.mode) return;

    // Activate Gemini Live if not already active
    if (aria.introState !== 'active') {
      await aria.activate();
    }

    // Tell backend we're starting coach mode with this specific sub-mode
    aria.sendText(JSON.stringify({
      type: 'control',
      action: MODE_INTROS[session.mode],
      mode: 'coach',
      coach_mode: session.mode,
      system_prompt_hint: COACH_SYSTEM_PROMPTS[session.mode],
    }));

    // Start camera
    await startCapture();

    setSession(prev => ({
      ...prev,
      phase: 'active',
      startTime: Date.now(),
      sessionId: aria.sessionId,
      isMicOn: true,
      isCameraOn: true,
    }));
  }, [session.mode, aria, startCapture]);

  const pauseSession = useCallback(() => {
    aria.pause();
    setSession(prev => ({ ...prev, phase: 'paused' }));
  }, [aria]);

  const resumeSession = useCallback(() => {
    aria.resume();
    setSession(prev => ({ ...prev, phase: 'active' }));
  }, [aria]);

  const endSession = useCallback(() => {
    aria.stop();
    stopCapture();
    if (timerRef.current) clearInterval(timerRef.current);
    setSession(prev => ({ ...prev, phase: 'ended' }));
  }, [aria, stopCapture]);

  const toggleMute = useCallback(() => {
    if (session.isMuted) {
      aria.unmute();
    } else {
      aria.mute();
    }
    setSession(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, [session.isMuted, aria]);

  const toggleCamera = useCallback(() => {
    if (session.isCameraOn) {
      stopCapture();
    } else {
      startCapture();
    }
    setSession(prev => ({ ...prev, isCameraOn: !prev.isCameraOn }));
  }, [session.isCameraOn, startCapture, stopCapture]);

  const toggleMic = useCallback(() => {
    if (session.isMicOn) {
      aria.disableVoice();
    } else {
      aria.enableVoice();
    }
    setSession(prev => ({ ...prev, isMicOn: !prev.isMicOn }));
  }, [session.isMicOn, aria]);

  const switchToNavigation = useCallback(() => {
    aria.sendText(JSON.stringify({
      type: 'control',
      action: 'mode_switch',
      target_mode: 'navigation',
    }));
    // Navigate — use window.location since we don't have router here
    if (typeof window !== 'undefined') {
      window.location.href = '/navigate?autostart=true';
    }
  }, [aria]);

  return {
    session,
    agentState,
    urgencyScore,
    videoRef,
    isCapturing,
    isSpeaking: aria.isSpeaking,
    isListening: aria.isListening,
    transcript: aria.transcript,
    selectMode,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    toggleMute,
    toggleCamera,
    toggleMic,
    switchToNavigation,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatElapsed(timestamp: number): string {
  const d = new Date(timestamp);
  const m = d.getMinutes().toString().padStart(2, '0');
  const s = d.getSeconds().toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function formatSessionTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}