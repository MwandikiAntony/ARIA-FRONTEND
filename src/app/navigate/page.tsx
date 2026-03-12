'use client'

import { useNavigationSession } from '@/hooks/useNavigationSession'
import { NavigationHUD } from '@/components/navigation/NavigationHUD'

export default function NavigatePage() {
  const nav = useNavigationSession()

  const isActive = nav.introState === 'active' ||
                   nav.introState === 'muted'  ||
                   nav.introState === 'paused'

  return (
    // ── FIX: was `h-screen overflow-hidden` which trapped the page ──────────
    // NavigationHUD is a tall section with its own internal padding.
    // The page must scroll naturally — no height cap, no overflow clipping.
    <div className="w-full min-h-screen bg-black">

      {/* Hidden video element — useMediaCapture draws frames from this */}
      <video
        ref={nav.videoRef}
        autoPlay
        muted
        playsInline
        className="absolute opacity-0 pointer-events-none w-1 h-1"
        aria-hidden="true"
      />

      {/* Pre-activation gate */}
      {!isActive && (
        <GateScreen
          introState={nav.introState}
          sessionId={nav.sessionId}
          onActivate={nav.activate}
        />
      )}

      {/* Main HUD — scrolls naturally */}
      {isActive && (
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
          onMute={nav.mute}
          onUnmute={nav.unmute}
          onStop={nav.stop}
          sessionId={nav.sessionId}
        />
      )}
    </div>
  )
}

// ── Gate screen ───────────────────────────────────────────────────────────────

interface GateScreenProps {
  introState: string
  sessionId: string | null
  onActivate: () => Promise<void>
}

function GateScreen({ introState, sessionId, onActivate }: GateScreenProps) {
  const isConnecting   = introState === 'idle' || introState === 'waiting'
  const isReadyToStart = introState === 'ready_to_activate'
  const isStopped      = introState === 'stopped'

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen gap-8 px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          ARIA Navigation
        </h1>
        <p className="mt-2 text-zinc-400 text-sm">
          Real-time obstacle detection and voice guidance
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {isConnecting && (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-zinc-400">Connecting to ARIA…</span>
          </>
        )}
        {isReadyToStart && (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-400">Ready</span>
          </>
        )}
        {isStopped && (
          <>
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-red-400">Session ended</span>
          </>
        )}
      </div>

      {isReadyToStart && (
        <>
          <button
            onClick={onActivate}
            className="px-8 py-4 rounded-2xl text-lg font-semibold bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white transition-colors duration-150 shadow-lg shadow-emerald-500/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
            aria-label="Start ARIA navigation — requires microphone and camera access"
          >
            Start Navigation
          </button>
          <p className="text-xs text-zinc-500 text-center max-w-xs">
            Requires microphone and camera access.
            ARIA will guide you with real-time voice alerts.
          </p>
        </>
      )}

      {sessionId && process.env.NODE_ENV === 'development' && (
        <p className="absolute bottom-4 text-xs text-zinc-700 font-mono">
          session: {sessionId}
        </p>
      )}
    </div>
  )
}