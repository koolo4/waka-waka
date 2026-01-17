"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { WebSocketEventType, WebSocketMessage } from "@/lib/websocket";

/**
 * Hook for real-time Socket.IO communication
 * Provides methods to emit and listen to events
 */
export function useWebSocket(userId: number | null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const subscribersRef = useRef<Map<string, Set<(message: any) => void>>>(
    new Map()
  );

  const connect = useCallback(() => {
    if (!userId || socketRef.current?.connected) return;

    try {
      const socket = io(window.location.origin, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on("connect", () => {
        console.log("✓ Socket.IO connected:", socket.id);
        setConnected(true);

        // Send user identification
        socket.emit("user:identify", userId);
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket.IO disconnected");
        setConnected(false);
      });

      // Listen for all notification events
      socket.on("notification:new", (message) => {
        console.log("📢 New notification:", message);
        emit("notification:new", message);
      });

      socket.on("notification:read", (message) => {
        console.log("✓ Notification marked as read:", message);
        emit("notification:read", message);
      });

      // Generic event listener for WebSocket events
      socket.on("websocket:message", (message) => {
        console.log("📡 WebSocket message:", message);
        emit(message.type, message);
      });

      socket.on("error", (error) => {
        console.error("⚠️ Socket.IO error:", error);
      });

      socketRef.current = socket;
    } catch (error) {
      console.error("Failed to connect Socket.IO:", error);
    }
  }, [userId]);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [connect]);

  /**
   * Subscribe to a WebSocket event
   */
  const on = useCallback(
    (eventType: string, callback: (message: any) => void) => {
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
   * Emit a WebSocket event locally
   */
  const emit = useCallback(
    (eventType: string, message: any) => {
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
   * Send a message through Socket.IO
   */
  const send = useCallback(
    (type: string, data: Record<string, any>) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(type, {
          type,
          userId,
          data,
          timestamp: new Date().toISOString(),
        });
      } else {
        console.warn("Socket.IO is not connected. Message not sent:", type, data);
      }
    },
    [userId]
  );

  return {
    connected,
    on,
    send,
    socket: socketRef.current,
  };
}
