'use client'

import { createContext, useContext, useState, useCallback, ReactNode, memo } from 'react'
import { Check, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = Date.now().toString()
      setToasts((prev) => [...prev, { id, message, type, duration }])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

const ToastContainer = memo(function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
})

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

const ToastItem = memo(function ToastItem({ toast, onRemove }: ToastItemProps) {
  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-900/80 border-emerald-500/30 text-emerald-100'
      case 'error':
        return 'bg-red-900/80 border-red-500/30 text-red-100'
      case 'warning':
        return 'bg-amber-900/80 border-amber-500/30 text-amber-100'
      case 'info':
      default:
        return 'bg-blue-900/80 border-blue-500/30 text-blue-100'
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Check className="h-5 w-5 text-emerald-400" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-400" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm pointer-events-auto
        ${getStyles()}
        animate-in slide-in-from-right-5 fade-in duration-300
      `}
    >
      {getIcon()}
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 text-current/50 hover:text-current transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
})
