'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const ConfirmDialog = React.memo(function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm()
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-card border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/20 p-6 max-w-sm mx-4 animate-in scale-95 fade-in">
        <div className="flex items-start gap-4">
          {isDangerous && (
            <div className="shrink-0 mt-0.5">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold neon-text mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isProcessing || isLoading}
            className="cyber-button border-cyan-500/50 text-cyan-400"
          >
            {cancelText}
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isProcessing || isLoading}
            className={`cyber-button ${
              isDangerous
                ? 'border-red-500/50 text-red-400 hover:border-red-400'
                : 'border-green-500/50 text-green-400 hover:border-green-400'
            }`}
          >
            {isProcessing || isLoading ? (
              <span className="inline-block animate-spin mr-2">⟳</span>
            ) : null}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
})
