import React from 'react';
import { Tag } from '@/components/ui/Tag';

interface ModeCardProps {
  type: 'nav' | 'coach' | 'assist';
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
  const colors =
    type === 'nav'
      ? {
          border: isActive ? 'border-cyan' : 'border-border',
          shadow: isActive
            ? 'shadow-[0_0_0_1px_rgba(0,229,255,0.2),0_20px_40px_rgba(0,0,0,0.4),0_0_60px_rgba(0,229,255,0.08)]'
            : '',
          iconBg: 'bg-cyan-ghost',
          iconBorder: 'border-cyan/25',
          title: 'text-cyan',
          gradient: 'from-cyan/6',
          tagColor: 'cyan' as const,
        }
      : type === 'coach'
      ? {
          border: isActive ? 'border-amber' : 'border-border',
          shadow: isActive
            ? 'shadow-[0_0_0_1px_rgba(255,171,0,0.2),0_20px_40px_rgba(0,0,0,0.4),0_0_60px_rgba(255,171,0,0.08)]'
            : '',
          iconBg: 'bg-amber-dim',
          iconBorder: 'border-amber/25',
          title: 'text-amber',
          gradient: 'from-amber/6',
          tagColor: 'amber' as const,
        }
      : {
          border: isActive ? 'border-emerald-500' : 'border-border',
          shadow: isActive
            ? 'shadow-[0_0_0_1px_rgba(52,211,153,0.2),0_20px_40px_rgba(0,0,0,0.4),0_0_60px_rgba(52,211,153,0.08)]'
            : '',
          iconBg: 'bg-emerald-950/40',
          iconBorder: 'border-emerald-500/25',
          title: 'text-emerald-400',
          gradient: 'from-emerald-500/6',
          tagColor: 'cyan' as const,   // closest available tag color
        };

  return (
    <div
      onClick={onSelect}
      className={`
        bg-bg-card rounded-2xl p-7 cursor-pointer transition-all duration-500 relative overflow-hidden
        border ${colors.border} hover:-translate-y-1
        ${isActive ? colors.shadow : ''}
      `}
    >
      <div
        className={`
          absolute inset-0 opacity-0 transition-opacity duration-500
          bg-gradient-to-br ${colors.gradient} to-transparent
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
          <Tag color={colors.tagColor}>{isActive ? 'Active' : 'Ready'}</Tag>
        </div>

        <h3 className={`font-display text-2xl font-bold tracking-wide mb-1.5 ${colors.title}`}>
          {title}
        </h3>
        <p className="text-sm font-light leading-relaxed text-text-secondary mb-5">
          {description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Tag key={tag} color={colors.tagColor}>
              {tag}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
};