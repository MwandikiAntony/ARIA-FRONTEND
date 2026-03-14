/**
 * useNavigationSession.ts
 *
 * CHANGES vs previous version:
 *
 * 1. activate() NOW CALLS aria.activate('navigation') NOT aria.activate()
 *    WHY: aria.activate() with no argument sends 'start_intro' to the backend,
 *    which creates a session with mode=None and triggers the home greeting.
 *    The home greeting then played in full on the navigation page before the
 *    navigation greeting started — two voices, wrong context.
 *    FIX: activate('navigation') sends 'start_navigation' directly — the
 *    backend creates a fresh Gemini session with mode='navigation' and sends
 *    only the navigation intro. The home greeting never fires.
 *
 * 2. REMOVED: the separate navGreetingRef / start_navigation sendText call
 *    WHY: Previously we sent start_navigation as a second message AFTER
 *    start_intro already fired. That was the exact cause of the double voice.
 *    Now start_navigation is the ONLY message sent — via activate('navigation').
 *    The set_mode sendText is also removed because start_navigation sets
 *    the session mode on the backend as part of its own handler.
 *
 * Everything else is identical to the previous version.
 */

import { useState, useEffect, useRef, useCallback, type RefObject } from 'react'
import { useAriaIntro, type IntroState } from './useAriaIntro'
import { useMediaCapture } from './useMediaCapture'
import { useGeolocation, type Environment } from './useGeolocation'
import { useAgentState, type AgentState } from './useAgentState'
import { useGoogleMapsRoute, type MapsRoute, type TravelMode } from './useGoogleMapsRoute'

export interface DetectionResult {
  label: string
  confidence: number
  urgency: number
  direction: string | null
  distance_hint: string | null
  bbox: { x: number; y: number; w: number; h: number } | null
}

export interface UseNavigationSessionReturn {
  introState: IntroState
  sessionId: string | null
  activate: () => Promise<void>
  stop: () => void
  mute: () => void
  unmute: () => void
  pause: () => void
  resume: () => void
  enableVoice: () => void
  disableVoice: () => void
  isSpeaking: boolean
  isListening: boolean
  transcript: string
  videoRef: RefObject<HTMLVideoElement | null>
  isCapturing: boolean
  startCapture: () => Promise<void>
  stopCapture: () => void
  cameraError: string | null
  environment: Environment
  position: GeolocationCoordinates | null
  accuracy: number | null
  gpsError: string | null
  isTrackingGPS: boolean
  detections: DetectionResult[]
  agentState: AgentState
  urgencyScore: number
  isConnected: boolean
  route: MapsRoute | null
  currentAddress: string | null
  travelMode: TravelMode
  setTravelMode: (mode: TravelMode) => void
  calculateRoute: (destination: string) => Promise<void>
  clearRoute: () => void
  destination: string | null
  setDestination: (d: string | null) => void
}

export function useNavigationSession(): UseNavigationSessionReturn {

  const [detections, setDetections] = useState<DetectionResult[]>([])
  const [lastWsMessage, setLastWsMessage] = useState<any>(null)
  const [destination, setDestination] = useState<string | null>(null)

  const aria = useAriaIntro()

  // FIX: Removed the modeSentRef / set_mode sendText useEffect.
  // WHY: set_mode was sent as a separate message after start_intro already fired.
  // The session mode is now set inside the start_navigation backend handler
  // when activate('navigation') is called — no separate set_mode needed.

  // FIX: Removed the navGreetingRef / start_navigation sendText useEffect.
  // WHY: This was the exact cause of the double voice bug. It sent start_navigation
  // as a second message on top of start_intro which had already been queued.
  // Both prompts ran in the same Gemini session 1ms apart — home greeting played
  // in full (107 responses), then navigation greeting played after (47 responses).
  // Now activate('navigation') is the only activation path — no second message.

  useEffect(() => {
    const unsubscribe = aria.subscribeToMessages((msg: any) => {
      if (!msg?.type) return
      const { type } = msg
      if (type === 'detection') {
        setDetections(msg.detections ?? [])
        setLastWsMessage(msg)
      } else if (type === 'agent_state') {
        setLastWsMessage(msg)
      } else if (type === 'environment_update') {
        setLastWsMessage(msg)
      } else if (type === 'interrupted') {
        setLastWsMessage(msg)
        setDetections([])
      }
    })
    return unsubscribe
  }, [aria.subscribeToMessages])

  const isSessionActive = aria.introState === 'active' || aria.introState === 'muted'

  const {
    videoRef,
    isCapturing,
    startCapture,
    stopCapture,
    error: cameraError,
  } = useMediaCapture({
    sendFrame: aria.sendBinary,
    enabled: isSessionActive,
    fps: 1,
    quality: 0.7,
    maxDimension: 768,
  })

  useEffect(() => {
    if (isSessionActive && !isCapturing) {
      startCapture().catch(console.error)
    }
    if (!isSessionActive && isCapturing) {
      stopCapture()
    }
  }, [isSessionActive]) // eslint-disable-line react-hooks/exhaustive-deps

  const gpsTextSender = useCallback((msg: object) => {
    aria.sendText(JSON.stringify(msg))
  }, [aria.sendText])

  const {
    position,
    environment,
    accuracy,
    error: gpsError,
    isTracking: isTrackingGPS,
  } = useGeolocation({
    sendText: gpsTextSender,
    enabled: isSessionActive,
    minDistanceM: 5,
    maxIntervalMs: 10_000,
  })

  const { currentState: agentState, urgencyScore } = useAgentState({
    wsMessage: lastWsMessage,
    isSpeaking: aria.isSpeaking,
    mode: 'navigation',
  })

  // Google Maps route hook — position drives live dot + step tracking
  const {
    route,
    isLoading: routeLoading,
    error: routeError,
    currentAddress,
    travelMode,
    setTravelMode,
    calculateRoute: calcRoute,
    clearRoute,
  } = useGoogleMapsRoute(position)

  // When current address resolves for the first time, tell ARIA via context
  const addressAnnouncedRef = useRef(false)
  useEffect(() => {
    if (!currentAddress || addressAnnouncedRef.current || !isSessionActive) return
    addressAnnouncedRef.current = true
    aria.sendText(JSON.stringify({
      type: 'control',
      action: 'update_context',
      context: {
        instruction: `The user's current location is: ${currentAddress}. ` +
          `Announce this to them now: say "You are currently at ${currentAddress}." ` +
          `Then wait for their next instruction.`,
      },
    }))
  }, [currentAddress]) // eslint-disable-line react-hooks/exhaustive-deps

  // When a route is calculated, tell ARIA the first instruction
  const routeAnnouncedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!route || !destination) return
    if (routeAnnouncedRef.current === destination) return
    routeAnnouncedRef.current = destination
    const first = route.steps[0]?.instruction ?? 'Follow the route on screen'
    aria.sendText(JSON.stringify({
      type: 'control',
      action: 'update_context',
      context: {
        instruction: `A route to "${destination}" has been calculated. ` +
          `Total: ${route.totalDistance}, estimated ${route.totalDuration}. ` +
          `Tell the user: "Route found. ${route.totalDistance}, about ${route.totalDuration}. ` +
          `First: ${first}" — then guide them step by step as they move.`,
      },
    }))
  }, [route]) // eslint-disable-line react-hooks/exhaustive-deps

  const calculateRoute = useCallback(async (dest: string) => {
    setDestination(dest)
    await calcRoute(dest)
  }, [calcRoute])

  return {
    introState: aria.introState,
    sessionId: aria.sessionId,
    // FIX: wrap activate to always pass 'navigation' mode.
    // This ensures start_navigation is sent instead of start_intro,
    // preventing the home greeting from firing on the navigation page.
    activate: () => aria.activate('navigation'),
    stop: aria.stop,
    mute: aria.mute,
    unmute: aria.unmute,
    pause: aria.pause,
    resume: aria.resume,
    enableVoice: aria.enableVoice,
    disableVoice: aria.disableVoice,
    isSpeaking: aria.isSpeaking,
    isListening: aria.isListening,
    transcript: aria.transcript,
    videoRef,
    isCapturing,
    startCapture,
    stopCapture,
    cameraError,
    environment,
    position,
    accuracy,
    gpsError,
    isTrackingGPS,
    detections,
    agentState,
    urgencyScore,
    isConnected: aria.geminiState === 'ready' ||
                 aria.geminiState === 'speaking' ||
                 aria.geminiState === 'listening',
    route,
    currentAddress,
    travelMode,
    setTravelMode,
    calculateRoute,
    clearRoute,
    destination,
    setDestination,
  }
}