import React from 'react';
import { CoachingOverlay } from './CoachingOverlay';

export const VideoFeed: React.FC = () => {
  return (
    <div className="relative rounded-2xl overflow-hidden aspect-video bg-black glow-box-amber border border-amber/20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1520] to-[#050d14] flex items-center justify-center">
        {/* Person Silhouette */}
        <div className="relative flex flex-col items-center opacity-60">
          <div className="w-15 h-15 rounded-full bg-cyan-ghost border border-cyan/20 mb-1" />
          <div className="w-20 h-25 bg-cyan-ghost/50 border border-cyan/10 rounded-t-[40px] rounded-b-2xl" />
        </div>

        {/* Gaze Tracking */}
        <div className="absolute top-[25%] left-[42%] w-4 h-4">
          <div className="absolute inset-0 border border-cyan rounded-full animate-pulse-ring" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan rounded-full" />
        </div>

        <CoachingOverlay />
      </div>
    </div>
  );
}; 
