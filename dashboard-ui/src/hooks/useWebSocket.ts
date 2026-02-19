// Minor change for commit history
import { useEffect, useRef, useCallback, useState } from 'react';
import { StreamUpdate } from '../types';
interface WebSocketOptions {
  url: string;
  onMessage?: (data: StreamUpdate) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}
interface WebSocketState {
  isConnected: boolean;
  reconnectAttempts: number;
  lastMessage: StreamUpdate | null;
}
export function useWebSocket(options: WebSocketOptions) {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
  } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    reconnectAttempts: 0,
    lastMessage: null,
  });
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => {
        console.log('[WebSocket] Connected to', url);
        setState(prev => ({
          ...prev,
          isConnected: true,
          reconnectAttempts: 0,
        }));
        onOpen?.();
      };
      ws.onmessage = (event) => {
        try {
          const data: StreamUpdate = JSON.parse(event.data);
          setState(prev => ({ ...prev, lastMessage: data }));
          onMessage?.(data);
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };
      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);
        setState(prev => ({ ...prev, isConnected: false }));
        onClose?.();
        // Attempt to reconnect
        if (state.reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setState(prev => ({
              ...prev,
              reconnectAttempts: prev.reconnectAttempts + 1,
            }));
            console.log(`[WebSocket] Reconnecting... (attempt ${state.reconnectAttempts + 1})`);
            connect();
          }, reconnectInterval);
        } else {
          console.error('[WebSocket] Max reconnect attempts reached');
        }
      };
      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        onError?.(error);
      };
    } catch (err) {
      console.error('[WebSocket] Connection error:', err);
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnectInterval, maxReconnectAttempts, state.reconnectAttempts]);
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState(prev => ({ ...prev, isConnected: false }));
  }, []);
  const sendMessage = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send message - not connected');
    }
  }, []);
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []);
  return {
    isConnected: state.isConnected,
    reconnectAttempts: state.reconnectAttempts,
    lastMessage: state.lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
}
// ==================== Event Stream Hook ====================
interface UseEventStreamOptions {
  twinId?: string;
  onTwinUpdate?: (data: StreamUpdate) => void;
  onAnomalyDetected?: (data: StreamUpdate) => void;
  onPredictionGenerated?: (data: StreamUpdate) => void;
  onActionExecuted?: (data: StreamUpdate) => void;
}
export function useEventStream(options: UseEventStreamOptions = {}) {
  const {
    twinId,
    onTwinUpdate,
    onAnomalyDetected,
    onPredictionGenerated,
    onActionExecuted,
  } = options;
  const wsUrl = twinId
    ? `ws://${window.location.host}/api/stream/twin/${twinId}`
    : `ws://${window.location.host}/api/stream`;
  const handleMessage = useCallback((data: StreamUpdate) => {
    switch (data.type) {
      case 'TWIN_UPDATED':
        onTwinUpdate?.(data);
        break;
      case 'ANOMALY_DETECTED':
        onAnomalyDetected?.(data);
        break;
      case 'PREDICTION_GENERATED':
        onPredictionGenerated?.(data);
        break;
      case 'ACTION_EXECUTED':
        onActionExecuted?.(data);
        break;
      default:
        console.log('[EventStream] Unknown event type:', data.type);
    }
  }, [onTwinUpdate, onAnomalyDetected, onPredictionGenerated, onActionExecuted]);
  return useWebSocket({
    url: wsUrl,
    onMessage: handleMessage,
  });
}
// ==================== Real-time Stats Hook ====================
interface RealtimeStats {
  activeConnections: number;
  eventsPerSecond: number;
  activeTwins: number;
  pendingActions: number;
}
export function useRealtimeStats() {
  const [stats, setStats] = useState<RealtimeStats>({
    activeConnections: 0,
    eventsPerSecond: 0,
    activeTwins: 0,
    pendingActions: 0,
  });
  const handleMessage = useCallback((data: StreamUpdate) => {
    if (data.type === 'STATS_UPDATE' && data.payload) {
      setStats(data.payload as RealtimeStats);
    }
  }, []);
  const { isConnected } = useWebSocket({
    url: `ws://${window.location.host}/api/stream/stats`,
    onMessage: handleMessage,
  });
  return { stats, isConnected };
}
import { useEffect, useRef, useCallback, useState } from 'react';
import { StreamUpdate } from '../types';

interface WebSocketOptions {
  url: string;
  onMessage?: (data: StreamUpdate) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface WebSocketState {
  isConnected: boolean;
  reconnectAttempts: number;
  lastMessage: StreamUpdate | null;
}

export function useWebSocket(options: WebSocketOptions) {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    reconnectAttempts: 0,
    lastMessage: null,
  });

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected to', url);
        setState(prev => ({
          ...prev,
          isConnected: true,
          reconnectAttempts: 0,
        }));
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const data: StreamUpdate = JSON.parse(event.data);
          setState(prev => ({ ...prev, lastMessage: data }));
          onMessage?.(data);
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);
        setState(prev => ({ ...prev, isConnected: false }));
        onClose?.();

        // Attempt to reconnect
        if (state.reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setState(prev => ({
              ...prev,
              reconnectAttempts: prev.reconnectAttempts + 1,
            }));
            console.log(`[WebSocket] Reconnecting... (attempt ${state.reconnectAttempts + 1})`);
            connect();
          }, reconnectInterval);
        } else {
          console.error('[WebSocket] Max reconnect attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        onError?.(error);
      };
    } catch (err) {
      console.error('[WebSocket] Connection error:', err);
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnectInterval, maxReconnectAttempts, state.reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setState(prev => ({ ...prev, isConnected: false }));
  }, []);

  const sendMessage = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send message - not connected');
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected: state.isConnected,
    reconnectAttempts: state.reconnectAttempts,
    lastMessage: state.lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
}

// ==================== Event Stream Hook ====================

interface UseEventStreamOptions {
  twinId?: string;
  onTwinUpdate?: (data: StreamUpdate) => void;
  onAnomalyDetected?: (data: StreamUpdate) => void;
  onPredictionGenerated?: (data: StreamUpdate) => void;
  onActionExecuted?: (data: StreamUpdate) => void;
}

export function useEventStream(options: UseEventStreamOptions = {}) {
  const {
    twinId,
    onTwinUpdate,
    onAnomalyDetected,
    onPredictionGenerated,
    onActionExecuted,
  } = options;

  const wsUrl = twinId
    ? `ws://${window.location.host}/api/stream/twin/${twinId}`
    : `ws://${window.location.host}/api/stream`;

  const handleMessage = useCallback((data: StreamUpdate) => {
    switch (data.type) {
      case 'TWIN_UPDATED':
        onTwinUpdate?.(data);
        break;
      case 'ANOMALY_DETECTED':
        onAnomalyDetected?.(data);
        break;
      case 'PREDICTION_GENERATED':
        onPredictionGenerated?.(data);
        break;
      case 'ACTION_EXECUTED':
        onActionExecuted?.(data);
        break;
      default:
        console.log('[EventStream] Unknown event type:', data.type);
    }
  }, [onTwinUpdate, onAnomalyDetected, onPredictionGenerated, onActionExecuted]);

  return useWebSocket({
    url: wsUrl,
    onMessage: handleMessage,
  });
}

// ==================== Real-time Stats Hook ====================

interface RealtimeStats {
  activeConnections: number;
  eventsPerSecond: number;
  activeTwins: number;
  pendingActions: number;
}

export function useRealtimeStats() {
  const [stats, setStats] = useState<RealtimeStats>({
    activeConnections: 0,
    eventsPerSecond: 0,
    activeTwins: 0,
    pendingActions: 0,
  });

  const handleMessage = useCallback((data: StreamUpdate) => {
    if (data.type === 'STATS_UPDATE' && data.payload) {
      setStats(data.payload as RealtimeStats);
    }
  }, []);

  const { isConnected } = useWebSocket({
    url: `ws://${window.location.host}/api/stream/stats`,
    onMessage: handleMessage,
  });

  return { stats, isConnected };
}
