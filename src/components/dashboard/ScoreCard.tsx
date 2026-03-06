import React from 'react';

interface ScoreCardProps {
  value: number;
  trend: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ value, trend }) => {
  return (
    <div className="bg-gradient-to-br from-cyan/5 to-cyan/10 border border-cyan/20 rounded-xl p-6 md:p-7 text-center relative overflow-hidden">
      <div className="font-display text-6xl md:text-7xl font-bold text-cyan leading-tight glow-text">
        {value}
      </div>
      <div className="font-mono text-[10px] tracking-widest text-text-muted uppercase mt-2">
        Overall Performance
      </div>
      <div className="font-display text-sm text-green mt-3">
        ▲ {trend} from last session
      </div>
    </div>
  );
}; 
