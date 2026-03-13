'use client';

/**
 * src/components/assist/AssistSidebar.tsx
 * Right sidebar: Steps breakdown, Timeline, Session Notes, Export.
 */

import React, { useState } from 'react';
import type { TaskStep, TimelineEvent } from '@/hooks/useAssistSession';

interface AssistSidebarProps {
  steps: TaskStep[];
  timeline: TimelineEvent[];
  sessionNotes: string;
  sessionDuration: number;
  taskTitle: string;
  onToggleStep: (id: string) => void;
  onUpdateNotes: (notes: string) => void;
  onExport: () => void;
}

type SidebarTab = 'steps' | 'timeline' | 'notes';

const EVENT_COLORS: Record<TimelineEvent['type'], string> = {
  info:  'rgba(52,211,153,0.6)',
  step:  'rgba(99,102,241,0.8)',
  warn:  'rgba(251,191,36,0.8)',
  good:  'rgba(52,211,153,1)',
};

const EVENT_BG: Record<TimelineEvent['type'], string> = {
  info:  'rgba(52,211,153,0.08)',
  step:  'rgba(99,102,241,0.10)',
  warn:  'rgba(251,191,36,0.08)',
  good:  'rgba(52,211,153,0.12)',
};

export const AssistSidebar: React.FC<AssistSidebarProps> = ({
  steps,
  timeline,
  sessionNotes,
  taskTitle,
  onToggleStep,
  onUpdateNotes,
  onExport,
}) => {
  const [tab, setTab] = useState<SidebarTab>('steps');
  const completedSteps = steps.filter((s) => s.done).length;

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(10,15,10,0.85)',
        border: '1px solid rgba(52,211,153,0.12)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(52,211,153,0.08)' }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2
              className="text-sm font-bold tracking-wide"
              style={{ color: '#34d399' }}
            >
              {taskTitle || 'Current Task'}
            </h2>
            {steps.length > 0 && (
              <p className="text-[11px] text-white/30 mt-0.5">
                {completedSteps}/{steps.length} steps done
              </p>
            )}
          </div>
          <button
            onClick={onExport}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:brightness-110"
            style={{
              background: 'rgba(52,211,153,0.12)',
              border: '1px solid rgba(52,211,153,0.2)',
              color: '#34d399',
            }}
            title="Export session"
          >
            ⬇ Export
          </button>
        </div>

        {/* Step progress bar */}
        {steps.length > 0 && (
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: '3px', background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(completedSteps / steps.length) * 100}%`,
                background: 'linear-gradient(90deg, #34d399, #6ee7b7)',
              }}
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        className="flex"
        style={{ borderBottom: '1px solid rgba(52,211,153,0.08)' }}
      >
        {(['steps', 'timeline', 'notes'] as SidebarTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-xs font-medium capitalize transition-all"
            style={{
              color: tab === t ? '#34d399' : 'rgba(255,255,255,0.3)',
              borderBottom: tab === t ? '2px solid #34d399' : '2px solid transparent',
              background: tab === t ? 'rgba(52,211,153,0.05)' : 'transparent',
            }}
          >
            {t === 'steps' && `Steps${steps.length ? ` (${steps.length})` : ''}`}
            {t === 'timeline' && `Timeline${timeline.length ? ` (${timeline.length})` : ''}`}
            {t === 'notes' && 'Notes'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* Steps tab */}
        {tab === 'steps' && (
          <div className="p-4 space-y-2">
            {steps.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-xs text-white/30">
                  ARIA will break down your task into steps as you work
                </p>
              </div>
            ) : (
              steps.map((step, i) => (
                <button
                  key={step.id}
                  onClick={() => onToggleStep(step.id)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all hover:brightness-110"
                  style={{
                    background: step.done
                      ? 'rgba(52,211,153,0.08)'
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${step.done ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {/* Step number / check */}
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold"
                    style={{
                      background: step.done
                        ? 'rgba(52,211,153,0.3)'
                        : 'rgba(255,255,255,0.06)',
                      color: step.done ? '#34d399' : 'rgba(255,255,255,0.3)',
                      border: `1px solid ${step.done ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    {step.done ? '✓' : i + 1}
                  </div>

                  <span
                    className="text-xs leading-relaxed flex-1"
                    style={{
                      color: step.done ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)',
                      textDecoration: step.done ? 'line-through' : 'none',
                    }}
                  >
                    {step.text}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Timeline tab */}
        {tab === 'timeline' && (
          <div className="p-4">
            {timeline.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">🕐</div>
                <p className="text-xs text-white/30">Events will appear here as your session progresses</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical line */}
                <div
                  className="absolute left-3 top-0 bottom-0 w-px"
                  style={{ background: 'rgba(52,211,153,0.1)' }}
                />
                <div className="space-y-3 pl-8">
                  {timeline.map((event) => (
                    <div key={event.id} className="relative">
                      {/* Dot */}
                      <div
                        className="absolute -left-5 top-1.5 w-2 h-2 rounded-full"
                        style={{ background: EVENT_COLORS[event.type] }}
                      />
                      <div
                        className="p-2.5 rounded-lg"
                        style={{ background: EVENT_BG[event.type] }}
                      >
                        <p className="text-xs text-white/75 leading-relaxed">
                          {event.text}
                        </p>
                        <span className="text-[10px] text-white/25 font-mono mt-1 block">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes tab */}
        {tab === 'notes' && (
          <div className="p-4 h-full flex flex-col">
            <p className="text-[11px] text-white/30 mb-3">
              Your personal notes for this session. Saved on export.
            </p>
            <textarea
              value={sessionNotes}
              onChange={(e) => onUpdateNotes(e.target.value)}
              placeholder="Type notes here..."
              className="flex-1 resize-none text-sm leading-relaxed rounded-xl p-3 outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(52,211,153,0.1)',
                color: 'rgba(255,255,255,0.75)',
                caretColor: '#34d399',
                minHeight: '200px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(52,211,153,0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(52,211,153,0.1)';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
