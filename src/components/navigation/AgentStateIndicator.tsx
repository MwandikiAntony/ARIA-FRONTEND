import React from 'react';
import { AgentState } from '@/types';

interface AgentStateIndicatorProps {
  currentState: number;
}

const states: { name: AgentState; number: number }[] = [
  { name: 'LISTENING', number: 1 },
  { name: 'OBSERVING', number: 2 },
  { name: 'EVALUATING', number: 3 },
  { name: 'COACHING', number: 4 },
  { name: 'SILENT_WATCH', number: 5 },
];

export const AgentStateIndicator: React.FC<AgentStateIndicatorProps> = ({ currentState }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {states.map((state, index) => (
        <div
          key={state.name}
          className={`
            flex items-center gap-2.5 p-2 rounded-sm transition-all duration-200 border border-transparent
            ${index === currentState ? 'bg-cyan-ghost border-cyan/20' : ''}
          `}
        >
          <div
            className={`
              w-2 h-2 rounded-full flex-shrink-0 transition-all duration-200
              ${index === currentState ? 'bg-cyan shadow-[0_0_8px_#00e5ff] animate-blink' : 'bg-text-muted'}
            `}
          />
          <span
            className={`
              font-mono text-[11px] font-medium tracking-wide transition-all duration-200
              ${index === currentState ? 'text-cyan' : 'text-text-muted'}
            `}
          >
            {state.name}
          </span>
          <span
            className={`
              ml-auto font-mono text-[10px] transition-all duration-200
              ${index === currentState ? 'text-cyan-dim' : 'text-text-muted'}
            `}
          >
            {state.number.toString().padStart(2, '0')}
          </span>
        </div>
      ))}
    </div>
  );
}; 
