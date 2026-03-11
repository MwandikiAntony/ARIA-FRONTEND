'use client';

import { DashboardGrid } from '@/components/navigation/NavigationHUD';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { startModeSession } = useWebSocketContext();

  useEffect(() => {
    startModeSession('navigation');
  }, [startModeSession]);

  return <DashboardGrid />;
}