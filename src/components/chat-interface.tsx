'use client'

import { useState } from 'react'
import { ConversationList } from './conversation-list'
import { ChatWindow } from './chat-window'
import { Card } from '@/components/ui/card'
import { MessageCircle } from 'lucide-react'

interface Participant {
  id: number
  username: string
  avatar: string | null
}

export function ChatInterface() {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)

  const handleSelectConversation = (conversationId: number, participant: Participant) => {
    setSelectedConversationId(conversationId)
    setSelectedParticipant(participant)
  }

  const handleCloseChat = () => {
    setSelectedConversationId(null)
    setSelectedParticipant(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[600px]">
      {/* Conversation List */}
      <div className="lg:col-span-1">
        <ConversationList
          onSelectConversation={handleSelectConversation}
          selectedId={selectedConversationId || undefined}
        />
      </div>

      {/* Chat Window */}
      <div className="lg:col-span-3">
        {selectedConversationId && selectedParticipant ? (
          <ChatWindow
            conversationId={selectedConversationId}
            participant={selectedParticipant}
            onClose={handleCloseChat}
          />
        ) : (
          <Card className="cyber-card h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-cyan-400/50 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-cyan-400 mb-2">Выберите диалог</h3>
              <p className="text-muted-foreground">
                Нажмите на диалог из списка слева, чтобы начать общение
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
