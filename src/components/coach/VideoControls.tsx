/**
 * VideoControls.tsx — UPDATED
 *
 * WHAT CHANGED:
 * Previously used local useState for isPaused with no connection to the session.
 * Clicking pause/stop did nothing to actual media or Gemini Live.
 *
 * Now: all state and handlers come from props (from useCoachSession via the
 * component chain). Local state removed — single source of truth.
 */

import React from 'react';
import type { CoachSessionPhase } from '@/lib/types/coach.types';

interface VideoControlsProps {
  isMicOn: boolean;
  isMuted: boolean;
  phase: CoachSessionPhase;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isMicOn,
  isMuted,
  phase,
  onToggleMic,
  onToggleCamera,
  onToggleMute,
  onPause,
  onResume,
  onEnd,
}) => {
  const isPaused = phase === 'paused';
  const isActive = phase === 'active';

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 items-center">
      {/* Mic toggle */}
      <button
        onClick={onToggleMic}
        title={isMicOn ? 'Mute mic' : 'Unmute mic'}
        className={`
          w-10 h-10 rounded-full border backdrop-blur-md text-base transition-all duration-200
          ${isMicOn
            ? 'border-cyan/60 bg-bg-surface/80 text-cyan hover:border-cyan hover:text-cyan'
            : 'border-red/50 bg-red/10 text-red hover:bg-red/20'
          }
        `}
      >
        {isMicOn ? '🎤' : '🔇'}
      </button>

      {/* Camera toggle */}
      <button
        onClick={onToggleCamera}
        title="Toggle camera"
        className="w-10 h-10 rounded-full border border-border-bright bg-bg-surface/80 text-text-primary text-base hover:border-cyan hover:text-cyan transition-all duration-200 backdrop-blur-md"
      >
        📹
      </button>

      {/* Pause / Resume */}
      <button
        onClick={isPaused ? onResume : onPause}
        title={isPaused ? 'Resume session' : 'Pause session'}
        className={`
          w-13 h-13 rounded-full border-2 text-xl transition-all duration-200 backdrop-blur-md
          ${isPaused
            ? 'border-green bg-green/10 text-green hover:bg-green/20'
            : 'border-amber/60 bg-bg-surface/80 text-amber hover:border-amber'
          }
        `}
      >
        {isPaused ? '▶' : '⏸'}
      </button>

      {/* ARIA mute toggle */}
      <button
        onClick={onToggleMute}
        title={isMuted ? 'Unmute ARIA' : 'Mute ARIA'}
        className={`
          w-10 h-10 rounded-full border backdrop-blur-md text-base transition-all duration-200
          ${isMuted
            ? 'border-red/50 bg-red/10 text-red hover:bg-red/20'
            : 'border-border-bright bg-bg-surface/80 text-text-primary hover:border-cyan hover:text-cyan'
          }
        `}
      >
        🔊
      </button>

      {/* End session */}
      <button
        onClick={onEnd}
        title="End session"
        className="w-10 h-10 rounded-full border border-red/50 bg-bg-surface/80 text-red text-base hover:bg-red hover:text-white transition-all duration-200 backdrop-blur-md"
      >
        ⏹
      </button>
    </div>
  );
};