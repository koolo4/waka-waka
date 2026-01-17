// Direct Messaging System - Implementation Examples

// ============================================
// 1. CREATING A CONVERSATION
// ============================================

async function startConversation(participantId: number) {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantId })
  })
  
  if (!response.ok) {
    throw new Error(`Failed to create conversation: ${response.statusText}`)
  }
  
  const conversation = await response.json()
  console.log('Conversation created:', conversation.id)
  return conversation
}

// Usage
// const conv = await startConversation(42) // Start chat with user ID 42


// ============================================
// 2. FETCHING ALL CONVERSATIONS
// ============================================

async function fetchConversations(limit = 50, offset = 0) {
  const response = await fetch(
    `/api/conversations?limit=${limit}&offset=${offset}`
  )
  
  if (!response.ok) {
    throw new Error('Failed to fetch conversations')
  }
  
  const data = await response.json()
  // Returns:
  // {
  //   conversations: [
  //     {
  //       id: 1,
  //       participant: { id: 42, username: "john", avatar: null },
  //       lastMessage: { 
  //         content: "Hey!", 
  //         senderId: 42, 
  //         isRead: true,
  //         createdAt: "2024-01-16T10:30:00Z"
  //       },
  //       unreadCount: 0,
  //       lastMessageAt: "2024-01-16T10:30:00Z",
  //       createdAt: "2024-01-16T10:00:00Z"
  //     }
  //   ]
  // }
  
  return data.conversations
}

// Usage
// const conversations = await fetchConversations()
// conversations.forEach(conv => {
//   console.log(`${conv.participant.username}: ${conv.unreadCount} unread`)
// })


// ============================================
// 3. SENDING A MESSAGE
// ============================================

async function sendMessage(conversationId: number, content: string) {
  if (!content.trim()) {
    throw new Error('Message cannot be empty')
  }
  
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, content })
  })
  
  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`)
  }
  
  const message = await response.json()
  // Returns:
  // {
  //   id: 1,
  //   senderId: 57,
  //   sender: { id: 57, username: "me", avatar: null },
  //   content: "Hello!",
  //   isRead: false,
  //   createdAt: "2024-01-16T10:35:00Z"
  // }
  
  return message
}

// Usage
// const msg = await sendMessage(1, "Hey, how are you?")
// console.log(`Message sent: ${msg.content}`)


// ============================================
// 4. FETCHING MESSAGES FROM CONVERSATION
// ============================================

async function fetchMessages(conversationId: number, limit = 30, offset = 0) {
  const response = await fetch(
    `/api/messages?conversationId=${conversationId}&limit=${limit}&offset=${offset}`
  )
  
  if (!response.ok) {
    throw new Error('Failed to fetch messages')
  }
  
  const data = await response.json()
  // Returns:
  // {
  //   messages: [
  //     {
  //       id: 1,
  //       senderId: 42,
  //       sender: { id: 42, username: "john", avatar: null },
  //       content: "Hi there!",
  //       isRead: true,
  //       createdAt: "2024-01-16T10:30:00Z"
  //     },
  //     {
  //       id: 2,
  //       senderId: 57,
  //       sender: { id: 57, username: "me", avatar: null },
  //       content: "Hey! How are you?",
  //       isRead: false,
  //       createdAt: "2024-01-16T10:35:00Z"
  //     }
  //   ],
  //   total: 15
  // }
  
  return data
}

// Usage
// const { messages, total } = await fetchMessages(1)
// console.log(`Showing ${messages.length} of ${total} messages`)


// ============================================
// 5. MARKING MESSAGE AS READ
// ============================================

async function markMessageAsRead(messageId: number) {
  const response = await fetch('/api/messages', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId })
  })
  
  if (!response.ok) {
    throw new Error('Failed to mark message as read')
  }
  
  const message = await response.json()
  return message
}

// Usage
// await markMessageAsRead(2)
// console.log("Message marked as read")


// ============================================
// 6. REACT COMPONENT EXAMPLE - USING MESSAGING
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { ChatInterface } from '@/components/chat-interface'

export default function MessagesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Page is automatically authenticated by Next.js middleware
    setLoading(false)
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  // All messaging functionality is handled by ChatInterface component
  // which manages conversations, messages, and real-time updates
  return <ChatInterface />
}


// ============================================
// 7. ADVANCED USAGE - REAL-TIME MESSAGE POLLING
// ============================================

class MessagingService {
  private pollInterval: NodeJS.Timeout | null = null
  private conversationId: number | null = null

  // Start polling for new messages
  startPolling(conversationId: number, onNewMessage: (msg: any) => void) {
    this.conversationId = conversationId
    let lastMessageId = 0

    this.pollInterval = setInterval(async () => {
      try {
        const { messages } = await fetchMessages(conversationId, 10, 0)
        const newMessages = messages.filter(m => m.id > lastMessageId)
        
        newMessages.forEach(msg => {
          onNewMessage(msg)
          lastMessageId = Math.max(lastMessageId, msg.id)
        })
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 3000) // Poll every 3 seconds
  }

  // Stop polling
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }
}

// Usage
// const service = new MessagingService()
// service.startPolling(1, (msg) => {
//   console.log(`New message from ${msg.sender.username}: ${msg.content}`)
// })


// ============================================
// 8. ERROR HANDLING GUIDE
// ============================================

async function safeMessageSend(conversationId: number, content: string) {
  try {
    // Validate input
    if (!conversationId || conversationId <= 0) {
      throw new Error('Invalid conversation ID')
    }
    
    if (!content || content.trim().length === 0) {
      throw new Error('Message cannot be empty')
    }
    
    if (content.length > 5000) {
      throw new Error('Message too long (max 5000 characters)')
    }

    // Send message
    const message = await sendMessage(conversationId, content)
    
    return {
      success: true,
      message,
      error: null
    }
  } catch (err: any) {
    const error = err.message || 'Failed to send message'
    
    // Handle specific errors
    if (error.includes('Unauthorized')) {
      // User not authenticated - redirect to signin
      window.location.href = '/auth/signin'
    } else if (error.includes('Forbidden')) {
      // User not part of conversation
      console.error('You are not a participant in this conversation')
    } else if (error.includes('Not Found')) {
      // Conversation doesn't exist
      console.error('Conversation not found')
    }
    
    return {
      success: false,
      message: null,
      error: error
    }
  }
}


// ============================================
// 9. BATCH OPERATIONS
// ============================================

async function markMultipleMessagesAsRead(messageIds: number[]) {
  const promises = messageIds.map(id => 
    markMessageAsRead(id).catch(err => {
      console.error(`Failed to mark message ${id} as read:`, err)
      return null
    })
  )
  
  const results = await Promise.allSettled(promises)
  const successful = results.filter(r => r.status === 'fulfilled').length
  
  console.log(`Marked ${successful}/${messageIds.length} messages as read`)
  return successful
}

// Usage
// await markMultipleMessagesAsRead([1, 2, 3, 4, 5])


// ============================================
// 10. CONVERSATION SEARCH
// ============================================

async function searchConversations(query: string) {
  try {
    const conversations = await fetchConversations()
    
    return conversations.filter(conv => {
      const username = conv.participant.username.toLowerCase()
      const queryLower = query.toLowerCase()
      
      return username.includes(queryLower) || 
             conv.lastMessage?.content.toLowerCase().includes(queryLower)
    })
  } catch (err) {
    console.error('Search failed:', err)
    return []
  }
}

// Usage
// const results = await searchConversations("john")
// results.forEach(conv => console.log(conv.participant.username))


export {
  startConversation,
  fetchConversations,
  sendMessage,
  fetchMessages,
  markMessageAsRead,
  MessagingService,
  safeMessageSend,
  markMultipleMessagesAsRead,
  searchConversations
}
