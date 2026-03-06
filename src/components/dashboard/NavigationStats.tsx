import React from 'react';

interface StatItemProps {
  label: string;
  value: string | number;
  color?: 'cyan' | 'green' | 'muted';
}

const StatItem: React.FC<StatItemProps> = ({ label, value, color = 'cyan' }) => {
  const colorClasses = {
    cyan: 'text-cyan',
    green: 'text-green',
    muted: 'text-text-muted',
  };

  return (
    <div className="flex justify-between items-center p-2.5 bg-bg-surface rounded-sm">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className={`font-display text-xl font-bold ${colorClasses[color]}`}>{value}</span>
    </div>
  );
};

export const NavigationStats: React.FC = () => {
  return (
    <div className="flex flex-col gap-2.5">
      <StatItem label="Routes completed" value="3" />
      <StatItem label="Distance navigated" value="2.4km" />
      <StatItem label="Hazards avoided" value="7" color="green" />
      <StatItem label="SOS triggers" value="0" color="muted" />
    </div>
  );
}; 
