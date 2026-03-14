import { useState, useEffect, useRef, useCallback, type RefObject } from 'react'
import { useAriaIntro, type IntroState } from './useAriaIntro'
import { useMediaCapture } from './useMediaCapture'
import { useGeolocation, type Environment } from './useGeolocation'
import { useAgentState, type AgentState } from './useAgentState'

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
}

export function useNavigationSession(): UseNavigationSessionReturn {

  const [detections, setDetections] = useState<DetectionResult[]>([])
  const [lastWsMessage, setLastWsMessage] = useState<any>(null)
  const modeSentRef = useRef(false)
  const navGreetingRef = useRef(false)

  const aria = useAriaIntro()

  useEffect(() => {
    if (aria.geminiState !== 'ready' || modeSentRef.current) return
    aria.sendText(JSON.stringify({ type: 'set_mode', mode: 'navigation' }))
    modeSentRef.current = true
  }, [aria.geminiState]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (aria.introState !== 'active' || navGreetingRef.current) return
    navGreetingRef.current = true
    aria.sendText(JSON.stringify({
      type: 'control',
      action: 'start_navigation',
      mode: 'navigation',
    }))
  }, [aria.introState]) // eslint-disable-line react-hooks/exhaustive-deps

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

  return {
    introState: aria.introState,
    sessionId: aria.sessionId,
    activate: aria.activate,
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
  }
}