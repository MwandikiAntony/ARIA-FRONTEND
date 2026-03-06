import React from 'react';
import { Tag } from '@/components/ui/Tag';

export const HapticPatterns: React.FC = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between p-2 border-l-2 border-cyan bg-bg-surface rounded-sm">
        <span className="text-[11px] text-text-primary">⟫⟫⟫ Turn Right</span>
        <Tag color="cyan" className="!text-[8px]">
          Active
        </Tag>
      </div>
      <div className="flex items-center justify-between p-2 border-l-2 border-text-muted bg-bg-surface rounded-sm opacity-50">
        <span className="text-[11px] text-text-primary">▐▐ Stop</span>
        <span className="font-mono text-[10px] text-text-muted">Standby</span>
      </div>
      <div className="flex items-center justify-between p-2 border-l-2 border-text-muted bg-bg-surface rounded-sm opacity-50">
        <span className="text-[11px] text-text-primary">▓▓▓ Obstacle</span>
        <span className="font-mono text-[10px] text-text-muted">Standby</span>
      </div>
    </div>
  );
}; 
