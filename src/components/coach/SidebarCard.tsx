import React from 'react';

interface SidebarCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const SidebarCard: React.FC<SidebarCardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-bg-card border border-border rounded-xl p-5 ${className}`}>
      <div className="font-mono text-[10px] tracking-widest uppercase text-text-muted mb-4">
        {title}
      </div>
      {children}
    </div>
  );
};