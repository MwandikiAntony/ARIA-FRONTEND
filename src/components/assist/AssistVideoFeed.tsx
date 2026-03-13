'use client';

/**
 * src/components/assist/AssistVideoFeed.tsx
 * Live camera feed with front/back flip, screenshot, overlays.
 */

import React, { useEffect, useRef } from 'react';
import type { AssistSessionPhase } from '@/hooks/useAssistSession';

interface AssistVideoFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  phase: AssistSessionPhase;
  isCameraOn: boolean;
  cameraFacing: 'environment' | 'user';
  hasMultipleCameras: boolean;
  isSpeaking: boolean;
  taskTitle: string;
  screenshotDataUrl: string | null;
  onFlipCamera: () => void;
  onToggleCamera: () => void;
  onTakeScreenshot: () => void;
  onDownloadScreenshot: () => void;
  onDismissScreenshot: () => void;
}

export const AssistVideoFeed: React.FC<AssistVideoFeedProps> = ({
  videoRef,
  phase,
  isCameraOn,
  cameraFacing,
  hasMultipleCameras,
  isSpeaking,
  taskTitle,
  screenshotDataUrl,
  onFlipCamera,
  onToggleCamera,
  onTakeScreenshot,
  onDownloadScreenshot,
  onDismissScreenshot,
}) => {
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera stream on this component's video element
  useEffect(() => {
    if (!isCameraOn || phase === 'idle') return;
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: cameraFacing,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    navigator.mediaDevices?.getUserMedia(constraints)
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch((err) => console.warn('[ASSIST] Camera error:', err));

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [isCameraOn, cameraFacing, phase, videoRef]);

  const isActive = phase === 'active' || phase === 'paused';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ background: '#0a0f0a' }}>
      {/* Aspect ratio container */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>

        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{
            transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
            opacity: isCameraOn && isActive ? 1 : 0,
          }}
        />

        {/* Camera off placeholder */}
        {(!isCameraOn || !isActive) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: 'linear-gradient(135deg, #0a0f0a 0%, #0f1f14 100%)' }}
          >
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'linear-gradient(rgba(52,211,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            <div className="relative z-10 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 mx-auto"
                style={{
                  background: 'rgba(52,211,153,0.1)',
                  border: '1px solid rgba(52,211,153,0.2)',
                }}
              >
                <span className="text-3xl">
                  {phase === 'idle' ? '📷' : isCameraOn ? '📷' : '🚫'}
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: '#34d399' }}>
                {phase === 'idle' ? 'Camera ready' : 'Camera off'}
              </p>
              <p className="text-xs text-white/30 mt-1">
                {phase === 'idle'
                  ? 'Point at your task to begin'
                  : 'Toggle camera to resume feed'}
              </p>
            </div>
          </div>
        )}

        {/* Dark scrim for readability */}
        {isCameraOn && isActive && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)' }}
          />
        )}

        {/* Speaking pulse ring */}
        {isSpeaking && isActive && (
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              boxShadow: 'inset 0 0 0 2px rgba(52,211,153,0.5)',
              animation: 'pulse 1s ease-in-out infinite',
            }}
          />
        )}

        {/* Task title overlay */}
        {taskTitle && isActive && (
          <div
            className="absolute top-3 left-3 px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(52,211,153,0.2)',
            }}
          >
            <span className="text-xs font-medium" style={{ color: '#34d399' }}>
              {taskTitle}
            </span>
          </div>
        )}

        {/* AI speaking indicator */}
        {isSpeaking && isActive && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(52,211,153,0.3)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#34d399', animation: 'pulse 1s infinite' }}
            />
            <span className="text-[11px] font-medium" style={{ color: '#34d399' }}>
              ARIA
            </span>
          </div>
        )}

        {/* Controls overlay — bottom */}
        {isActive && (
          <div
            className="absolute bottom-3 right-3 flex items-center gap-2"
          >
            {/* Screenshot */}
            <button
              onClick={onTakeScreenshot}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              title="Take screenshot"
            >
              <span className="text-sm">📸</span>
            </button>

            {/* Flip camera */}
            {hasMultipleCameras && (
              <button
                onClick={onFlipCamera}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
                title="Flip camera"
              >
                <span className="text-sm">🔄</span>
              </button>
            )}

            {/* Toggle camera */}
            <button
              onClick={onToggleCamera}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: isCameraOn ? 'rgba(0,0,0,0.6)' : 'rgba(239,68,68,0.3)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${isCameraOn ? 'rgba(255,255,255,0.15)' : 'rgba(239,68,68,0.4)'}`,
              }}
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              <span className="text-sm">{isCameraOn ? '📷' : '🚫'}</span>
            </button>
          </div>
        )}

        {/* Camera facing badge */}
        {isActive && isCameraOn && (
          <div
            className="absolute bottom-3 left-3"
          >
            <span
              className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded"
              style={{
                background: 'rgba(0,0,0,0.5)',
                color: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {cameraFacing === 'environment' ? '↩ BACK' : '↪ FRONT'}
            </span>
          </div>
        )}

        {/* Paused overlay */}
        {phase === 'paused' && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">⏸</div>
              <p className="text-sm font-medium text-white/70">Paused</p>
            </div>
          </div>
        )}
      </div>

      {/* Screenshot preview */}
      {screenshotDataUrl && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-20"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <img
            src={screenshotDataUrl}
            alt="Screenshot"
            className="max-w-full max-h-full rounded-lg object-contain"
            style={{ maxHeight: '70%' }}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={onDownloadScreenshot}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-110"
              style={{
                background: 'rgba(52,211,153,0.2)',
                border: '1px solid rgba(52,211,153,0.35)',
                color: '#34d399',
              }}
            >
              ⬇ Download
            </button>
            <button
              onClick={onDismissScreenshot}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/50 transition-all hover:text-white/80"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};