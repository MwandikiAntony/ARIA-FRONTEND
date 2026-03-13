/**
 * VideoFeed.tsx — UPDATED
 *
 * WHAT CHANGED:
 * Previously showed a static silhouette SVG with no real camera.
 * Now:
 * - Attaches the real videoRef from useMediaCapture to a <video> element
 * - Shows the actual live camera feed when isCameraOn === true
 * - Falls back to the silhouette when camera is off (preserves old design)
 * - CoachingOverlay still renders on top (posture guide, hint cards, controls)
 * - VideoControls now receive real callbacks from the session hook
 */

import React from 'react';
import { CoachingOverlay } from './CoachingOverlay';
import type { CoachMetrics, CoachSessionPhase } from '@/lib/types/coach.types';

interface VideoFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOn: boolean;
  metrics: CoachMetrics;
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

export const VideoFeed: React.FC<VideoFeedProps> = ({
  videoRef,
  isCameraOn,
  metrics,
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

  return (
    <div className="relative rounded-2xl overflow-hidden aspect-video bg-black glow-box-amber border border-amber/20">

      {/* ── Real camera feed ─────────────────────────────────────────────── */}
      {isCameraOn && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted   /* always mute the video element — audio goes via Gemini Live */
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}  /* mirror for front-facing feel */
        />
      )}

      {/* ── Fallback: simulated feed (camera off or not started) ─────────── */}
      {!isCameraOn && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1520] to-[#050d14] flex items-center justify-center">
          <div className="relative flex flex-col items-center opacity-60">
            {/* Person Silhouette */}
            <div className="w-15 h-15 rounded-full bg-cyan-ghost border border-cyan/20 mb-1" />
            <div className="w-20 h-25 bg-cyan-ghost/50 border border-cyan/10 rounded-t-[40px] rounded-b-2xl" />
          </div>

          {/* Gaze tracking ring (simulated) */}
          <div className="absolute top-[25%] left-[42%] w-4 h-4">
            <div className="absolute inset-0 border border-cyan rounded-full animate-pulse-ring" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan rounded-full" />
          </div>

          {/* Camera off indicator */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-bg-surface/80 backdrop-blur-md border border-border rounded-full px-3 py-1">
            <span className="text-xs">📷</span>
            <span className="font-mono text-[9px] text-text-muted tracking-wider">CAMERA OFF</span>
          </div>
        </div>
      )}

      {/* ── Dark overlay scrim on camera feed for readability ────────────── */}
      {isCameraOn && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
      )}

      {/* ── Coaching overlays (hints, posture bars, controls) ────────────── */}
      <CoachingOverlay
        metrics={metrics}
        isMicOn={isMicOn}
        isMuted={isMuted}
        phase={phase}
        onToggleMic={onToggleMic}
        onToggleCamera={onToggleCamera}
        onToggleMute={onToggleMute}
        onPause={onPause}
        onResume={onResume}
        onEnd={onEnd}
      />

      {/* ── Paused overlay ───────────────────────────────────────────────── */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">⏸</span>
            <span className="font-mono text-xs text-amber tracking-wider">SESSION PAUSED</span>
          </div>
        </div>
      )}
    </div>
  );
};