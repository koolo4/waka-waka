'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users as UsersIcon, Search, UserPlus, UserCheck, Clock } from 'lucide-react'

interface UserProfile {
  id: number
  username: string
  email: string
  avatar: string | null
  createdAt: string
  _count: {
    ratings: number
    comments: number
  }
}

interface UserWithStatus extends UserProfile {
  friendStatus?: {
    status: string
    senderId: number
  } | null
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<UserWithStatus[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  if (status === 'unauthenticated') {
    redirect('/auth/signin')
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const query = search ? `?search=${encodeURIComponent(search)}` : ''
        const res = await fetch(`/api/users${query}`)
        const data = await res.json()
        setUsers(data)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchUsers, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleAddFriend = async (userId: number) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId })
      })
      if (res.ok) {
        // Обновляем статус пользователя локально
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, friendStatus: { status: 'PENDING', senderId: parseInt(session?.user?.id || '0') } }
            : u
        ))
      }
    } catch (error) {
      console.error('Failed to add friend:', error)
    }
  }

  const getFriendStatusBadge = (user: UserWithStatus) => {
    if (!user.friendStatus) return null
    
    if (user.friendStatus.status === 'ACCEPTED') {
      return (
        <Badge className="cyber-badge bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-400">
          ✓ ДРУГ
        </Badge>
      )
    }
    if (user.friendStatus.senderId === parseInt(session?.user?.id || '0')) {
      return (
        <Badge className="cyber-badge bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-orange-500/50 text-orange-400">
          <Clock className="h-3 w-3 mr-1" />
          ЗАПРОС ОТПРАВЛЕН
        </Badge>
      )
    }
    return (
      <Badge className="cyber-badge bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50 text-blue-400">
        <Clock className="h-3 w-3 mr-1" />
        ВХОДЯЩИЙ ЗАПРОС
      </Badge>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Matrix Rain Background */}
      <div className="matrix-rain"></div>
      <div className="digital-particles"></div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="cyber-badge inline-flex items-center gap-2 mb-4">
            <UsersIcon className="h-4 w-4" />
            <span>USER DATABASE SCAN</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 neon-text">
            НАЙТИ ОПЕРАТОРОВ
          </h1>
          <p className="text-muted-foreground font-mono">
            Ищите других пользователей и добавляйте их в друзья
          </p>
        </div>

        {/* Search Bar */}
        <Card className="cyber-card mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-cyan-400" />
              <Input
                placeholder="Поиск по имени пользователя..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 cyber-input border-cyan-500/30"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-cyan-400 font-mono">
              [СКАНИРОВАНИЕ_БАЗЫ_ДАННЫХ...]
            </div>
          </div>
        ) : users.length === 0 ? (
          <Card className="cyber-card">
            <CardContent className="p-12 text-center">
              <UsersIcon className="h-16 w-16 neon-text-magenta mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Пользователи не найдены</h3>
              <p className="text-muted-foreground">
                {search ? 'Попробуйте другой поисковой запрос' : 'Нет доступных пользователей'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.id} className="cyber-card hover:border-cyan-400 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Avatar */}
                    <Avatar className="h-24 w-24 border-4 border-cyan-500/50 shadow-lg shadow-cyan-500/20">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-cyan-900 to-magenta-900 text-cyan-300 font-mono font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Username */}
                    <div>
                      <h3 className="text-xl font-bold neon-text font-mono">{user.username}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{user.email}</p>
                    </div>

                    {/* Status Badge */}
                    {getFriendStatusBadge(user) && (
                      <div className="w-full">
                        {getFriendStatusBadge(user)}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="cyber-stat-card cyan p-3">
                        <div className="text-lg font-black neon-text">{user._count.ratings}</div>
                        <div className="text-xs text-muted-foreground uppercase">Оценок</div>
                      </div>
                      <div className="cyber-stat-card magenta p-3">
                        <div className="text-lg font-black neon-text-magenta">{user._count.comments}</div>
                        <div className="text-xs text-muted-foreground uppercase">Комментариев</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="w-full flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 cyber-button border-cyan-500/50 text-cyan-400 hover:border-cyan-400"
                        asChild
                      >
                        <Link href={`/profile/${user.id}`}>
                          Профиль
                        </Link>
                      </Button>

                      {!user.friendStatus && (
                        <Button
                          className="flex-1 cyber-button border-cyan-500/50 text-cyan-400 hover:border-cyan-400"
                          onClick={() => handleAddFriend(user.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Добавить
                        </Button>
                      )}
                      {user.friendStatus?.status === 'ACCEPTED' && (
                        <Button
                          variant="outline"
                          className="flex-1"
                          disabled
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          В друзьях
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
