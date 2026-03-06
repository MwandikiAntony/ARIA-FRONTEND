import React from 'react';
import { VideoFeed } from './VideoFeed';
import { MetricsStrip } from './MetricsStrip';

export const CoachMain: React.FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <VideoFeed />
      <MetricsStrip />
    </div>
  );
}; 
