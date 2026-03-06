import React from 'react';

type TagColor = 'cyan' | 'amber' | 'green' | 'red' | 'purple';

interface TagProps {
  children: React.ReactNode;
  color?: TagColor;
  className?: string;
}

const colorClasses: Record<TagColor, string> = {
  cyan: 'text-cyan border-cyan/40 bg-cyan-ghost',
  amber: 'text-amber border-amber/40 bg-amber-dim',
  green: 'text-green border-green/40 bg-green-dim',
  red: 'text-red border-red/40 bg-red-dim',
  purple: 'text-purple border-purple/40 bg-purple/8',
};

export const Tag: React.FC<TagProps> = ({ children, color = 'cyan', className = '' }) => {
  return (
    <span
      className={`font-mono text-[10px] font-medium tracking-wider uppercase px-2 py-1 rounded-sm border ${colorClasses[color]} ${className}`}
    >
      {children}
    </span>
  );
}; 
