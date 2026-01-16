'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, CheckCircle, AlertTriangle, Info, Zap, Terminal } from 'lucide-react'

type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'system'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  persistent?: boolean
  timestamp: Date
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration || 5000
    }

    setNotifications(prev => [newNotification, ...prev])

    // Auto-remove if not persistent
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationDisplay />
    </NotificationContext.Provider>
  )
}

function NotificationDisplay() {
  const { notifications, removeNotification } = useNotifications()

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-400" />
      case 'info':
        return <Info className="h-5 w-5 text-cyan-400" />
      case 'system':
        return <Terminal className="h-5 w-5 text-magenta-400" />
      default:
        return <Info className="h-5 w-5 text-cyan-400" />
    }
  }

  const getGradient = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/50'
      case 'error':
        return 'from-red-500/20 to-pink-500/20 border-red-500/50'
      case 'warning':
        return 'from-orange-500/20 to-yellow-500/20 border-orange-500/50'
      case 'info':
        return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/50'
      case 'system':
        return 'from-magenta-500/20 to-purple-500/20 border-magenta-500/50'
      default:
        return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/50'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-[9999] space-y-3 max-w-sm">
      {notifications.map((notification, index) => (
        <Card
          key={notification.id}
          className={`cyber-card bg-gradient-to-r ${getGradient(notification.type)} backdrop-blur-lg shadow-2xl transform transition-all duration-500 ease-out animate-in slide-in-from-right-full`}
          style={{
            animationDelay: `${index * 100}ms`,
            animationFillMode: 'both'
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-mono font-bold text-sm leading-tight">
                    {notification.title}
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNotification(notification.id)}
                    className="h-6 w-6 hover:bg-white/10 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {notification.message}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground/70 font-mono">
                    {notification.timestamp.toLocaleTimeString()}
                  </span>

                  {notification.type === 'system' && (
                    <div className="flex items-center gap-1 text-xs text-magenta-400">
                      <Zap className="h-3 w-3 animate-pulse" />
                      <span className="font-mono">SYSTEM</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar for auto-dismiss */}
            {!notification.persistent && (
              <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-magenta-400 rounded-full animate-[countdown_5s_linear_forwards]"
                  style={{ animationDuration: `${notification.duration}ms` }}
                />
              </div>
            )}

            {/* Scan line effect */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="h-full w-full bg-gradient-to-b from-transparent via-white/5 to-transparent bg-[length:100%_4px] animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Helper hook for common notifications
export function useSystemNotifications() {
  const { addNotification } = useNotifications()

  const notifySuccess = (title: string, message: string) => {
    addNotification({ type: 'success', title, message })
  }

  const notifyError = (title: string, message: string) => {
    addNotification({ type: 'error', title, message, duration: 7000 })
  }

  const notifyWarning = (title: string, message: string) => {
    addNotification({ type: 'warning', title, message, duration: 6000 })
  }

  const notifyInfo = (title: string, message: string) => {
    addNotification({ type: 'info', title, message })
  }

  const notifySystem = (title: string, message: string, persistent = false) => {
    addNotification({ type: 'system', title, message, persistent })
  }

  const notifyAnimeAdded = (animeTitle: string) => {
    notifySuccess(
      'ANIME_UPLOADED',
      `Новое аниме "${animeTitle}" успешно загружено в базу данных`
    )
  }

  const notifyRatingAdded = (animeTitle: string, rating: number) => {
    notifyInfo(
      'RATING_SUBMITTED',
      `Ваша оценка ${rating}/10 для "${animeTitle}" сохранена`
    )
  }

  const notifyCommentAdded = (animeTitle: string) => {
    notifySuccess(
      'COMMENT_POSTED',
      `Ваш комментарий к "${animeTitle}" опубликован`
    )
  }

  const notifyUserLoggedIn = (username: string) => {
    notifySystem(
      'USER_CONNECTED',
      `Пользователь ${username} подключился к системе`
    )
  }

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifySystem,
    notifyAnimeAdded,
    notifyRatingAdded,
    notifyCommentAdded,
    notifyUserLoggedIn
  }
}
