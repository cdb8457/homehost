'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface ServerMetrics {
  id: string;
  name: string;
  game: string;
  status: 'RUNNING' | 'STOPPED' | 'STARTING' | 'STOPPING';
  playerCount: number;
  maxPlayers: number;
  cpuUsage: number;
  memoryUsage?: number;
  uptime: string;
  region: string;
  serverType: string;
}

interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface RealTimeState {
  servers: ServerMetrics[];
  activities: ActivityItem[];
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastUpdate: string | null;
}

type RealTimeAction =
  | { type: 'SET_CONNECTION_STATE'; payload: { isConnected: boolean; isConnecting: boolean; error: string | null } }
  | { type: 'UPDATE_SERVERS'; payload: { servers: ServerMetrics[]; timestamp: string } }
  | { type: 'ADD_ACTIVITY'; payload: ActivityItem }
  | { type: 'CLEAR_ACTIVITIES' };

const initialState: RealTimeState = {
  servers: [],
  activities: [],
  isConnected: false,
  isConnecting: false,
  error: null,
  lastUpdate: null
};

function realTimeReducer(state: RealTimeState, action: RealTimeAction): RealTimeState {
  switch (action.type) {
    case 'SET_CONNECTION_STATE':
      return {
        ...state,
        isConnected: action.payload.isConnected,
        isConnecting: action.payload.isConnecting,
        error: action.payload.error
      };

    case 'UPDATE_SERVERS':
      return {
        ...state,
        servers: action.payload.servers,
        lastUpdate: action.payload.timestamp
      };

    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [action.payload, ...state.activities].slice(0, 50) // Keep last 50 activities
      };

    case 'CLEAR_ACTIVITIES':
      return {
        ...state,
        activities: []
      };

    default:
      return state;
  }
}

interface RealTimeContextType {
  state: RealTimeState;
  actions: {
    clearActivities: () => void;
    reconnect: () => void;
    disconnect: () => void;
  };
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

interface RealTimeProviderProps {
  children: ReactNode;
}

export function RealTimeProvider({ children }: RealTimeProviderProps) {
  const [state, dispatch] = useReducer(realTimeReducer, initialState);

  const handleWebSocketMessage = (message: { type: string; data: any }) => {
    switch (message.type) {
      case 'connection_established':
        console.log('🔌 Real-time connection established');
        break;

      case 'server_metrics':
        dispatch({
          type: 'UPDATE_SERVERS',
          payload: {
            servers: message.data.servers,
            timestamp: message.data.timestamp
          }
        });
        break;

      case 'activity_update':
        dispatch({
          type: 'ADD_ACTIVITY',
          payload: message.data.activity
        });
        break;

      default:
        console.log('🔌 Unknown message type:', message.type);
    }
  };

  const {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect
  } = useWebSocket(handleWebSocketMessage, {
    autoConnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
  });

  // Update connection state
  useEffect(() => {
    dispatch({
      type: 'SET_CONNECTION_STATE',
      payload: { isConnected, isConnecting, error }
    });
  }, [isConnected, isConnecting, error]);

  const actions = {
    clearActivities: () => dispatch({ type: 'CLEAR_ACTIVITIES' }),
    reconnect: connect,
    disconnect
  };

  return (
    <RealTimeContext.Provider value={{ state, actions }}>
      {children}
    </RealTimeContext.Provider>
  );
}

export function useRealTime() {
  const context = useContext(RealTimeContext);
  if (context === undefined) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
}

export default RealTimeContext;