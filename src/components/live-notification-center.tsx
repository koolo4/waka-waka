"use client";

import { useEffect, useState } from "react";
import { useSocketIO } from "@/hooks/useSocketIO";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  timestamp: string;
}

export function LiveNotificationCenter({ maxNotifications = 5 }: { maxNotifications?: number }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { connected, on } = useSocketIO();

  useEffect(() => {
    const unsubscribe = on("notification:new", (data) => {
      const notification: Notification = {
        id: `${Date.now()}`,
        type: data.type,
        title: data.title,
        message: data.message,
        icon: data.icon || "🔔",
        timestamp: data.timestamp,
      };

      setNotifications((prev) => [notification, ...prev].slice(0, maxNotifications));

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 5000);
    });

    return unsubscribe;
  }, [maxNotifications, on]);

  if (!connected && notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {/* Connection status */}
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-900/80 rounded-full text-xs text-gray-400 pointer-events-auto">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
        {connected ? "Live" : "Connecting..."}
      </div>

      {/* Notifications */}
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="bg-gradient-to-r from-purple-900/80 to-pink-900/80 border border-purple-500/50 rounded-lg p-3 animate-slide-in pointer-events-auto shadow-lg"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">{notif.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{notif.title}</p>
              <p className="text-xs text-gray-300 truncate">{notif.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
