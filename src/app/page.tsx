'use client';

/**
 * src/app/page.tsx — HOME PAGE
 *
 * CHANGES:
 * 1. AriaIntroBar rendered here (home page only, not layout.tsx)
 * 2. AriaBarSpacer div added below bar
 * 3. Small square front-camera feed added — toggleable, sits above Hero content
 *    Camera is front-facing, small (160×160), user can hide/show it.
 *    ARIA can see via camera for quick home-page help. For full functionality
 *    user is directed to the relevant mode page.
 */

import React, { useRef, useState, useEffect } from 'react';
import { Hero }            from '@/components/home/Hero';
import { OnboardingSteps } from '@/components/home/OnboardingSteps';
import { AriaIntroBar }    from '@/components/home/AriaIntroBar';
import { ModeSelector }    from '@/components/home/ModeSelector';

function HomeCameraFeed() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 320 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setHasPermission(true);
      } catch {
        setHasPermission(false);
      }
    }
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Don't render anything if camera was denied
  if (hasPermission === false) return null;

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible((v) => !v)}
        className="px-3 py-1.5 rounded-full border border-border bg-bg-card/90 backdrop-blur-sm text-text-secondary text-[11px] font-mono tracking-wider hover:border-cyan/40 hover:text-cyan transition-colors"
        title={isVisible ? 'Hide camera' : 'Show camera'}
      >
        {isVisible ? '📷 Hide' : '📷 Camera'}
      </button>

      {/* Square camera feed */}
      {isVisible && (
        <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-border bg-bg-card shadow-xl">
          {/* Live indicator */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            <span className="text-[9px] font-mono text-cyan/80 tracking-wider">LIVE</span>
          </div>

          {/* Flip so it looks like a mirror (front cam) */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* Quick help hint */}
          <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-[9px] text-white/60 font-mono text-center leading-tight">
              Ask ARIA anything
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Fixed ARIA bar — pinned below Navbar */}
      <AriaIntroBar />

      {/* Spacer for fixed AriaIntroBar (~44px) */}
      <div className="h-11" aria-hidden="true" />

      {/* Small front camera — bottom-right corner, toggleable */}
      <HomeCameraFeed />

      <Hero />
      <ModeSelector />
      <OnboardingSteps />
    </>
  );
}