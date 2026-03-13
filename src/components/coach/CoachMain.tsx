/**
 * CoachMain.tsx — UPDATED
 *
 * WHAT CHANGED:
 * Previously had no props — passed nothing to VideoFeed or MetricsStrip.
 * Now forwards all real session props so VideoFeed shows actual camera
 * and MetricsStrip shows live metrics.
 */

import React from 'react';
import { VideoFeed } from './VideoFeed';
import { MetricsStrip } from './MetricsStrip';
import type { CoachMetrics, CoachSessionPhase } from '@/lib/types/coach.types';

interface CoachMainProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  metrics: CoachMetrics;
  phase: CoachSessionPhase;
  isMicOn: boolean;
  isCameraOn: boolean;
  isMuted: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}

export const CoachMain: React.FC<CoachMainProps> = ({
  videoRef,
  metrics,
  phase,
  isMicOn,
  isCameraOn,
  isMuted,
  onToggleMic,
  onToggleCamera,
  onToggleMute,
  onPause,
  onResume,
  onEnd,
}) => {
  return (
    <div className="flex flex-col gap-5">
      <VideoFeed
        videoRef={videoRef}
        isCameraOn={isCameraOn}
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
      <MetricsStrip metrics={metrics} />
    </div>
  );
};