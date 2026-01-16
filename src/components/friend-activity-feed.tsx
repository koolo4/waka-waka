'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Activity, Star, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface ActivityItem {
  type: 'rating' | 'comment'
  id: string
  userId: number
  user: {
    id: number
    username: string
    avatar: string | null
  }
  anime: {
    id: number
    title: string
  }
  data: {
    rating?: number
    text?: string
  }
  createdAt: string
}

export function FriendActivityFeed() {
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch('/api/activity')
        const data = await res.json()
        setActivity(data)
      } catch (error) {
        console.error('Failed to fetch activity:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
    const interval = setInterval(fetchActivity, 60000) // Обновляем каждую минуту

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="cyber-card">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse text-cyan-400 font-mono">
            [ЗАГРУЗКА_АКТИВНОСТИ...]
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activity.length === 0) {
    return (
      <Card className="cyber-card">
        <CardContent className="p-6 text-center">
          <Activity className="h-12 w-12 neon-text-magenta mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">Нет активности от друзей</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="cyber-card">
      <CardHeader className="border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 neon-text-cyan" />
          <CardTitle className="neon-text-cyan">АКТИВНОСТЬ ДРУЗЕЙ</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {activity.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 p-4 rounded-lg border border-cyan-500/20 hover:border-cyan-400 transition-all duration-300"
          >
            {/* User Avatar */}
            <Avatar className="h-12 w-12 border-2 border-cyan-500/50 flex-shrink-0">
              <AvatarImage src={item.user.avatar || undefined} />
              <AvatarFallback className="bg-cyan-900 text-cyan-300 font-bold">
                {item.user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Activity Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/profile/${item.user.id}`}
                  className="font-bold neon-text hover:neon-text-cyan transition-colors"
                >
                  {item.user.username}
                </Link>

                {item.type === 'rating' && (
                  <>
                    <span className="text-muted-foreground">оценил</span>
                    <Link
                      href={`/anime/${item.anime.id}`}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      {item.anime.title}
                    </Link>
                    <Badge className="cyber-badge bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-400">
                      <Star className="h-3 w-3 mr-1" />
                      {item.data.rating}/10
                    </Badge>
                  </>
                )}

                {item.type === 'comment' && (
                  <>
                    <span className="text-muted-foreground">оставил комментарий к</span>
                    <Link
                      href={`/anime/${item.anime.id}`}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      {item.anime.title}
                    </Link>
                  </>
                )}
              </div>

              {item.type === 'comment' && item.data.text && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  "{item.data.text}..."
                </p>
              )}

              <div className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(item.createdAt), { locale: ru, addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
