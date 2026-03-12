/**
 * useMediaCapture.ts — REWRITTEN (sendFrame callback replaces wsRef)
 *
 * WHAT CHANGED AND WHY:
 *
 * Previously accepted `wsRef: React.MutableRefObject<WebSocket | null>`.
 * useNavigationSession passed `aria.wsRef ?? useRef(null)` — but if wsRef
 * wasn't exported from useAriaIntro, the fallback was always null, so
 * captureFrame() returned on `ws.readyState !== WebSocket.OPEN` every time.
 * Result: 0 frames sent.
 *
 * New approach: accept `sendFrame: (data: ArrayBuffer) => void` callback.
 * useNavigationSession builds this callback using aria.sendBinary (which
 * comes straight from useGeminiLive's wsRef — always the real open socket).
 * No ref sharing, no null risk, no conditional hook call.
 *
 * Everything else is identical: 1 FPS, JPEG encoding, binary frame format.
 */

import { useRef, useState, useCallback, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface UseMediaCaptureOptions {
  /** Called with a fully-built binary frame ready to send over WebSocket */
  sendFrame: (data: ArrayBuffer) => void
  /** Only capture when true */
  enabled?: boolean
  /** Frames per second — capped at 1 (Gemini Live max) */
  fps?: number
  /** JPEG quality 0–1 */
  quality?: number
  /** Max canvas dimension — Gemini optimal is 768 */
  maxDimension?: number
}

export interface UseMediaCaptureReturn {
  /** Attach to <video> element to show camera preview */
  videoRef: React.RefObject<HTMLVideoElement | null>
  isCapturing: boolean
  startCapture: () => Promise<void>
  stopCapture: () => void
  error: string | null
}

// ── Binary frame builder ──────────────────────────────────────────────────────
// Wire format: [10-byte "video" header (zero-padded)] [raw JPEG bytes]
// Matches router.py: header = data[:10].decode().strip("\x00") → "video"

function buildVideoFrame(jpegBuffer: ArrayBuffer): ArrayBuffer {
  const frame = new Uint8Array(10 + jpegBuffer.byteLength)
  new TextEncoder().encode('video').forEach((b, i) => { frame[i] = b })
  frame.set(new Uint8Array(jpegBuffer), 10)
  return frame.buffer
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMediaCapture({
  sendFrame,
  enabled = true,
  fps = 1,
  quality = 0.7,
  maxDimension = 768,
}: UseMediaCaptureOptions): UseMediaCaptureReturn {

  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const videoRef     = useRef<HTMLVideoElement | null>(null)
  const streamRef    = useRef<MediaStream | null>(null)
  const canvasRef    = useRef<HTMLCanvasElement | null>(null)
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const frameCountRef = useRef(0)
  // Keep sendFrame in a ref so the interval callback always has the latest version
  const sendFrameRef = useRef(sendFrame)
  useEffect(() => { sendFrameRef.current = sendFrame }, [sendFrame])

  // ── Frame capture ─────────────────────────────────────────────────────────

  const captureFrame = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) {
      console.debug('[VIDEO-CAPTURE] captureFrame: video or canvas not ready')
      return
    }
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      console.debug(`[VIDEO-CAPTURE] captureFrame: video not ready (readyState=${video.readyState})`)
      return
    }

    const vw = video.videoWidth
    const vh = video.videoHeight
    if (!vw || !vh) {
      console.debug('[VIDEO-CAPTURE] captureFrame: video dimensions not available yet')
      return
    }

    const scale    = Math.min(maxDimension / vw, maxDimension / vh, 1.0)
    canvas.width   = Math.round(vw * scale)
    canvas.height  = Math.round(vh * scale)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (!blob) return
      blob.arrayBuffer().then((jpegBuffer) => {
        const frame = buildVideoFrame(jpegBuffer)
        sendFrameRef.current(frame)

        frameCountRef.current++
        const n = frameCountRef.current
        if (n <= 5 || n % 30 === 0) {
          console.log(
            `[VIDEO-CAPTURE] 📤 Frame #${n}: ` +
            `${canvas.width}×${canvas.height}, ${jpegBuffer.byteLength}B JPEG`
          )
        }
      }).catch((err) => {
        console.warn('[VIDEO-CAPTURE] ⚠️ arrayBuffer() failed:', err)
      })
    }, 'image/jpeg', quality)
  }, [quality, maxDimension])

  // ── Start / stop ──────────────────────────────────────────────────────────

  const startCapture = useCallback(async () => {
    if (isCapturing) return
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Camera not supported in this environment')
      return
    }

    setError(null)
    console.log('[VIDEO-CAPTURE] 🎥 Requesting camera access…')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width:  { ideal: 1280, max: 1920 },
          height: { ideal: 720,  max: 1080 },
        },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
          console.log('[VIDEO-CAPTURE] ▶️ Video element playing')
        } catch {
          // play() rejection is non-fatal — autoPlay handles it on most browsers
        }
      } else {
        console.warn('[VIDEO-CAPTURE] ⚠️ videoRef.current is null — video element not mounted yet')
      }

      canvasRef.current   = document.createElement('canvas')
      frameCountRef.current = 0

      // Enforce minimum 1s interval (1 FPS — Gemini Live hard cap)
      const intervalMs = Math.max(Math.round(1000 / fps), 1000)
      intervalRef.current = setInterval(captureFrame, intervalMs)

      setIsCapturing(true)
      console.log(`[VIDEO-CAPTURE] ✅ Started — interval=${intervalMs}ms, quality=${quality}, maxDim=${maxDimension}`)

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera access failed'
      console.error('[VIDEO-CAPTURE] ❌ getUserMedia failed:', msg)
      setError(msg)
    }
  }, [isCapturing, fps, quality, maxDimension, captureFrame])

  const stopCapture = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    console.log(`[VIDEO-CAPTURE] ⏹️ Stopped — sent ${frameCountRef.current} frames total`)
    setIsCapturing(false)
  }, [])

  // ── Auto-stop when disabled ───────────────────────────────────────────────
  useEffect(() => {
    if (!enabled && isCapturing) stopCapture()
  }, [enabled, isCapturing, stopCapture])

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => { stopCapture() }
  }, [stopCapture])

  return { videoRef, isCapturing, startCapture, stopCapture, error }
}