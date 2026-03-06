import React from 'react';

const fillerWords = [
  { word: 'um', count: 9, percentage: 75 },
  { word: 'uh', count: 3, percentage: 25 },
  { word: 'like', count: 0, percentage: 0 },
  { word: 'you know', count: 0, percentage: 0 },
];

export const FillerWordsList: React.FC = () => {
  return (
    <div className="flex flex-col gap-2">
      {fillerWords.map((item) => (
        <div key={item.word} className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] text-text-primary min-w-[50px]">{item.word}</span>
          <div className="flex-1 h-1.5 bg-bg-surface rounded-sm overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber to-amber/50 rounded-sm"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-text-muted min-w-[24px] text-right">
            {item.count}×
          </span>
        </div>
      ))}
    </div>
  );
}; 
