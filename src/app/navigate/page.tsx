'use client';

import { NavigationHUD } from '@/components/navigation/NavigationHUD';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useEffect } from 'react';

export default function NavigatePage() {
  const { startModeSession } = useWebSocketContext();

  useEffect(() => {
    startModeSession('navigation');
  }, [startModeSession]);

  return <NavigationHUD />;
}