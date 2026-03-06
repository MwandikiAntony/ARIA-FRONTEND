import React from 'react';

interface HintCardProps {
  type: 'warn' | 'good' | 'info';
  message: string;
  subtext: string;
}

const typeStyles = {
  warn: 'border-l-amber',
  good: 'border-l-green',
  info: 'border-l-cyan',
};

export const HintCard: React.FC<HintCardProps> = ({ type, message, subtext }) => {
  return (
    <div
      className={`
        bg-bg-surface/90 backdrop-blur-md border-l-3 rounded-r-md p-2.5 md:p-3.5
        animate-slide-in-right ${typeStyles[type]}
      `}
    >
      <div className="text-xs font-medium text-text-primary mb-1">{message}</div>
      <div className="font-mono text-[9px] text-text-muted">{subtext}</div>
    </div>
  );
}; 
