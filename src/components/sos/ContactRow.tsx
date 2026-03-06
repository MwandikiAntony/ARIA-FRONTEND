import React from 'react';

interface ContactRowProps {
  initials: string;
  name: string;
  role: string;
  color: string;
  status: 'active' | 'standby';
}

export const ContactRow: React.FC<ContactRowProps> = ({
  initials,
  name,
  role,
  color,
  status,
}) => {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-display font-bold text-sm text-white flex-shrink-0`}>
        {initials}
      </div>
      
      <div className="flex-1">
        <div className="text-sm font-medium text-text-primary">{name}</div>
        <div className="font-mono text-[9px] text-text-muted uppercase tracking-wider">{role}</div>
      </div>
      
      <div className="flex items-center gap-1.5 font-mono text-[9px]">
        <div className="relative">
          <div className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green' : 'bg-cyan'}`} />
          <div className={`absolute inset-[-3px] rounded-full ${status === 'active' ? 'bg-green' : 'bg-cyan'} animate-pulse-ring`} />
        </div>
        <span className={status === 'active' ? 'text-green' : 'text-cyan'}>
          {status === 'active' ? 'Active' : 'On standby'}
        </span>
      </div>
    </div>
  );
}; 
