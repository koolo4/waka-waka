'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, Phone, Video, Info, X } from 'lucide-react'
import Link from 'next/link'
import { MessageInput } from './message-input'

interface Message {
  id: number
  senderId: number
  content: string
  isRead: boolean
  createdAt: Date
  sender: {
    id: number
    username: string
    avatar: string | null
  }
}

interface ChatWindowProps {
  conversationId: number
  participant: {
    id: number
    username: string
    avatar: string | null
  }
  onClose?: () => void
}

export function ChatWindow({
  conversationId,
  participant,
  onClose
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Загружаем сообщения
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/messages?conversationId=${conversationId}&limit=50`)
        const data = await response.json()
        setMessages(data.messages || [])
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // АвтоRefresh каждые 3 секунды
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [conversationId])

  // Автоскролл вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    try {
      setSending(true)
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content
        })
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages([...messages, newMessage])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const messageDate = new Date(date)
    const diff = now.getTime() - messageDate.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'сейчас'
    if (minutes < 60) return `${minutes}м назад`
    if (hours < 24) return `${hours}ч назад`
    if (days < 7) return `${days}д назад`
    return messageDate.toLocaleDateString()
  }

  return (
    <Card className="cyber-card h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b border-cyan-500/20 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-cyan-500/30">
              <AvatarImage src={participant.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-900 to-magenta-900">
                {participant.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-cyan-400">
                <Link href={`/profile/${participant.id}`} className="hover:text-cyan-300">
                  {participant.username}
                </Link>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 text-cyan-400"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 text-cyan-400"
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 text-cyan-400"
            >
              <Info className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                size="icon"
                onClick={onClose}
                variant="ghost"
                className="border border-red-500/30 hover:border-red-400 hover:bg-red-500/10 text-red-400"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages Container */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/30">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Загружаем сообщения...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Начните беседу</p>
              <p className="text-xs text-muted-foreground">Напишите первое сообщение</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.senderId === participant.id ? 'justify-start' : 'justify-end'}`}
            >
              {message.senderId === participant.id && (
                <Avatar className="h-8 w-8 flex-shrink-0 border border-cyan-500/30">
                  <AvatarImage src={message.sender.avatar || undefined} />
                  <AvatarFallback>{message.sender.username[0]}</AvatarFallback>
                </Avatar>
              )}

              <div
                className={`flex flex-col max-w-xs gap-1 ${
                  message.senderId === participant.id ? 'items-start' : 'items-end'
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.senderId === participant.id
                      ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-100'
                      : 'bg-magenta-500/20 border border-magenta-500/30 text-magenta-100'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatTime(new Date(message.createdAt))}</span>
                  {message.senderId !== participant.id && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        message.isRead
                          ? 'border-green-500/30 text-green-400'
                          : 'border-yellow-500/30 text-yellow-400'
                      }`}
                    >
                      {message.isRead ? '✓✓' : '✓'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="border-t border-cyan-500/20 p-4 bg-background/50">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={sending || loading}
        />
      </div>
    </Card>
  )
}
