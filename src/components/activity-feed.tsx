'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageSquare, Eye, Plus, Clock, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ActivityEvent {
  id: string
  userId: string
  username: string
  avatar: string | null
  type: 'rated' | 'commented' | 'watched' | 'added_friend'
  animeId?: number
  animeTitle?: string
  animeImage?: string | null
  rating?: number
  comment?: string
  timestamp: Date
}

interface ActivityFeedProps {
  events?: ActivityEvent[]
  loading?: boolean
  fetchFromAPI?: boolean
}

export function ActivityFeed({ events: initialEvents = [], loading: initialLoading = false, fetchFromAPI = true }: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents)
  const [loading, setLoading] = useState(initialLoading)

  // Fetch from API if enabled
  useEffect(() => {
    if (!fetchFromAPI) return

    const fetchActivityFeed = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/activity-feed?limit=20')
        const data = await response.json()
        
        if (data.activities) {
          setEvents(data.activities)
        }
      } catch (error) {
        console.error('Failed to fetch activity feed:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivityFeed()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActivityFeed, 30000)
    return () => clearInterval(interval)
  }, [fetchFromAPI])

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/activity-feed?limit=20')
      const data = await response.json()
      if (data.activities) {
        setEvents(data.activities)
      }
    } catch (error) {
      console.error('Failed to refresh activity feed:', error)
    } finally {
      setLoading(false)
    }
  }
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'rated':
        return <Heart className="h-4 w-4 text-red-400" />
      case 'commented':
        return <MessageSquare className="h-4 w-4 text-blue-400" />
      case 'watched':
        return <Eye className="h-4 w-4 text-cyan-400" />
      case 'added_friend':
        return <Plus className="h-4 w-4 text-green-400" />
      default:
        return null
    }
  }

  const getActivityMessage = (event: ActivityEvent) => {
    switch (event.type) {
      case 'rated':
        return (
          <>
            rated{' '}
            <Link href={`/anime/${event.animeId}`} className="text-cyan-400 hover:text-cyan-300">
              {event.animeTitle}
            </Link>
            {event.rating && ` with ⭐ ${event.rating}`}
          </>
        )
      case 'commented':
        return (
          <>
            commented on{' '}
            <Link href={`/anime/${event.animeId}`} className="text-cyan-400 hover:text-cyan-300">
              {event.animeTitle}
            </Link>
          </>
        )
      case 'watched':
        return (
          <>
            started watching{' '}
            <Link href={`/anime/${event.animeId}`} className="text-cyan-400 hover:text-cyan-300">
              {event.animeTitle}
            </Link>
          </>
        )
      case 'added_friend':
        return 'joined the community'
      default:
        return 'did something'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-cyan-400">Friend Activity</h3>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          variant="ghost"
          size="sm"
          className="border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 text-cyan-400"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Activities */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading activities...</div>
        ) : events.length > 0 ? (
          events.map(event => (
            <Link
              key={event.id}
              href={`/profile/${event.userId}`}
              className="flex gap-3 p-3 rounded-lg bg-card/50 border border-cyan-500/20 hover:border-cyan-400 transition-all group"
            >
              {/* Avatar */}
              <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-cyan-500/30 group-hover:border-cyan-400 transition-colors">
                <AvatarImage src={event.avatar || undefined} />
                <AvatarFallback>{event.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-bold text-cyan-400 hover:text-cyan-300">
                        {event.username}
                      </span>
                      <span className="text-muted-foreground"> {getActivityMessage(event)}</span>
                    </p>

                    {event.comment && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                        &quot;{event.comment}&quot;
                      </p>
                    )}
                  </div>

                  {/* Icon */}
                  <div className="flex-shrink-0 p-2 rounded-lg bg-background/50">
                    {getActivityIcon(event.type)}
                  </div>
                </div>

                {/* Time */}
                <p className="text-xs text-muted-foreground mt-2">
                  {formatTime(event.timestamp)}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center">
            <Eye className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground">No friend activities yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
