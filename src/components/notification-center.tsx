'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from './toast-provider'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    loadNotifications()
    // Проверяем каждые 30 секунд
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true })
      })
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
        setUnreadCount(Math.max(0, unreadCount - 1))
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications', {
        method: 'POST'
      })
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
        addToast('All notifications marked as read', 'success')
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      addToast('Failed to mark notifications as read', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'friend_request':
        return 'border-blue-500/30 text-blue-400'
      case 'comment':
        return 'border-green-500/30 text-green-400'
      case 'rating':
        return 'border-yellow-500/30 text-yellow-400'
      case 'recommendation':
        return 'border-purple-500/30 text-purple-400'
      default:
        return 'border-cyan-500/30 text-cyan-400'
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-card border border-cyan-500/30 rounded-lg shadow-lg shadow-cyan-500/20 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
            <h3 className="font-semibold text-cyan-400">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={markAllAsRead}
                disabled={loading}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-cyan-500/10 cursor-pointer transition-colors hover:bg-card/80 ${
                    !notification.read ? 'bg-card/50' : ''
                  } ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex-1"
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground/50 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString('ru-RU', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-cyan-500/20 text-center">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
