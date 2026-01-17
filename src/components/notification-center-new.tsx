'use client';

import { useEffect, useState } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useWebSocket } from '@/hooks/useWebSocketIO';
import { useSession } from 'next-auth/react';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedId?: number | null;
  createdAt: string;
}

export function NotificationCenter() {
  const { data: session } = useSession();
  const userId = session?.user?.id ? parseInt(session.user.id) : null;
  const { on: wsOn, connected } = useWebSocket(userId);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем уведомления при первой загрузке
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Подписываемся на новые уведомления через WebSocket
  useEffect(() => {
    if (!connected) return;

    // Слушаем новые уведомления
    const unsubscribeNew = wsOn('notification:new', (message) => {
      console.log('📢 New notification received:', message);
      if (message.data && message.data.notification) {
        const newNotification = message.data.notification;
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        setUnreadCount(prev => prev + 1);
      }
    });

    // Слушаем прочитанные уведомления
    const unsubscribeRead = wsOn('notification:read', (message) => {
      console.log('✓ Notification read:', message);
      if (message.data && message.data.notificationId) {
        const notifId = message.data.notificationId;
        setNotifications(prev =>
          prev.map(n =>
            n.id === notifId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    });

    return () => {
      unsubscribeNew();
      unsubscribeRead();
    };
  }, [connected, wsOn]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true })
      });
      if (response.ok) {
        setNotifications(
          notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST'
      });
      if (response.ok) {
        setNotifications(
          notifications.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      friend_request: '👥',
      comment: '💬',
      rating: '⭐',
      recommendation: '🎯',
      system: '⚙️'
    };
    return icons[type] || '📢';
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.type === 'friend_request') {
      return '/profile/friends';
    }
    if (notification.relatedId) {
      return `/anime/${notification.relatedId}`;
    }
    return null;
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-lg dark:text-white">Уведомления</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X size={18} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>Нет уведомлений</p>
              </div>
            ) : (
              notifications.map(notif => {
                const link = getNotificationLink(notif);
                const content = (
                  <div
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl mt-1">{getNotificationIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm dark:text-white truncate">
                          {notif.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(notif.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="mt-1 p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded text-blue-600 dark:text-blue-400"
                          title="Отметить как прочитанное"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="mt-1 p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded text-red-600 dark:text-red-400"
                        title="Удалить"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );

                return link ? (
                  <Link key={notif.id} href={link}>
                    {content}
                  </Link>
                ) : (
                  <div key={notif.id}>{content}</div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleMarkAllAsRead}
                className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-semibold transition-colors"
              >
                Отметить все как прочитанные
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
