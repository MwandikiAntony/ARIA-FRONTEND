/**
 * MetricsStrip.tsx — UPDATED
 *
 * WHAT CHANGED:
 * Previously hardcoded values (160, 12, 91, 84).
 * Now accepts CoachMetrics from the session and displays live values.
 * Shows 0 when session hasn't started — matches backend truth.
 */

import React from 'react';
import { MetricCard } from './MetricCard';
import type { CoachMetrics } from '@/lib/types/coach.types';

interface MetricsStripProps {
  metrics: CoachMetrics;
}

export const MetricsStrip: React.FC<MetricsStripProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricCard
        color="cyan"
        label="Speaking Rate"
        value={metrics.speakingRate}
        unit="words/min"
        delta={metrics.speakingRate > 0 ? Math.abs(metrics.speakingRate - 130) : undefined}
        deltaDirection={metrics.speakingRate <= 130 ? 'up' : 'down'}
      />
      <MetricCard
        color="amber"
        label="Filler Words"
        value={metrics.fillerWordCount}
        unit="this session"
      />
      <MetricCard
        color="green"
        label="Eye Contact"
        value={metrics.eyeContactScore}
        unit="gaze score"
        delta={metrics.eyeContactScore > 0 ? metrics.eyeContactScore : undefined}
        deltaDirection="up"
      />
      <MetricCard
        color="purple"
        label="Confidence"
        value={metrics.confidenceScore}
        unit="/ 100 score"
        delta={metrics.confidenceScore > 0 ? metrics.confidenceScore : undefined}
        deltaDirection="up"
      />
    </div>
  );
};