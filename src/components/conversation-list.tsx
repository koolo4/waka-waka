'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Search, Plus, Clock } from 'lucide-react'
import Link from 'next/link'

interface ConversationWithMessages {
  id: number
  participant: {
    id: number
    username: string
    avatar: string | null
  }
  lastMessage: {
    content: string
    senderId: number
    isRead: boolean
    createdAt: Date
  } | null
  unreadCount: number
  lastMessageAt: Date
  createdAt: Date
}

interface ConversationListProps {
  onSelectConversation?: (conversationId: number, participant: any) => void
  selectedId?: number
}

export function ConversationList({
  onSelectConversation,
  selectedId
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([])
  const [filteredConversations, setFilteredConversations] = useState<ConversationWithMessages[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Загружаем диалоги
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/conversations?limit=50')
        const data = await response.json()
        setConversations(data.conversations || [])
        setFilteredConversations(data.conversations || [])
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()

    // АвтоRefresh каждые 5 секунд
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [])

  // Фильтруем по поисковому запросу
  useEffect(() => {
    const filtered = conversations.filter(conv =>
      conv.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredConversations(filtered)
  }, [searchQuery, conversations])

  const formatTime = (date: Date) => {
    const now = new Date()
    const messageDate = new Date(date)
    const diff = now.getTime() - messageDate.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'сейчас'
    if (minutes < 60) return `${minutes}м`
    if (hours < 24) return `${hours}ч`
    if (days < 7) return `${days}д`
    return messageDate.toLocaleDateString('ru-RU')
  }

  const getTotalUnread = () => {
    return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
  }

  return (
    <Card className="cyber-card flex flex-col h-full">
      {/* Header */}
      <CardHeader className="border-b border-cyan-500/20 pb-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Сообщения
              {getTotalUnread() > 0 && (
                <Badge className="bg-red-500/20 border-red-500/50 text-red-400 ml-auto">
                  {getTotalUnread()}
                </Badge>
              )}
            </CardTitle>
            <Button
              size="icon"
              className="cyber-button bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-300 hover:border-cyan-400"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск контактов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-cyan-500/20 focus:border-cyan-400 text-sm"
            />
          </div>
        </div>
      </CardHeader>

      {/* Conversations List */}
      <CardContent className="flex-1 overflow-y-auto p-0">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Загружаем диалоги...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            {conversations.length === 0 ? (
              <>
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">Нет диалогов</p>
                <p className="text-xs text-muted-foreground mt-1">Начните беседу с друзьями</p>
              </>
            ) : (
              <>
                <Search className="h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">Ничего не найдено</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-cyan-500/10">
            {filteredConversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation?.(conversation.id, conversation.participant)}
                className={`w-full p-3 text-left transition-colors hover:bg-cyan-500/10 ${
                  selectedId === conversation.id ? 'bg-cyan-500/20 border-l-2 border-cyan-400' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-cyan-500/30">
                    <AvatarImage src={conversation.participant.avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-900 to-magenta-900">
                      {conversation.participant.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-mono font-bold text-cyan-300 truncate">
                        {conversation.participant.username}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-red-500/20 border-red-500/50 text-red-400 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(new Date(conversation.lastMessageAt))}
                        </span>
                      </div>
                    </div>

                    {/* Last message */}
                    {conversation.lastMessage ? (
                      <p className={`text-sm truncate ${
                        conversation.lastMessage.isRead
                          ? 'text-muted-foreground'
                          : 'text-cyan-100 font-semibold'
                      }`}>
                        {conversation.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Нет сообщений</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
