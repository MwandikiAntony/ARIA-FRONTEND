import React from 'react';

interface HUDPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const HUDPanel: React.FC<HUDPanelProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col gap-4 ${className}`}>
      <div className="font-mono text-[10px] tracking-widest uppercase text-text-muted pb-3 border-b border-border">
        {title}
      </div>
      {children}
    </div>
  );
}; 
