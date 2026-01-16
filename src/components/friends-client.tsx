'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Check, X, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: number
  username: string
  avatar?: string | null
}

interface FriendData {
  id: number
  sender: User
  receiver: User
  status: string
  acceptedAt?: string
}

interface FriendsClientProps {
  currentUserId: number
}

export function FriendsClient({ currentUserId }: FriendsClientProps) {
  const [friends, setFriends] = useState<FriendData[]>([])
  const [pending, setPending] = useState<FriendData[]>([])
  const [sent, setSent] = useState<FriendData[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    setLoading(true)
    try {
      // Получаем принятые запросы
      const acceptedRes = await fetch('/api/friends?type=accepted')
      const acceptedData = await acceptedRes.json()

      // Получаем входящие запросы
      const pendingRes = await fetch('/api/friends?type=pending')
      const pendingData = await pendingRes.json()

      // Получаем отправленные запросы
      const sentRes = await fetch('/api/friends?type=sent')
      const sentData = await sentRes.json()

      setFriends(acceptedData.friends || [])
      setPending(pendingData.friends || [])
      setSent(sentData.friends || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (friendId: number) => {
    setActionLoading(friendId)
    try {
      const res = await fetch(`/api/friends/${friendId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' })
      })

      if (res.ok) {
        await loadFriends()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (friendId: number) => {
    setActionLoading(friendId)
    try {
      const res = await fetch(`/api/friends/${friendId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      })

      if (res.ok) {
        await loadFriends()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (friendId: number) => {
    setActionLoading(friendId)
    try {
      const res = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        await loadFriends()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  const FriendItem = ({ friend, showActions, actionType }: any) => {
    const otherUser = friend.senderId === currentUserId ? friend.receiver : friend.sender
    const isLoading = actionLoading === friend.id

    return (
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <Link href={`/profile/${otherUser.id}`} className="flex items-center gap-3 flex-1 hover:opacity-80 transition">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.avatar || undefined} />
            <AvatarFallback>{otherUser.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{otherUser.username}</p>
            {actionType === 'accepted' && friend.acceptedAt && (
              <p className="text-xs text-muted-foreground">
                С {new Date(friend.acceptedAt).toLocaleDateString('ru-RU')}
              </p>
            )}
          </div>
        </Link>

        {showActions && actionType === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAccept(friend.id)}
              disabled={isLoading}
              className="gap-1"
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReject(friend.id)}
              disabled={isLoading}
              className="gap-1"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {showActions && actionType === 'accepted' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRemove(friend.id)}
            disabled={isLoading}
            className="gap-1"
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        {showActions && actionType === 'sent' && (
          <Badge variant="secondary" className="text-xs">
            Ожидание
          </Badge>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    )
  }

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 neon-text" />
          Друзья и запросы
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="accepted" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accepted">
              Друзья ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Входящие ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Отправленные ({sent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accepted" className="space-y-3 mt-4">
            {friends.length > 0 ? (
              friends.map(friend => (
                <FriendItem
                  key={friend.id}
                  friend={friend}
                  showActions={true}
                  actionType="accepted"
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                У тебя пока нет друзей
              </p>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {pending.length > 0 ? (
              pending.map(friend => (
                <FriendItem
                  key={friend.id}
                  friend={friend}
                  showActions={true}
                  actionType="pending"
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Нет входящих запросов
              </p>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-3 mt-4">
            {sent.length > 0 ? (
              sent.map(friend => (
                <FriendItem
                  key={friend.id}
                  friend={friend}
                  showActions={false}
                  actionType="sent"
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Ты не отправлял запросы
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
