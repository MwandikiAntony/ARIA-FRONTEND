import React from 'react';

export const GPSWidget: React.FC = () => {
  return (
    <>
      <div className="bg-bg-surface border border-border rounded-md p-4">
        <div className="font-mono text-[9px] text-text-muted tracking-wider uppercase mb-1.5">Coordinates</div>
        <div className="font-mono text-[11px] text-cyan leading-relaxed">
          37.7749° N
          <br />
          122.4194° W
        </div>
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="relative">
            <div className="w-1.5 h-1.5 rounded-full bg-green shadow-[0_0_6px_#00e676]" />
            <div className="absolute inset-[-3px] rounded-full bg-green/50 animate-pulse-ring" />
          </div>
          <span className="font-mono text-[10px] text-green">±4m accuracy</span>
        </div>
      </div>
      <div className="flex gap-2 mt-1">
        <span className="tag tag-green !text-[9px]">OUTDOOR</span>
        <span className="tag tag-cyan !text-[9px]">AUTO-DETECT</span>
      </div>
    </>
  );
}; 
