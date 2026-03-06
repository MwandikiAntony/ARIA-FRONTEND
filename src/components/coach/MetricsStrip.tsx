import React from 'react';
import { MetricCard } from './MetricCard';

export const MetricsStrip: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricCard
        color="cyan"
        label="Speaking Rate"
        value={160}
        unit="words/min"
        delta={18}
        deltaDirection="up"
      />
      <MetricCard
        color="amber"
        label="Filler Words"
        value={12}
        unit="this session"
        delta={30}
        deltaDirection="down"
      />
      <MetricCard color="green" label="Eye Contact" value={91} unit="gaze score" delta={8} deltaDirection="up" />
      <MetricCard color="purple" label="Confidence" value={84} unit="/ 100 score" delta={12} deltaDirection="up" />
    </div>
  );
}; 
