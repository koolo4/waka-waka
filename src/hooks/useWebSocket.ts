"use client";

import { useEffect, useRef, useCallback } from "react";
import { createWSMessage, WebSocketEventType, WebSocketMessage } from "@/lib/websocket";

/**
 * Hook for real-time WebSocket communication
 * Provides methods to emit and listen to events
 */
export function useWebSocket(userId: number | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Map<WebSocketEventType, Set<(message: WebSocketMessage) => void>>>(
    new Map()
  );
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);

  const connect = useCallback(() => {
    if (!userId) return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);

      ws.onopen = () => {
        console.log("WebSocket connected");
        reconnectAttempts.current = 0;
        reconnectDelay.current = 1000;

        // Send user identification
        ws.send(
          JSON.stringify({
            type: "user:identify",
            userId,
            timestamp: new Date().toISOString(),
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          emit(message.type, message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        wsRef.current = null;

        // Attempt reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          setTimeout(
            connect,
            Math.min(
              reconnectDelay.current * Math.pow(2, reconnectAttempts.current),
              30000
            )
          );
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  }, [userId]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  /**
   * Subscribe to a WebSocket event
   */
  const on = useCallback(
    (eventType: WebSocketEventType, callback: (message: WebSocketMessage) => void) => {
      if (!subscribersRef.current.has(eventType)) {
        subscribersRef.current.set(eventType, new Set());
      }

      const callbacks = subscribersRef.current.get(eventType)!;
      callbacks.add(callback);

      // Return unsubscribe function
      return () => {
        callbacks.delete(callback);
      };
    },
    []
  );

  /**
   * Emit a WebSocket event
   */
  const emit = useCallback(
    (eventType: WebSocketEventType, message: WebSocketMessage) => {
      const callbacks = subscribersRef.current.get(eventType);
      if (callbacks) {
        callbacks.forEach((callback) => {
          try {
            callback(message);
          } catch (error) {
            console.error("Error in WebSocket callback:", error);
          }
        });
      }
    },
    []
  );

  /**
   * Send a message through WebSocket
   */
  const send = useCallback(
    (type: WebSocketEventType, data: Record<string, any>) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const message = createWSMessage(type, userId!, data);
        wsRef.current.send(JSON.stringify(message));
      } else {
        console.warn(
          "WebSocket is not connected. Message not sent:",
          type,
          data
        );
      }
    },
    [userId]
  );

  return {
    connected: wsRef.current?.readyState === WebSocket.OPEN,
    on,
    send,
  };
}
