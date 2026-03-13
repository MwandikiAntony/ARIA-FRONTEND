/**
 * SessionScoreRings.tsx — UPDATED
 *
 * WHAT CHANGED:
 * Previously hardcoded (83, 75, 90). Now accepts real score props from
 * CoachSidebar which gets them from useCoachSession metrics.
 */

import React from 'react';
import { ProgressRing } from '@/components/ui/ProgressRing';

interface SessionScoreRingsProps {
  clarityScore: number;
  energyScore: number;
  impactScore: number;
}

export const SessionScoreRings: React.FC<SessionScoreRingsProps> = ({
  clarityScore,
  energyScore,
  impactScore,
}) => {
  return (
    <div className="flex justify-around py-2">
      <ProgressRing value={clarityScore} color="#00e5ff" label="CLARITY" />
      <ProgressRing value={energyScore}  color="#ffab00" label="ENERGY"  />
      <ProgressRing value={impactScore}  color="#00e676" label="IMPACT"  />
    </div>
  );
};