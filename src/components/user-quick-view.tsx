'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Trophy, MessageSquare, Film, Users, Zap } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface UserQuickViewData {
  id: string
  username: string
  email?: string
  avatar?: string | null
  stats?: {
    ratingsCount: number
    commentsCount: number
    animesViewed: number
    friendsCount: number
    activityScore: number
  }
}

interface UserQuickViewProps {
  isOpen: boolean
  userId: string
  onClose: () => void
}

export function UserQuickView({ isOpen, userId, onClose }: UserQuickViewProps) {
  const [user, setUser] = useState<UserQuickViewData | null>(null)
  const [loading, setLoading] = useState(false)

  const loadUser = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/user/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (isOpen && userId) {
      loadUser()
    }
  }, [isOpen, userId, loadUser])

  const getRankTier = (score: number): { label: string; color: string; emoji: string } => {
    if (score >= 1000) return { label: 'Legendary', color: 'text-yellow-400', emoji: '🌟' }
    if (score >= 500) return { label: 'Master', color: 'text-orange-400', emoji: '⭐' }
    if (score >= 200) return { label: 'Expert', color: 'text-cyan-400', emoji: '✨' }
    if (score >= 50) return { label: 'Contributor', color: 'text-green-400', emoji: '🎯' }
    return { label: 'Member', color: 'text-blue-400', emoji: '👤' }
  }

  if (!isOpen) return null
  if (!user) return null

  const rankTier = getRankTier(user.stats?.activityScore || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-card border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/20 w-80 max-h-[90vh] overflow-y-auto animate-in scale-95 fade-in pointer-events-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1 hover:bg-card/50 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Avatar & Rank */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24 border-2 border-cyan-500/50">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 text-2xl ${rankTier.emoji}`} />
            </div>

            <h2 className="text-xl font-bold text-cyan-400 mb-1">{user.username}</h2>
            <Badge className={`${rankTier.color} border-current/50 bg-current/10`}>
              {rankTier.label}
            </Badge>
          </div>

          {/* Stats Grid */}
          {user.stats && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">Ratings</span>
                </div>
                <p className="text-lg font-bold text-cyan-400">{user.stats.ratingsCount}</p>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-muted-foreground">Comments</span>
                </div>
                <p className="text-lg font-bold text-blue-400">{user.stats.commentsCount}</p>
              </div>

              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Film className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-muted-foreground">Anime</span>
                </div>
                <p className="text-lg font-bold text-green-400">{user.stats.animesViewed}</p>
              </div>

              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-muted-foreground">Friends</span>
                </div>
                <p className="text-lg font-bold text-purple-400">{user.stats.friendsCount}</p>
              </div>
            </div>
          )}

          {/* Activity Score */}
          {user.stats && (
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-semibold text-cyan-400">Activity Score</span>
              </div>
              <p className="text-3xl font-bold text-cyan-400">{Math.round(user.stats.activityScore)}</p>
              <div className="mt-2 h-2 bg-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-magenta-500"
                  style={{ width: `${Math.min((user.stats.activityScore / 1000) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* View Profile Button */}
          <Button
            asChild
            className="w-full cyber-button border-cyan-500/50 text-cyan-400 hover:border-cyan-400"
          >
            <Link href={`/profile/${user.id}`}>
              View Full Profile
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
