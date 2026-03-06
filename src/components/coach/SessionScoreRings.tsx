import React from 'react';
import { ProgressRing } from '@/components/ui/ProgressRing';

export const SessionScoreRings: React.FC = () => {
  return (
    <div className="flex justify-around py-2">
      <ProgressRing value={83} color="#00e5ff" label="CLARITY" />
      <ProgressRing value={75} color="#ffab00" label="ENERGY" />
      <ProgressRing value={90} color="#00e676" label="IMPACT" />
    </div>
  );
}; 
