import React from 'react';
import { HintCard } from './HintCard';
import { PostureGuide } from './PostureGuide';
import { VideoControls } from './VideoControls';

export const CoachingOverlay: React.FC = () => {
  return (
    <>
      {/* Coaching Hints */}
      <div className="absolute right-4 md:right-5 top-4 md:top-5 flex flex-col gap-2 w-[180px] md:w-[200px]">
        <HintCard type="warn" message="Slow down" subtext="160 WPM → target 130" />
        <HintCard type="good" message="Great eye contact ✓" subtext="Confidence +12%" />
        <HintCard type="info" message="Pause before next point" subtext="2s pause = impact" />
      </div>

      <PostureGuide />
      <VideoControls />
    </>
  );
}; 
