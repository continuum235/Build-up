import { useAuth } from "@clerk/clerk-expo";
import { useCallback, useEffect, useMemo, useRef, useState, createContext, useContext } from "react";
import { AppState } from "react-native";

interface MessageEvent {
  type: "message";
  conversationId: string;
  message: any;
}

interface RealtimeContextValue {
  connected: boolean;
  lastMessage: MessageEvent | null;
  subscribe: (callback: (ev: MessageEvent) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  connected: false,
  lastMessage: null,
  subscribe: () => () => {},
});

export const RealtimeProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, isSignedIn } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const reconnectAttemptsRef = useRef(0);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const listenersRef = useRef<Set<(ev: MessageEvent) => void>>(new Set());
  // Latest auth state for callbacks that outlive a render (close/reconnect
  // handlers), so a signed-out socket never keeps reconnecting.
  const isSignedInRef = useRef(isSignedIn);

  useEffect(() => {
    isSignedInRef.current = isSignedIn;
  }, [isSignedIn]);

  // Stable identity: screens list `subscribe` in effect deps.
  const subscribe = useCallback((callback: (ev: MessageEvent) => void) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);

  const scheduleReconnect = () => {
    if (!isSignedInRef.current) return;
    if (reconnectTimeoutRef.current) return;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    reconnectAttemptsRef.current++;
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connect();
    }, delay);
  };

  const connect = async () => {
    if (!isSignedInRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const base = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
    const wsUrl = base.replace(/^http/, "ws") + "/ws";
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = async () => {
        try {
          const token = await getToken();
          ws.send(JSON.stringify({ type: "auth", token }));
        } catch {}
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "ready") {
            setConnected(true);
            reconnectAttemptsRef.current = 0;
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
              reconnectTimeoutRef.current = null;
            }
          } else if (data.type === "message") {
            const ev: MessageEvent = {
              type: "message",
              conversationId: data.conversationId,
              message: data.message,
            };
            setLastMessage(ev);
            for (const cb of listenersRef.current) {
              try {
                cb(ev);
              } catch {}
            }
          }
        } catch {}
      };
      ws.onclose = () => {
        setConnected(false);
        scheduleReconnect();
      };
      ws.onerror = () => {
        setConnected(false);
        try {
          ws.close();
        } catch {}
      };
    } catch {
      scheduleReconnect();
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      // Closing the socket fires onclose, which clears `connected`; doing it
      // here instead would be a synchronous setState inside an effect.
      reconnectAttemptsRef.current = 0;
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
      return;
    }
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
    };
  }, [isSignedIn]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        connect();
      }
    });
    return () => sub.remove();
  }, []);

  // Memoized so consumers don't re-run their effects on every provider render
  const value = useMemo<RealtimeContextValue>(
    () => ({ connected, lastMessage, subscribe }),
    [connected, lastMessage, subscribe],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export function useRealtime() {
  return useContext(RealtimeContext);
}

