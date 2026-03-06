import React from 'react';

interface SettingsGroupProps {
  title: string;
  titleColor?: 'cyan' | 'amber';
  children: React.ReactNode;
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({ 
  title, 
  titleColor = 'cyan', 
  children 
}) => {
  return (
    <div>
      <div 
        className={`font-mono text-[10px] tracking-widest uppercase mb-2 ${
          titleColor === 'cyan' ? 'text-cyan' : 'text-amber'
        }`}
      >
        {title}
      </div>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}; 
