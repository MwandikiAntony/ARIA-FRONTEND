'use client';

/**
 * src/components/assist/AssistAgentBar.tsx
 *
 * Fixed bar below the navbar. Shows waveform, ARIA state, task title,
 * timer, mute/pause/end controls. Same pattern as CoachAgentBar.
 */

import React, { useEffect, useRef } from 'react';
import { AssistSessionPhase, formatDuration } from '@/hooks/useAssistSession';

interface AssistAgentBarProps {
  phase: AssistSessionPhase;
  taskTitle: string;
  sessionDuration: number;
  isSpeaking: boolean;
  isMuted: boolean;
  transcript: string;
  onToggleMute: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}

export const AssistAgentBar: React.FC<AssistAgentBarProps> = ({
  phase,
  taskTitle,
  sessionDuration,
  isSpeaking,
  isMuted,
  transcript,
  onToggleMute,
  onPause,
  onResume,
  onEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef(phase);
  const isSpeakingRef = useRef(isSpeaking);
  const isMutedRef = useRef(isMuted);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // ── Waveform animation ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const bars = 32;
      const barW = 2;
      const gap = (W - bars * barW) / (bars + 1);
      const speaking = isSpeakingRef.current;
      const muted = isMutedRef.current;
      const active = phaseRef.current === 'active';

      for (let i = 0; i < bars; i++) {
        const x = gap + i * (barW + gap);
        let h: number;

        if (muted || !active) {
          h = 2;
        } else if (speaking) {
          h = (Math.sin(t * 3 + i * 0.5) * 0.5 + 0.5) * (H * 0.75) + 3;
        } else {
          h = (Math.sin(t * 1.2 + i * 0.8) * 0.5 + 0.5) * (H * 0.2) + 2;
        }

        const alpha = muted ? 0.2 : speaking ? 0.9 : 0.4;
        ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, (H - h) / 2, barW, h, 1);
        ctx.fill();
      }

      t += 0.04;
      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  if (phase === 'idle' || phase === 'ended') return null;

  return (
    <div
      className="fixed left-0 right-0 z-40 flex items-center px-4 py-2 gap-3"
      style={{
        top: '64px',
        background: 'rgba(10,14,10,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(52,211,153,0.15)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
        height: '48px',
      }}
    >
      {/* Left: ARIA label + task */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <span
          className="text-xs font-mono font-bold tracking-widest uppercase"
          style={{ color: '#34d399' }}
        >
          ARIA
        </span>
        <span className="text-xs text-white/30">•</span>
        <span
          className="text-xs font-medium truncate max-w-[140px]"
          style={{ color: '#34d399cc' }}
        >
          {taskTitle || 'Assist'}
        </span>
        {phase === 'paused' && (
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider"
            style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
          >
            PAUSED
          </span>
        )}
      </div>

      {/* Center: waveform + transcript */}
      <div className="flex-1 flex items-center gap-3 min-w-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={120}
          height={32}
          className="shrink-0"
          style={{ imageRendering: 'pixelated' }}
        />
        {transcript && (
          <span className="text-xs text-white/50 truncate font-light italic">
            {transcript}
          </span>
        )}
      </div>

      {/* Right: timer + controls */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-mono text-white/40 tabular-nums">
          {formatDuration(sessionDuration)}
        </span>

        {/* Mute */}
        <button
          onClick={onToggleMute}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{
            background: isMuted
              ? 'rgba(239,68,68,0.2)'
              : 'rgba(52,211,153,0.12)',
            border: `1px solid ${isMuted ? 'rgba(239,68,68,0.4)' : 'rgba(52,211,153,0.25)'}`,
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <span className="text-xs">{isMuted ? '🔇' : '🎤'}</span>
        </button>

        {/* Pause / Resume */}
        {phase === 'active' ? (
          <button
            onClick={onPause}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            title="Pause"
          >
            <span className="text-xs">⏸</span>
          </button>
        ) : (
          <button
            onClick={onResume}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
            style={{
              background: 'rgba(52,211,153,0.15)',
              border: '1px solid rgba(52,211,153,0.3)',
            }}
            title="Resume"
          >
            <span className="text-xs">▶</span>
          </button>
        )}

        {/* End */}
        <button
          onClick={onEnd}
          className="px-3 h-7 rounded-full flex items-center gap-1.5 text-[11px] font-medium transition-all"
          style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#f87171',
          }}
        >
          <span>■</span>
          End
        </button>
      </div>
    </div>
  );
};
