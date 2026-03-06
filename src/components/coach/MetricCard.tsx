import React from 'react';

interface MetricCardProps {
  color: 'cyan' | 'amber' | 'green' | 'purple';
  label: string;
  value: number;
  unit: string;
  delta?: number;
  deltaDirection?: 'up' | 'down';
}

const colorClasses = {
  cyan: 'after:bg-cyan metric-value-cyan',
  amber: 'after:bg-amber metric-value-amber',
  green: 'after:bg-green metric-value-green',
  purple: 'after:bg-purple metric-value-purple',
};

const valueColors = {
  cyan: 'text-cyan',
  amber: 'text-amber',
  green: 'text-green',
  purple: 'text-purple',
};

export const MetricCard: React.FC<MetricCardProps> = ({
  color,
  label,
  value,
  unit,
  delta,
  deltaDirection,
}) => {
  return (
    <div
      className={`
        bg-bg-card border border-border rounded-md p-4 md:p-5 relative overflow-hidden
        after:absolute after:top-0 after:left-0 after:right-0 after:h-0.5 ${colorClasses[color]}
      `}
    >
      <div className="font-mono text-[10px] text-text-muted tracking-wider uppercase mb-1">{label}</div>
      <div className={`font-display text-2xl md:text-3xl font-bold leading-tight mb-1 ${valueColors[color]}`}>
        {value}
      </div>
      <div className="font-mono text-xs text-text-muted">{unit}</div>
      {delta && (
        <div
          className={`
            font-mono text-[10px] mt-1.5
            ${deltaDirection === 'up' ? 'text-green' : 'text-red'}
          `}
        >
          {deltaDirection === 'up' ? '▲' : '▼'} {delta > 0 ? '+' : ''}
          {delta}
          {deltaDirection === 'up' ? '% improved' : '% vs last'}
        </div>
      )}
    </div>
  );
}; 
