'use client';

import { CoachLayout } from '@/components/coach/CoachLayout';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useEffect } from 'react';

export default function CoachPage() {
  const { startModeSession } = useWebSocketContext();

  useEffect(() => {
    startModeSession('coach');
  }, [startModeSession]);

  return <CoachLayout />;
}