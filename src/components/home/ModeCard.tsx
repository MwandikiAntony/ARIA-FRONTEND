 import React from 'react';
import { Tag } from '@/components/ui/Tag';

interface ModeCardProps {
  type: 'nav' | 'coach';
  title: string;
  description: string;
  tags: string[];
  icon: string;
  isActive: boolean;
  onSelect: () => void;
}

export const ModeCard: React.FC<ModeCardProps> = ({
  type,
  title,
  description,
  tags,
  icon,
  isActive,
  onSelect,
}) => {
  const isNav = type === 'nav';
  const colors = isNav
    ? {
        border: isActive ? 'border-cyan' : 'border-border',
        shadow: isActive ? 'shadow-[0_0_0_1px_rgba(0,229,255,0.2),0_20px_40px_rgba(0,0,0,0.4),0_0_60px_rgba(0,229,255,0.08)]' : '',
        iconBg: 'bg-cyan-ghost',
        iconBorder: 'border-cyan/25',
        title: 'text-cyan',
      }
    : {
        border: isActive ? 'border-amber' : 'border-border',
        shadow: isActive ? 'shadow-[0_0_0_1px_rgba(255,171,0,0.2),0_20px_40px_rgba(0,0,0,0.4),0_0_60px_rgba(255,171,0,0.08)]' : '',
        iconBg: 'bg-amber-dim',
        iconBorder: 'border-amber/25',
        title: 'text-amber',
      };

  return (
    <div
      onClick={onSelect}
      className={`
        bg-bg-card rounded-2xl p-7 cursor-pointer transition-all duration-500 relative overflow-hidden
        border ${colors.border} hover:-translate-y-1
        ${isActive ? colors.shadow : ''}
        ${isNav ? 'nav-mode' : 'coach-mode'}
      `}
    >
      <div
        className={`
          absolute inset-0 opacity-0 transition-opacity duration-500
          ${isNav ? 'bg-gradient-to-br from-cyan/6 to-transparent' : 'bg-gradient-to-br from-amber/6 to-transparent'}
          ${isActive ? 'opacity-100' : ''}
        `}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-md flex items-center justify-center text-2xl ${colors.iconBg} border ${colors.iconBorder}`}
          >
            {icon}
          </div>
          <Tag color={isNav ? 'cyan' : 'amber'}>{isActive ? 'Active' : 'Ready'}</Tag>
        </div>

        <h3 className={`font-display text-2xl font-bold tracking-wide mb-1.5 ${colors.title}`}>{title}</h3>
        <p className="text-sm font-light leading-relaxed text-text-secondary mb-5">{description}</p>

        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Tag key={tag} color={isNav ? 'cyan' : tag === 'AI Insight' ? 'purple' : 'amber'}>
              {tag}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
};
