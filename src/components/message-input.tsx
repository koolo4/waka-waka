'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Paperclip, Smile } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [message])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message)
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-end bg-background/50 border border-cyan-500/20 rounded-lg p-3 focus-within:border-cyan-400">
        {/* Attachment button */}
        <Button
          size="icon"
          variant="ghost"
          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 flex-shrink-0"
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение... (Shift+Enter для новой строки)"
          disabled={disabled}
          className="flex-1 bg-transparent text-foreground placeholder-muted-foreground outline-none resize-none max-h-[120px] text-sm font-mono"
          rows={1}
        />

        {/* Emoji button */}
        <Button
          size="icon"
          variant="ghost"
          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 flex-shrink-0"
          disabled={disabled}
        >
          <Smile className="h-4 w-4" />
        </Button>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="cyber-button bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 border-cyan-500/50 text-cyan-300 hover:border-cyan-400 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Character count */}
      <div className="text-xs text-muted-foreground text-right">
        {message.length} символов
      </div>
    </div>
  )
}
