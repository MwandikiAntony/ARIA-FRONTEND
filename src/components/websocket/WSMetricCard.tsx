import React from 'react';

interface WSMetricCardProps {
  label: string;
  value: number | string;
  unit: string;
  color: 'green' | 'cyan' | 'amber' | 'purple';
}

const colorClasses = {
  green: 'from-green to-green/30',
  cyan: 'from-cyan to-cyan/30',
  amber: 'from-amber to-amber/30',
  purple: 'from-purple to-purple/30',
};

const valueColors = {
  green: 'text-green',
  cyan: 'text-cyan',
  amber: 'text-amber',
  purple: 'text-purple',
};

export const WSMetricCard: React.FC<WSMetricCardProps> = ({ label, value, unit, color }) => {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 glow-box relative overflow-hidden">
      <div className="font-mono text-[9px] tracking-widest uppercase text-text-muted mb-3">
        {label}
      </div>
      
      <div className={`font-display text-4xl font-bold leading-tight ${valueColors[color]}`}>
        {value}
      </div>
      
      <div className="font-mono text-xs text-text-muted mt-1">
        {unit}
      </div>

      <div 
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]}`}
      />
    </div>
  );
}; 
