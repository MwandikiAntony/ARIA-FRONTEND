import React from 'react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
const heights = [52, 60, 58, 68, 72, 76, 84];
const colors = [
  'from-cyan to-cyan/40',
  'from-cyan to-cyan/40',
  'from-cyan to-cyan/40',
  'from-cyan to-cyan/40',
  'from-cyan to-cyan/40',
  'from-amber to-amber/40',
  'from-green to-green/40',
];

export const BarChart: React.FC = () => {
  return (
    <div className="flex items-end gap-1 md:gap-2 h-20">
      {days.map((day, index) => (
        <div key={day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <div
            className={`w-full rounded-t-sm bg-gradient-to-t ${colors[index]}`}
            style={{ height: `${heights[index]}%` }}
          />
          <div className="font-mono text-[8px] text-text-muted">{day}</div>
        </div>
      ))}
    </div>
  );
}; 
