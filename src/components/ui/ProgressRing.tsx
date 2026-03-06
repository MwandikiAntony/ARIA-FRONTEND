import React from 'react';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  color,
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-bg-surface)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center">
        <div className="font-display text-lg font-bold" style={{ color }}>
          {value}
        </div>
        {label && <div className="font-mono text-[9px] text-text-muted tracking-wider uppercase">{label}</div>}
      </div>
    </div>
  );
}; 
