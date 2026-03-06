import React from 'react';

export const Waveform: React.FC = () => {
  const bars = [30, 60, 90, 100, 80, 100, 70, 50, 30];

  return (
    <div className="flex items-center gap-0.5 h-8">
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-0.5 bg-cyan rounded-sm opacity-60 origin-bottom animate-waveform"
          style={{
            height: `${height}%`,
            animationDelay: `${index * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}; 
