/**
 * TimelineFeed.tsx — UPDATED
 *
 * WHAT CHANGED:
 * Previously used a hardcoded static events array — never updated at runtime.
 * Now accepts a real HintEvent[] from useCoachSession (events come from
 * coach_hint WebSocket messages). Falls back to example events when
 * the session is new and no real events have arrived yet.
 */

import React from 'react';
import type { HintEvent } from '@/lib/types/coach.types';

// Fallback demo events — shown only until real events arrive
const DEMO_EVENTS: HintEvent[] = [
  { id: 'd1', time: '--:--', message: 'Start your session to receive real-time coaching', type: 'system · ready', color: 'cyan', hintType: 'info', timestamp: 0 },
];

interface TimelineFeedProps {
  events?: HintEvent[];
}

const colorMap: Record<string, string> = {
  amber:  'bg-amber',
  green:  'bg-green',
  cyan:   'bg-cyan',
  red:    'bg-red',
  purple: 'bg-purple',
};

export const TimelineFeed: React.FC<TimelineFeedProps> = ({ events }) => {
  const displayEvents = (events && events.length > 0) ? events : DEMO_EVENTS;

  return (
    <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto">
      {displayEvents.map((event) => (
        <div key={event.id} className="flex gap-2.5 animate-slide-in-up">
          <div className="font-mono text-[9px] text-text-muted min-w-[36px] pt-0.5">
            {event.time}
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-2 h-2 rounded-full ${colorMap[event.color] ?? 'bg-cyan'} mb-1`} />
            <div className="w-px flex-1 bg-border min-h-[12px]" />
          </div>
          <div className="flex-1 pb-3">
            <div className="text-[11px] text-text-primary leading-relaxed mb-0.5">
              {event.message}
            </div>
            <div className="font-mono text-[9px] text-text-muted">{event.type}</div>
          </div>
        </div>
      ))}
    </div>
  );
};