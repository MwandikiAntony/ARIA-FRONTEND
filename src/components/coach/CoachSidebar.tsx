import React from 'react';
import { SidebarCard } from './SidebarCard';
import { AgentStateIndicator } from '../navigation/AgentStateIndicator';
import { TimelineFeed } from './TimelineFeed';
import { SessionScoreRings } from './SessionScoreRings';

export const CoachSidebar: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <SidebarCard title="// Agent State">
        <AgentStateIndicator currentState={1} />
      </SidebarCard>

      <SidebarCard title="// Coaching Feed">
        <TimelineFeed />
      </SidebarCard>

      <SidebarCard title="// Session Score">
        <SessionScoreRings />
      </SidebarCard>
    </div>
  );
}; 
