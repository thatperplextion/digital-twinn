import { useEffect, useRef, useCallback, useState } from 'react';

export function useWebSocket(options) {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
  } = options;

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const [state, setState] = useState({
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
          const data = JSON.parse(event.data);
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

  const sendMessage = useCallback((data) => {
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

export function useEventStream(options = {}) {
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

  const handleMessage = useCallback((data) => {
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

export function useRealtimeStats() {
  const [stats, setStats] = useState({
    activeConnections: 0,
    eventsPerSecond: 0,
    activeTwins: 0,
    pendingActions: 0,
  });

  const handleMessage = useCallback((data) => {
    if (data.type === 'STATS_UPDATE' && data.payload) {
      setStats(data.payload);
    }
  }, []);

  const { isConnected } = useWebSocket({
    url: `ws://${window.location.host}/api/stream/stats`,
    onMessage: handleMessage,
  });

  return { stats, isConnected };
}
