/**
 * CoachSidebar.tsx — UPDATED
 *
 * WHAT CHANGED:
 * Previously passed hardcoded currentState={1} to AgentStateIndicator
 * and had no connection to real session data in TimelineFeed or SessionScoreRings.
 *
 * Now accepts real props from CoachLayout and maps AgentState string to
 * the numeric index that AgentStateIndicator expects (same AGENT_STATES array order).
 */

import React from 'react';
import { SidebarCard } from './SidebarCard';
import { AgentStateIndicator } from '../navigation/AgentStateIndicator';
import { TimelineFeed } from './TimelineFeed';
import { SessionScoreRings } from './SessionScoreRings';
import type { AgentState } from '@/hooks/useAgentState';
import type { HintEvent } from '@/lib/types/coach.types';

// Must match the order in src/lib/constants/agentStates.ts
const STATE_INDEX: Record<AgentState, number> = {
  LISTENING:  0,
  OBSERVING:  1,
  EVALUATING: 2,
  COACHING:   3,
  SILENT:     4,
};

interface CoachSidebarProps {
  agentState: AgentState;
  events: HintEvent[];
  clarityScore: number;
  energyScore: number;
  impactScore: number;
}

export const CoachSidebar: React.FC<CoachSidebarProps> = ({
  agentState,
  events,
  clarityScore,
  energyScore,
  impactScore,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <SidebarCard title="// Agent State">
        <AgentStateIndicator currentState={STATE_INDEX[agentState]} />
      </SidebarCard>

      <SidebarCard title="// Coaching Feed">
        <TimelineFeed events={events} />
      </SidebarCard>

      <SidebarCard title="// Session Score">
        <SessionScoreRings
          clarityScore={clarityScore}
          energyScore={energyScore}
          impactScore={impactScore}
        />
      </SidebarCard>
    </div>
  );
};