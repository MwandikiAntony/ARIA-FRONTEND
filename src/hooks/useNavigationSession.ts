/**
 * useNavigationSession.ts — REWRITTEN (clean, no ts-ignore, no conditional hooks)
 *
 * Uses aria.sendBinary  → video frames (useMediaCapture)
 * Uses aria.sendText    → GPS JSON, set_mode JSON
 * Uses aria.subscribeToMessages → detection/agent_state/environment_update
 *
 * No wsRef sharing. No conditional hook calls.
 */

import { useState, useEffect, useRef, useCallback, type RefObject } from 'react'
import { useAriaIntro, type IntroState } from './useAriaIntro'
import { useMediaCapture } from './useMediaCapture'
import { useGeolocation, type Environment } from './useGeolocation'
import { useAgentState, type AgentState } from './useAgentState'

// ── Types ─────────────────────────────────────────────────────────────────────

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
  isSpeaking: boolean
  isListening: boolean
  transcript: string
  videoRef: RefObject<HTMLVideoElement | null>
  isCapturing: boolean
  startCapture: () => Promise<void>
  stopCapture: () => void
  cameraError: string | null
  environment: Environment
  accuracy: number | null
  gpsError: string | null
  isTrackingGPS: boolean
  detections: DetectionResult[]
  agentState: AgentState
  urgencyScore: number
  isConnected: boolean
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNavigationSession(): UseNavigationSessionReturn {

  const [detections, setDetections]       = useState<DetectionResult[]>([])
  const [lastWsMessage, setLastWsMessage] = useState<any>(null)
  const modeSentRef = useRef(false)

  // ── 1. Voice + WS session ─────────────────────────────────────────────────
  const aria = useAriaIntro()

  // ── 2. Send set_mode: navigation once WS connects ─────────────────────────
  useEffect(() => {
    if (aria.geminiState !== 'ready' || modeSentRef.current) return
    aria.sendText(JSON.stringify({ type: 'set_mode', mode: 'navigation' }))
    modeSentRef.current = true
    console.log('[NAV-SESSION] set_mode: navigation → backend')
  }, [aria.geminiState]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 3. Subscribe to nav-specific WS messages ──────────────────────────────
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

  // ── 4. Camera capture ─────────────────────────────────────────────────────
  const isSessionActive = aria.introState === 'active' || aria.introState === 'muted'

  const {
    videoRef,
    isCapturing,
    startCapture,
    stopCapture,
    error: cameraError,
  } = useMediaCapture({
    sendFrame: aria.sendBinary,   // ← directly uses the live WS socket
    enabled: isSessionActive,
    fps: 1,
    quality: 0.7,
    maxDimension: 768,
  })

  // Auto-start/stop camera with session
  useEffect(() => {
    if (isSessionActive && !isCapturing) {
      startCapture().catch(console.error)
    }
    if (!isSessionActive && isCapturing) {
      stopCapture()
    }
  }, [isSessionActive]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 5. GPS tracking ───────────────────────────────────────────────────────
  const gpsTextSender = useCallback((msg: object) => {
    aria.sendText(JSON.stringify(msg))
  }, [aria.sendText])

  const {
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

  // ── 6. Agent state ────────────────────────────────────────────────────────
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
    isSpeaking: aria.isSpeaking,
    isListening: aria.isListening,
    transcript: aria.transcript,
    videoRef,
    isCapturing,
    startCapture,
    stopCapture,
    cameraError,
    environment,
    accuracy,
    gpsError,
    isTrackingGPS,
    detections,
    agentState,
    urgencyScore,
    isConnected: aria.geminiState === 'ready'    ||
                 aria.geminiState === 'speaking' ||
                 aria.geminiState === 'listening',
  }
}