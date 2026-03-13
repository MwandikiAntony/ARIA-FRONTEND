'use client';

/**
 * src/components/assist/TaskShortcuts.tsx
 * Quick-launch task shortcuts shown on idle and as a slide-in panel.
 */

import React from 'react';

interface TaskShortcut {
  icon: string;
  label: string;
  query: string;
  color: string;
}

const SHORTCUTS: TaskShortcut[] = [
  { icon: '🍳', label: 'Cooking',    query: 'Help me cook this recipe',         color: 'rgba(251,146,60,0.15)'  },
  { icon: '🧹', label: 'Cleaning',   query: 'Help me clean this area',          color: 'rgba(52,211,153,0.12)'  },
  { icon: '📐', label: 'Design',     query: 'Help me with this design task',    color: 'rgba(139,92,246,0.15)'  },
  { icon: '📚', label: 'Homework',   query: 'Help me with this assignment',     color: 'rgba(59,130,246,0.15)'  },
  { icon: '🔧', label: 'Repair',     query: 'Help me fix or repair this',       color: 'rgba(251,191,36,0.12)'  },
  { icon: '📦', label: 'Organise',   query: 'Help me organise and arrange this',color: 'rgba(236,72,153,0.12)'  },
  { icon: '🛒', label: 'Shopping',   query: 'Help me decide on this purchase',  color: 'rgba(52,211,153,0.10)'  },
  { icon: '✍️', label: 'Writing',    query: 'Help me write or edit this',       color: 'rgba(99,102,241,0.15)'  },
  { icon: '🎨', label: 'Crafts',     query: 'Help me with this craft project',  color: 'rgba(251,146,60,0.12)'  },
  { icon: '💡', label: 'Learn',      query: 'Help me understand how this works',color: 'rgba(234,179,8,0.12)'   },
  { icon: '🏃', label: 'Exercise',   query: 'Help me with this exercise',       color: 'rgba(52,211,153,0.12)'  },
  { icon: '🆘', label: 'Any help',   query: 'I need help with something',       color: 'rgba(239,68,68,0.12)'   },
];

interface TaskShortcutsProps {
  onSelect: (query: string, label: string) => void;
  compact?: boolean;
}

export const TaskShortcuts: React.FC<TaskShortcutsProps> = ({ onSelect, compact }) => {
  return (
    <div className={`grid gap-2 ${compact ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-4'}`}>
      {SHORTCUTS.map((s) => (
        <button
          key={s.label}
          onClick={() => onSelect(s.query, s.label)}
          className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
          style={{
            background: s.color,
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span className={compact ? 'text-lg' : 'text-2xl'}>{s.icon}</span>
          <span
            className={`font-medium text-white/75 ${compact ? 'text-[10px]' : 'text-xs'}`}
          >
            {s.label}
          </span>
        </button>
      ))}
    </div>
  );
};
