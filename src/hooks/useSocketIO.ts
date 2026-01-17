"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface UseSocketIOOptions {
  autoConnect?: boolean;
  reconnection?: boolean;
}

export function useSocketIO(options: UseSocketIOOptions = {}) {
  const { autoConnect = true, reconnection = true } = options;
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!autoConnect) return;

    const socketUrl = typeof window !== "undefined" ? window.location.origin.replace("3000", "3001") : "";

    const socket = io(socketUrl, {
      reconnection,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      path: "/socket.io/",
    });

    socket.on("connect", () => {
      console.log("✓ Socket.io connected:", socket.id);
      setConnected(true);

      // Join user room if authenticated
      if (session?.user?.id) {
        socket.emit("user:join", parseInt(session.user.id));
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket.io disconnected");
      setConnected(false);
    });

    socket.on("error", (error) => {
      console.error("⚠️ Socket.io error:", error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [autoConnect, reconnection, session?.user?.id]);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
      return () => socketRef.current?.off(event, handler);
    }
    return () => {};
  }, []);

  return {
    socket: socketRef.current,
    connected,
    emit,
    on,
  };
}
