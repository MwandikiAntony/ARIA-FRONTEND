import React from 'react';

export const PostureGuide: React.FC = () => {
  const guides = [
    { label: 'POSTURE', value: 82, color: 'green' },
    { label: 'ENERGY', value: 65, color: 'amber' },
    { label: 'EYE', value: 90, color: 'cyan' },
  ];

  return (
    <div className="absolute bottom-16 left-4 md:left-5 flex gap-2">
      {guides.map((guide) => (
        <div key={guide.label} className="flex flex-col items-center gap-1">
          <div className="w-1 h-16 bg-white/10 rounded-sm relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-500"
              style={{
                height: `${guide.value}%`,
                backgroundColor: `var(--color-${guide.color})`,
              }}
            />
          </div>
          <span className="font-mono text-[8px] text-text-muted vertical-rl rotate-180 tracking-wider">
            {guide.label}
          </span>
        </div>
      ))}
    </div>
  );
}; 
