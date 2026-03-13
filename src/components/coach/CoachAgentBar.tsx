'use client';

/**
 * CoachAgentBar.tsx
 *
 * WHY THIS FILE EXISTS:
 * The product requirement is a permanent floating bar pinned just below the
 * navbar (top-16 = 64px) on the coach page only. It is NOT in layout.tsx
 * (which would make it appear on every page) — it's rendered at the top of
 * coach/page.tsx with position:fixed so it doesn't affect page layout flow.
 *
 * WHAT IT SHOWS:
 * - Left: ARIA coach badge + current coach mode label
 * - Center: Animated waveform when speaking, transcript text, idle pulse when listening
 * - Right: Mute, Pause/Resume, Switch-to-Navigation controls
 *
 * PROPS come from useCoachSession so all state is real, not simulated.
 */

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { CoachMode } from '@/lib/types/coach.types';
import type { CoachSessionPhase } from '@/lib/types/coach.types';

interface CoachAgentBarProps {
  phase: CoachSessionPhase;
  mode: CoachMode | null;
  isSpeaking: boolean;
  isListening: boolean;
  isMuted: boolean;
  transcript: string;
  elapsedSeconds: number;
  onToggleMute: () => void;
  onPause: () => void;
  onResume: () => void;
  onSwitchToNavigation: () => void;
}

const MODE_LABELS: Record<CoachMode, string> = {
  interview: 'Interview',
  presentation: 'Presentation',
  music: 'Music Performance',
  mc: 'MC / Public Speaking',
  sermon: 'Sermon',
  negotiation: 'Negotiation',
};

const MODE_COLORS: Record<CoachMode, string> = {
  interview: '#00e5ff',
  presentation: '#ffab00',
  music: '#e040fb',
  mc: '#00e676',
  sermon: '#ff6d00',
  negotiation: '#ff4081',
};

export const CoachAgentBar: React.FC<CoachAgentBarProps> = ({
  phase,
  mode,
  isSpeaking,
  isListening,
  isMuted,
  transcript,
  elapsedSeconds,
  onToggleMute,
  onPause,
  onResume,
  onSwitchToNavigation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const router = useRouter();

  const isPaused = phase === 'paused';
  const isActive = phase === 'active';
  const modeColor = mode ? MODE_COLORS[mode] : '#00e5ff';

  // ── Waveform canvas animation ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      if (isSpeaking && !isMuted) {
        // Active waveform — multiple sine waves
        const bars = 28;
        const barW = 2;
        const gap = (W - bars * barW) / (bars + 1);

        for (let i = 0; i < bars; i++) {
          const x = gap + i * (barW + gap);
          const phase1 = (i / bars) * Math.PI * 2;
          const amp = 0.3 + 0.7 * Math.abs(Math.sin(t * 3 + phase1));
          const barH = 4 + amp * (H - 8);

          ctx.fillStyle = modeColor;
          ctx.globalAlpha = 0.6 + amp * 0.4;
          ctx.beginPath();
          ctx.roundRect(x, (H - barH) / 2, barW, barH, 1);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        t += 0.04;
      } else if (isListening && !isMuted) {
        // Subtle idle pulse — low amplitude bars
        const bars = 28;
        const barW = 2;
        const gap = (W - bars * barW) / (bars + 1);

        for (let i = 0; i < bars; i++) {
          const x = gap + i * (barW + gap);
          const amp = 0.1 + 0.15 * Math.abs(Math.sin(t * 1.2 + i * 0.3));
          const barH = 2 + amp * 12;

          ctx.fillStyle = modeColor;
          ctx.globalAlpha = 0.25 + amp * 0.3;
          ctx.beginPath();
          ctx.roundRect(x, (H - barH) / 2, barW, barH, 1);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        t += 0.02;
      } else {
        // Muted / paused — flat line
        ctx.strokeStyle = modeColor;
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSpeaking, isListening, isMuted, modeColor]);

  // ── Format timer ──────────────────────────────────────────────────────────
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // ── Status text ───────────────────────────────────────────────────────────
  const statusText = (() => {
    if (phase === 'idle' || phase === 'selecting') return 'Select a coaching mode to begin';
    if (phase === 'ready') return 'Ready — tap Start Session to activate ARIA';
    if (isMuted) return 'Muted — ARIA is watching silently';
    if (isPaused) return 'Session paused';
    if (isSpeaking && transcript) return transcript;
    if (isSpeaking) return 'ARIA is speaking…';
    if (isListening) return 'Listening…';
    return 'ARIA Coach is ready';
  })();

  return (
    <div
      className="fixed left-0 right-0 z-40 bg-bg-deep/95 backdrop-blur-xl border-b border-border"
      style={{ top: '64px' }}  /* sits exactly below the 64px navbar */
    >
      <div className="flex items-center gap-3 px-4 md:px-8 h-12">

        {/* ── Left: Mode badge ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          {/* ARIA Coach label */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: modeColor,
                boxShadow: isActive ? `0 0 6px ${modeColor}` : 'none',
              }}
            />
            <span
              className="font-mono text-[10px] tracking-widest uppercase hidden sm:inline"
              style={{ color: modeColor }}
            >
              ARIA Coach
            </span>
          </div>

          {/* Mode tag */}
          {mode && (
            <span
              className="font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-sm border hidden md:inline"
              style={{
                color: modeColor,
                borderColor: `${modeColor}30`,
                backgroundColor: `${modeColor}10`,
              }}
            >
              {MODE_LABELS[mode]}
            </span>
          )}

          {/* Timer */}
          {isActive && (
            <span className="font-mono text-[10px] text-text-muted">
              {formatTime(elapsedSeconds)}
            </span>
          )}
        </div>

        {/* ── Center: Waveform + transcript ────────────────────────────── */}
        <div className="flex-1 flex items-center gap-3 min-w-0 overflow-hidden">
          {/* Waveform */}
          <canvas
            ref={canvasRef}
            width={120}
            height={32}
            className="shrink-0"
          />

          {/* Transcript / status text */}
          <p
            className="font-mono text-[11px] text-text-muted truncate"
            title={statusText}
          >
            {statusText}
          </p>
        </div>

        {/* ── Right: Controls ───────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Mute toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute ARIA' : 'Mute ARIA'}
            className={`
              w-8 h-8 rounded-full border flex items-center justify-center text-sm
              transition-all duration-200
              ${isMuted
                ? 'border-red/50 text-red bg-red/10 hover:bg-red/20'
                : 'border-border-bright text-text-secondary hover:border-cyan hover:text-cyan hover:bg-cyan-ghost'
              }
            `}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Pause / Resume */}
          {isActive && (
            <button
              onClick={onPause}
              title="Pause session"
              className="w-8 h-8 rounded-full border border-amber/40 text-amber bg-amber/10 hover:bg-amber/20 flex items-center justify-center text-xs transition-all duration-200"
            >
              ⏸
            </button>
          )}
          {isPaused && (
            <button
              onClick={onResume}
              title="Resume session"
              className="w-8 h-8 rounded-full border border-green/40 text-green bg-green/10 hover:bg-green/20 flex items-center justify-center text-xs transition-all duration-200"
            >
              ▶
            </button>
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

          {/* Switch to Navigation */}
          <button
            onClick={onSwitchToNavigation}
            title="Switch to Navigation mode"
            className="hidden sm:flex items-center gap-1.5 px-2.5 h-7 rounded-sm border border-border-bright text-text-muted hover:border-cyan hover:text-cyan hover:bg-cyan-ghost font-mono text-[9px] tracking-wider uppercase transition-all duration-200"
          >
            <span>◉</span>
            <span className="hidden lg:inline">Navigate</span>
          </button>
        </div>
      </div>
    </div>
  );
};