'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useNavigationSession } from '@/hooks/useNavigationSession';
import { NavigationHUD } from '@/components/navigation/NavigationHUD';
import { NavigationAgentBar } from '@/components/navigation/NavigationAgentBar';

export default function NavigatePage() {
  return (
    <Suspense fallback={<FullScreenLoader label="Loading…" />}>
      <NavigateContent />
    </Suspense>
  );
}

function NavigateContent() {
  const nav = useNavigationSession();
  const router = useRouter();
  const activateFired = useRef(false);

  useEffect(() => {
    if (nav.introState === 'ready_to_activate' && !activateFired.current) {
      activateFired.current = true;
      nav.activate();
    }
  }, [nav.introState]); // eslint-disable-line react-hooks/exhaustive-deps

  const isActive =
    nav.introState === 'active' ||
    nav.introState === 'muted'  ||
    nav.introState === 'paused';

  const isStopped = nav.introState === 'stopped';

  if (isStopped) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen gap-8 px-6 bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">Session Ended</h1>
          <p className="mt-2 text-zinc-400 text-sm">ARIA navigation has stopped</p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => { activateFired.current = false; nav.activate(); }}
            className="px-8 py-4 rounded-2xl text-lg font-semibold bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white transition-colors duration-150 shadow-lg shadow-emerald-500/30"
          >
            🔄 Start Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <FullScreenLoader
        label={
          nav.introState === 'idle' || nav.introState === 'waiting'
            ? 'Requesting permissions…'
            : 'Starting ARIA Navigation…'
        }
      />
    );
  }

  return (
    <>
      {/* Navigation-specific floating bar — reads from nav session, no new session */}
      <NavigationAgentBar
        introState={nav.introState}
        isSpeaking={nav.isSpeaking}
        isListening={nav.isListening}
        transcript={nav.transcript}
        environment={nav.environment}
        gpsAccuracy={nav.accuracy}
        onMute={nav.mute}
        onUnmute={nav.unmute}
        onStop={nav.stop}
        onEnableVoice={nav.enableVoice}
        onDisableVoice={nav.disableVoice}
        onPause={nav.pause}
        onResume={nav.resume}
        routeETA={nav.route?.totalDuration ?? null}
        routeDistance={nav.route?.totalDistance ?? null}
        destination={nav.destination}
      />

      {/* Spacer: NavigationAgentBar is fixed at top-16 (~44px tall) */}
      <div className="h-11" aria-hidden="true" />

      <NavigationHUD
        agentState={nav.agentState}
        urgencyScore={nav.urgencyScore}
        isSpeaking={nav.isSpeaking}
        isListening={nav.isListening}
        transcript={nav.transcript}
        videoRef={nav.videoRef}
        isCapturing={nav.isCapturing}
        detections={nav.detections}
        environment={nav.environment}
        gpsAccuracy={nav.accuracy}
        position={nav.position}
        sessionId={nav.sessionId}
        route={nav.route}
        currentAddress={nav.currentAddress}
        travelMode={nav.travelMode}
        setTravelMode={nav.setTravelMode}
        calculateRoute={nav.calculateRoute}
        clearRoute={nav.clearRoute}
        destination={nav.destination}
      />
    </>
  );
}

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen gap-4 px-6 bg-black">
      <div className="w-10 h-10 rounded-full border-2 border-cyan/20 border-t-cyan animate-spin" />
      <p className="font-mono text-sm text-zinc-400 animate-pulse">{label}</p>
      <p className="text-xs text-zinc-600 text-center max-w-xs">
        Allow microphone and camera access when prompted
      </p>
    </div>
  );
}