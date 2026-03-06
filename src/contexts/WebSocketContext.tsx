'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
  latency: number;
  sendMessage: (message: any) => void;
  sendAudioChunk: (audioData: ArrayBuffer) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const sessionId = user?.uid || 'anonymous';

  const { isConnected, lastMessage, latency, sendMessage, sendAudioChunk } = useWebSocket();

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        lastMessage,
        latency,
        sendMessage,
        sendAudioChunk,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};