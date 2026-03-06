import { useEffect, useState, useCallback, useRef } from 'react';

interface WebSocketOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface WebSocketReturn {
  isConnected: boolean;
  lastMessage: any;
  latency: number;
  sendMessage: (data: any) => void;
  sendAudioChunk: (audioData: ArrayBuffer) => void;
}

export function useWebSocket(options: WebSocketOptions = {}): WebSocketReturn {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.aria.com/ws',
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [latency, setLatency] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        console.log('WebSocket connected');
        
        // Start ping-pong latency measurement
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            const pingTime = Date.now();
            ws.send(JSON.stringify({ type: 'ping', timestamp: pingTime }));
          }
        }, 5000);
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onmessage = (event) => {
        try {
          // Try to parse as JSON first
          const data = JSON.parse(event.data);
          
          // Handle pong response for latency
          if (data.type === 'pong') {
            setLatency(Date.now() - data.timestamp);
          } else {
            setLastMessage(data);
          }
        } catch {
          // Handle binary data or non-JSON messages
          setLastMessage(event.data);
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [url, reconnectInterval, maxReconnectAttempts]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected');
    }
  }, [isConnected]);

  const sendAudioChunk = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(audioData);
    } else {
      console.warn('WebSocket not connected');
    }
  }, [isConnected]);

  return { 
    isConnected, 
    lastMessage, 
    latency, 
    sendMessage, 
    sendAudioChunk 
  };
}