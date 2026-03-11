'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
  latency: number;
  sendMessage: (message: any) => void;
  sendAudioChunk: (audioData: ArrayBuffer) => void;
  sessionId: string | null;
  error: Error | null;
  startModeSession: (sessionType: "navigation" | "coach") => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  lastMessage: null,
  latency: 0,
  sendMessage: () => {},
  sendAudioChunk: () => {},
  sessionId: null,
  error: null,
  startModeSession: async () => {},
});

export const useWebSocketContext = (): WebSocketContextType =>
  useContext(WebSocketContext);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<Error | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);
  const startedRef = useRef(false);

  // ── 1. Session is NOT auto-started on mount ───────────────────────────────
  //
  // WHY: WebSocketContext was auto-creating a session and opening a WebSocket
  // on every page load — including the home page. This conflicted with the
  // ARIA voice agent (useAriaIntro) which creates its own session for Gemini.
  // Result: two sessions + two WebSocket connections fighting each other,
  // causing one to drop immediately (the rapid connect/disconnect in logs).
  //
  // WebSocketContext is only for navigation and coach modes. It should only
  // connect when the user actually enters one of those modes.
  // Call startModeSession(type) from the navigate/coach page to activate it.

  const startModeSession = async (sessionType: 'navigation' | 'coach') => {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://aria-backend-1075490776634.us-central1.run.app';

      const res = await fetch(`${apiUrl}/api/v1/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_type: sessionType }),
      });

      if (!res.ok) {
        throw new Error(`Session start failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.session_id) {
        throw new Error('Session start response missing session_id');
      }

      setSessionId(data.session_id);
      setShouldConnect(true);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to start session');
      console.error('[WebSocketContext] session start error:', e.message);
      setSessionError(e);
      startedRef.current = false; // allow retry on error
    }
  };

  // ── 2. Connect WebSocket only when startModeSession has been called ────────
  const ws = useWebSocket({
    sessionId: sessionId ?? undefined,
    enabled: shouldConnect && !!sessionId,
  });

  // ── 3. Merge session error with any WS error ──────────────────────────────
  const error = sessionError ?? ws.error;

  return (
    <WebSocketContext.Provider
      value={{
        ...ws,
        sessionId,
        error,
        startModeSession,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};