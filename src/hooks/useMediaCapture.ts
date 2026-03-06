import { useState, useRef, useCallback, useEffect } from 'react';

interface MediaCaptureOptions {
  audio?: boolean;
  video?: boolean;
  frameRate?: number;
}

export const useMediaCapture = (options: MediaCaptureOptions = { audio: true, video: true, frameRate: 5 }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const startCapture = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: options.audio,
        video: options.video,
      });

      setStream(mediaStream);
      setError(null);
      setIsCapturing(true);

      if (videoRef.current && options.video) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      setError('Failed to access camera/microphone');
      console.error('Media capture error:', err);
    }
  }, [options.audio, options.video]);

  const stopCapture = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCapturing(false);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [stream]);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.7);
  }, []);

  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return {
    stream,
    error,
    isCapturing,
    videoRef,
    canvasRef,
    startCapture,
    stopCapture,
    captureFrame,
  };
};