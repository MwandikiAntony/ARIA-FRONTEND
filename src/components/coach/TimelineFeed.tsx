import React from 'react';
import { TimelineEvent } from '@/types';

const events: TimelineEvent[] = [
  {
    id: '1',
    time: '04:32',
    message: 'Pace is elevated — slow down for clarity',
    type: 'pace · urgency: medium',
    color: 'amber',
  },
  {
    id: '2',
    time: '03:55',
    message: 'Excellent eye contact maintained',
    type: 'engagement · positive',
    color: 'green',
  },
  {
    id: '3',
    time: '03:21',
    message: 'Pause before key point — let it land',
    type: 'delivery · coaching',
    color: 'cyan',
  },
  {
    id: '4',
    time: '02:47',
    message: '"Um" detected 3× in 20 seconds',
    type: 'filler words · high freq',
    color: 'red',
  },
  {
    id: '5',
    time: '02:10',
    message: 'Strong opening — confident delivery',
    type: 'confidence · positive',
    color: 'green',
  },
];

const colorMap = {
  amber: 'bg-amber',
  green: 'bg-green',
  cyan: 'bg-cyan',
  red: 'bg-red',
};

export const TimelineFeed: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto">
      {events.map((event) => (
        <div key={event.id} className="flex gap-2.5 animate-slide-in-up">
          <div className="font-mono text-[9px] text-text-muted min-w-[36px] pt-0.5">{event.time}</div>
          <div className="flex flex-col items-center">
            <div className={`w-2 h-2 rounded-full ${colorMap[event.color]} mb-1`} />
            <div className="w-px flex-1 bg-border min-h-[12px]" />
          </div>
          <div className="flex-1 pb-3">
            <div className="text-[11px] text-text-primary leading-relaxed mb-0.5">{event.message}</div>
            <div className="font-mono text-[9px] text-text-muted">{event.type}</div>
          </div>
        </div>
      ))}
    </div>
  );
}; 
