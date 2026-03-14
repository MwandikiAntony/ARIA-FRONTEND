'use client';

import React from 'react';
import type { IntroState } from '@/hooks/useAriaIntro';
import type { Environment } from '@/hooks/useGeolocation';

interface NavigationAgentBarProps {
  introState: IntroState;
  isSpeaking: boolean;
  isListening: boolean;
  transcript: string;
  environment: Environment;
  gpsAccuracy: number | null;
  onMute: () => void;
  onUnmute: () => void;
  onStop: () => void;
  onEnableVoice: () => void;
  onDisableVoice: () => void;
  onPause: () => void;
  onResume: () => void;
}

function SpeakingWave() {
  return (
    <div className="flex items-center gap-[3px] h-4" aria-hidden="true">
      {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-cyan animate-pulse"
          style={{
            height: `${h * 3 + 4}px`,
            animationDelay: `${i * 80}ms`,
            animationDuration: '600ms',
          }}
        />
      ))}
    </div>
  );
}

function ListeningDot() {
  return (
    <span className="relative flex h-2 w-2" aria-hidden="true">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan" />
    </span>
  );
}

function statusLabel(
  state: IntroState,
  isListening: boolean,
  isSpeaking: boolean,
  environment: Environment,
  gpsAccuracy: number | null,
): string {
  if (isSpeaking) return 'ARIA is guiding';
  if (isListening && state === 'active') return 'Listening…';
  const gpsStr = gpsAccuracy !== null ? ` · GPS ±${Math.round(gpsAccuracy)}m` : '';
  const envStr = environment !== 'unknown' ? ` · ${environment.toUpperCase()}` : '';
  switch (state) {
    case 'waiting':           return 'Initialising…';
    case 'ready_to_activate': return 'ARIA Navigation — Ready';
    case 'active':            return `Navigation Active${envStr}${gpsStr}`;
    case 'muted':             return `Muted${envStr}${gpsStr}`;
    case 'paused':            return 'Paused';
    case 'stopped':           return 'Session ended — tap to restart';
    default:                  return 'ARIA Navigation';
  }
}

export const NavigationAgentBar: React.FC<NavigationAgentBarProps> = ({
  introState,
  isSpeaking,
  isListening,
  transcript,
  environment,
  gpsAccuracy,
  onMute,
  onUnmute,
  onStop,
  onEnableVoice,
  onDisableVoice,
  onPause,
  onResume,
}) => {
  if (introState === 'idle') return null;

  const isActuallyActive = isSpeaking || isListening;
  const isStopped = introState === 'stopped' && !isActuallyActive;
  const isPersistentActive = introState === 'active' || introState === 'muted' || isActuallyActive;
  const gpsLocked = gpsAccuracy !== null && gpsAccuracy <= 20;

  const envDotColor =
    environment === 'indoor'  ? 'bg-amber' :
    environment === 'outdoor' ? 'bg-green'  :
    'bg-cyan/40 animate-pulse';

  return (
    <div
      role="region"
      aria-label="ARIA Navigation Agent"
      aria-live="polite"
      className={`
        fixed top-16 left-0 right-0 z-40
        flex items-center justify-between
        px-4 md:px-8 py-2.5
        border-b border-cyan/20
        bg-bg-deep/95 backdrop-blur-md
        transition-opacity duration-300
        ${isStopped ? 'opacity-80' : 'opacity-100'}
      `}
    >
      {/* Left: status indicator + label + transcript */}
      <div className="flex items-center gap-3 min-w-0">

        {isSpeaking && <SpeakingWave />}

        {!isSpeaking && isListening && introState === 'active' && <ListeningDot />}

        {!isSpeaking && introState === 'muted' && (
          <span className="w-2 h-2 rounded-full bg-gray-500" aria-hidden="true" />
        )}

        {introState === 'waiting' && (
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" aria-hidden="true" />
        )}

        {(introState === 'ready_to_activate' || isStopped) && !isSpeaking && (
          <span className="w-2 h-2 rounded-full bg-cyan/60" aria-hidden="true" />
        )}

        {introState === 'active' && !isSpeaking && !isListening && (
          <span className={`w-2 h-2 rounded-full ${envDotColor}`} aria-hidden="true" />
        )}

        <span className="font-display text-sm font-bold text-cyan tracking-wider mr-1">
          ⬡ ARIA
        </span>

        <span className="text-xs font-mono text-text-secondary whitespace-nowrap">
          {statusLabel(introState, isListening, isSpeaking, environment, gpsAccuracy)}
        </span>

        {gpsLocked && (
          <span className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-green">
            <span className="w-1.5 h-1.5 rounded-full bg-green shadow-[0_0_6px_#00e676]" />
            GPS LOCKED
          </span>
        )}

        {transcript && (isPersistentActive || isSpeaking) && (
          <span className="hidden sm:block text-xs text-text-muted italic max-w-xs truncate">
            &quot;{transcript}&quot;
          </span>
        )}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {isStopped && (
          <span className="text-xs text-text-muted font-mono">Session ended</span>
        )}

        {introState === 'active' && (
          <button
            onClick={onMute}
            className="px-3 py-1.5 rounded-full border border-border bg-bg-card text-text-secondary text-xs font-semibold hover:border-amber/40 hover:text-amber transition-colors"
          >
            🔇 Mute
          </button>
        )}

        {introState === 'muted' && (
          <button
            onClick={onUnmute}
            className="px-3 py-1.5 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-xs font-semibold hover:bg-cyan/20 transition-colors"
          >
            🔊 Unmute
          </button>
        )}

        {(isSpeaking || introState === 'waiting') && (
          <>
            <button
              onClick={isListening ? onDisableVoice : onEnableVoice}
              title={isListening ? 'Disable voice interrupt' : 'Enable voice interrupt'}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                isListening
                  ? 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  : 'border-border bg-bg-card text-text-secondary hover:border-cyan/40 hover:text-cyan'
              }`}
            >
              {isListening ? '🎙 On' : '🎙 Off'}
            </button>

            {isSpeaking && (
              <button
                onClick={onPause}
                className="px-3 py-1.5 rounded-full border border-amber/40 bg-amber/10 text-amber text-xs font-semibold hover:bg-amber/20 transition-colors"
              >
                ⏸ Pause
              </button>
            )}
          </>
        )}

        {introState === 'paused' && (
          <button
            onClick={onResume}
            className="px-3 py-1.5 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-xs font-semibold hover:bg-cyan/20 transition-colors"
          >
            ▶ Resume
          </button>
        )}

        <button
          onClick={onStop}
          className="px-3 py-1.5 rounded-full border border-border bg-bg-card text-text-secondary text-xs font-semibold hover:border-red/40 hover:text-red-400 transition-colors"
        >
          ✕ End
        </button>

      </div>
    </div>
  );
};