/**
 * useGeolocation.ts — UPDATED
 *
 * WHAT CHANGED:
 * - Replaced `wsRef: React.MutableRefObject<WebSocket | null>` with
 *   `sendText: (msg: object) => void` callback.
 * - useNavigationSession passes aria.sendText which goes through
 *   useGeminiLive's real open WebSocket — no ref sharing needed.
 * - Everything else identical: haversine filter, accuracy classification,
 *   indoor/outdoor thresholds, update logging.
 */

import { useState, useEffect, useRef, useCallback } from 'react'

export type Environment = 'outdoor' | 'indoor' | 'unknown'

interface UseGeolocationOptions {
  /** Sends a JSON object as text over the WebSocket */
  sendText: (msg: object) => void
  enabled?: boolean
  minDistanceM?: number
  maxIntervalMs?: number
}

export interface UseGeolocationReturn {
  position: GeolocationCoordinates | null
  environment: Environment
  accuracy: number | null
  isTracking: boolean
  error: string | null
}

const OUTDOOR_MAX_ACCURACY_M = 20
const INDOOR_MIN_ACCURACY_M  = 50

export function useGeolocation({
  sendText,
  enabled = true,
  minDistanceM = 5,
  maxIntervalMs = 10_000,
}: UseGeolocationOptions): UseGeolocationReturn {

  const [position, setPosition]       = useState<GeolocationCoordinates | null>(null)
  const [environment, setEnvironment] = useState<Environment>('unknown')
  const [accuracy, setAccuracy]       = useState<number | null>(null)
  const [isTracking, setIsTracking]   = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const watchIdRef      = useRef<number | null>(null)
  const lastSentPosRef  = useRef<{ lat: number; lng: number } | null>(null)
  const lastSentTimeRef = useRef<number>(0)
  const updateCountRef  = useRef(0)
  // Keep sendText stable in a ref so the watchPosition callback always has latest
  const sendTextRef = useRef(sendText)
  useEffect(() => { sendTextRef.current = sendText }, [sendText])

  const classifyEnvironment = useCallback((acc: number): Environment => {
    if (acc <= OUTDOOR_MAX_ACCURACY_M) return 'outdoor'
    if (acc >= INDOOR_MIN_ACCURACY_M)  return 'indoor'
    return 'unknown'
  }, [])

  useEffect(() => {
    if (!enabled) return
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setError(null)
    setIsTracking(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = pos.coords
        setPosition(coords)
        setAccuracy(coords.accuracy)
        setEnvironment(classifyEnvironment(coords.accuracy))

        // Rate-limit sends: only send if moved enough OR interval elapsed
        const now = Date.now()
        const last = lastSentPosRef.current
        const timeSinceLast = now - lastSentTimeRef.current

        if (last) {
          const dist = haversineMeters(last.lat, last.lng, coords.latitude, coords.longitude)
          if (dist < minDistanceM && timeSinceLast < maxIntervalMs) return
        }

        lastSentPosRef.current  = { lat: coords.latitude, lng: coords.longitude }
        lastSentTimeRef.current = now
        updateCountRef.current++

        sendTextRef.current({
          type:     'gps',
          lat:      coords.latitude,
          lng:      coords.longitude,
          accuracy: coords.accuracy,
          speed:    coords.speed   ?? null,
          bearing:  coords.heading ?? null,
        })

        const n = updateCountRef.current
        if (n <= 3 || n % 10 === 0) {
          console.log(
            `[GPS] 📍 #${n} → backend: ` +
            `(${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}) ` +
            `accuracy=${coords.accuracy?.toFixed(1)}m env=${classifyEnvironment(coords.accuracy)}`
          )
        }
      },
      (geoError) => {
        console.error('[GPS] ❌ Geolocation error:', geoError.message)
        setError(geoError.message)
        setIsTracking(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 5_000,
      },
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      setIsTracking(false)
    }
  }, [enabled, minDistanceM, maxIntervalMs, classifyEnvironment])

  return { position, environment, accuracy, isTracking, error }
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}