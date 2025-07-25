import { useEffect, useRef, useState, useCallback } from 'react';
import { TokenManager } from '@/lib/api-client';

interface WebSocketMessage {
  type: string;
  data: any;
}

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (type: string, data: any) => void;
  lastMessage: WebSocketMessage | null;
}

export function useWebSocket(
  onMessage?: (message: WebSocketMessage) => void,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    url = `ws://localhost:3002`,
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnect = useRef(true);

  const connect = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        setSocket(ws);
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttempts.current = 0;

        // Send authentication token if available
        const token = TokenManager.getAccessToken();
        if (token) {
          ws.send(JSON.stringify({
            type: 'auth',
            data: { token }
          }));
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setSocket(null);
        setIsConnected(false);
        setIsConnecting(false);

        // Attempt to reconnect if not intentionally closed
        if (shouldReconnect.current && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          setError(`Connection lost. Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError('Failed to reconnect after multiple attempts');
        }
      };

      ws.onerror = (event) => {
        console.error('🔌 WebSocket error:', event);
        setError('WebSocket connection error');
        setIsConnecting(false);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('🔌 WebSocket message received:', message.type);
          
          setLastMessage(message);
          
          if (onMessage) {
            onMessage(message);
          }
        } catch (err) {
          console.error('🔌 Failed to parse WebSocket message:', err);
        }
      };

      setSocket(ws);
    } catch (err) {
      console.error('🔌 Failed to create WebSocket:', err);
      setError('Failed to create WebSocket connection');
      setIsConnecting(false);
    }
  }, [url, onMessage, maxReconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    shouldReconnect.current = false;
    
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    if (socket) {
      socket.close();
    }
    
    setSocket(null);
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
  }, [socket]);

  const sendMessage = useCallback((type: string, data: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, data }));
    } else {
      console.warn('🔌 Cannot send message: WebSocket not connected');
    }
  }, [socket]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      shouldReconnect.current = false;
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendMessage,
    lastMessage
  };
}

export default useWebSocket;