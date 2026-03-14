import React from 'react';

export interface RouteStep {
  id: string;
  instruction: string;
  distance: number;
  icon: string;
  isCurrent?: boolean;
}

interface RouteStepsProps {
  steps?: RouteStep[];
}

export const RouteSteps: React.FC<RouteStepsProps> = ({ steps = [] }) => {
  if (steps.length === 0) {
    return (
      <div className="bg-bg-surface border border-border rounded-md p-4 flex flex-col items-center justify-center gap-2 min-h-[80px]">
        <span className="font-mono text-[10px] text-text-muted text-center">
          No active route.
          <br />
          Tell ARIA where you want to go.
        </span>
      </div>
    );
  }

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
                ? `~${Math.ceil(step.distance / 80)} min · ${step.distance}m total`
                : `${step.distance}m ahead`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};