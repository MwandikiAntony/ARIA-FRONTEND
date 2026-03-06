import React from 'react';
import { RouteStep } from '@/types';

const steps: RouteStep[] = [
  { id: '1', instruction: 'Head north on Market St', distance: 0, icon: '▲', isCurrent: true },
  { id: '2', instruction: 'Turn right on 5th Ave', distance: 120, icon: '↱' },
  { id: '3', instruction: 'Continue to Mission St', distance: 340, icon: '▲' },
  { id: '4', instruction: 'Arrive: 101 Mission St', distance: 460, icon: '⬛' },
];

export const RouteSteps: React.FC = () => {
  return (
    <div className="bg-bg-surface border border-border rounded-md p-4">
      {steps.map((step) => (
        <div key={step.id} className="flex gap-3 py-2.5 border-b border-border last:border-b-0">
          <div
            className={`
              w-7 h-7 rounded-full border flex items-center justify-center text-xs flex-shrink-0
              ${step.isCurrent ? 'bg-cyan border-cyan text-bg-void' : 'border-border-bright text-cyan'}
            `}
          >
            {step.icon}
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-text-primary mb-0.5">{step.instruction}</div>
            <div className="font-mono text-[10px] text-text-muted">
              {step.distance === 0
                ? 'Now · 0m remaining'
                : step.distance >= 400
                ? `~6 min · ${step.distance}m total`
                : `${step.distance}m ahead`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 
