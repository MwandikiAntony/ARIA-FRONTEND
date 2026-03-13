'use client';

/**
 * src/components/assist/AssistTranscript.tsx
 * Live scrolling transcript panel below the video feed.
 */

import React, { useEffect, useRef } from 'react';
import type { TranscriptEntry } from '@/hooks/useAssistSession';

interface AssistTranscriptProps {
  entries: TranscriptEntry[];
  isSpeaking: boolean;
}

export const AssistTranscript: React.FC<AssistTranscriptProps> = ({
  entries,
  isSpeaking,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(10,15,10,0.8)',
        border: '1px solid rgba(52,211,153,0.12)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid rgba(52,211,153,0.08)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-white/40">
            Transcript
          </span>
          {isSpeaking && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#34d399', animation: 'pulse 1s infinite' }}
            />
          )}
        </div>
        <span className="text-[10px] text-white/25 font-mono">
          {entries.length} {entries.length === 1 ? 'message' : 'messages'}
        </span>
      </div>

      {/* Messages */}
      <div className="overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: '200px' }}>
        {entries.length === 0 ? (
          <p className="text-xs text-white/25 italic text-center py-4">
            Transcript will appear here once the session starts...
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex gap-3 items-start">
              {/* Role badge */}
              <span
                className="text-[10px] font-mono font-bold uppercase mt-0.5 shrink-0 w-10 text-right"
                style={{
                  color: entry.role === 'aria' ? '#34d399' : 'rgba(255,255,255,0.5)',
                }}
              >
                {entry.role === 'aria' ? 'ARIA' : 'You'}
              </span>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: entry.role === 'aria'
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(255,255,255,0.55)',
                  }}
                >
                  {entry.text}
                </p>
                <span className="text-[10px] text-white/20 font-mono mt-0.5 block">
                  {formatTime(entry.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
