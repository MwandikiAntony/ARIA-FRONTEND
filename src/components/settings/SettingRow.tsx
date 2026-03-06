import React from 'react';
import { Toggle } from '@/components/ui/Toggle';

interface SettingRowProps {
  name: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const SettingRow: React.FC<SettingRowProps> = ({ 
  name, 
  description, 
  checked, 
  onChange 
}) => {
  return (
    <div className="flex items-center justify-between p-3.5 md:p-4 bg-bg-surface rounded-md border border-border">
      <div className="flex-1 pr-4">
        <div className="text-sm font-medium text-text-primary mb-0.5">{name}</div>
        <div className="font-mono text-[10px] text-text-muted">{description}</div>
      </div>
      <Toggle initial={checked} onChange={onChange} />
    </div>
  );
};
