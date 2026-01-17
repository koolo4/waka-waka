'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star, MessageCircle, Film, Users, Eye } from 'lucide-react'
import Link from 'next/link'
import { UserQuickView } from './user-quick-view'

interface LeaderboardCardProps {
  userId: string
  username: string
  avatar?: string | null
  position: number
  ratingsCount: number
  commentsCount: number
  animesViewed: number
  friendsCount: number
  activityScore: number
}

export function LeaderboardCard({
  userId,
  username,
  avatar,
  position,
  ratingsCount,
  commentsCount,
  animesViewed,
  friendsCount,
  activityScore
}: LeaderboardCardProps) {
  const [showQuickView, setShowQuickView] = useState(false)

  const getMedalEmoji = (pos: number) => {
    switch (pos) {
      case 0:
        return '🥇'
      case 1:
        return '🥈'
      case 2:
        return '🥉'
      default:
        return `#${pos + 1}`
    }
  }

  const getRankBadge = (score: number) => {
    if (score >= 1000) return 'Legendary'
    if (score >= 500) return 'Master'
    if (score >= 200) return 'Expert'
    if (score >= 50) return 'Contributor'
    return 'Member'
  }

  return (
    <>
      <Link href={`/profile/${userId}`}>
        <Card className="cyber-card hover:border-cyan-400 transition-all cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {/* Position */}
              <div className="text-2xl font-bold text-yellow-400 min-w-12 text-center">
                {getMedalEmoji(position)}
              </div>

              {/* User Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0 relative">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-cyan-500/30 hover:border-cyan-400 transition-colors">
                    <AvatarImage src={avatar || undefined} />
                    <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  {/* Quick View Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setShowQuickView(true)
                    }}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                    title="Quick View"
                  >
                    <Eye className="h-3 w-3 text-cyan-400" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-cyan-400 transition-colors truncate">
                    {username}
                  </h3>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mt-1">
                    {getRankBadge(activityScore)}
                  </Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-8 flex-shrink-0">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-yellow-400 mb-1">
                    <Star className="h-4 w-4" />
                    <span className="font-bold">{ratingsCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Ratings</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center gap-1 text-blue-400 mb-1">
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-bold">{commentsCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center gap-1 text-green-400 mb-1">
                    <Film className="h-4 w-4" />
                    <span className="font-bold">{animesViewed}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Anime</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center gap-1 text-purple-400 mb-1">
                    <Users className="h-4 w-4" />
                    <span className="font-bold">{friendsCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Friends</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
                    {Math.round(activityScore)}
                  </p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>

              {/* Mobile Stats - Compact */}
              <div className="md:hidden flex flex-col gap-1 text-xs text-right">
                <div className="font-bold text-cyan-400">{Math.round(activityScore)}</div>
                <div className="text-muted-foreground">{ratingsCount}⭐ {commentsCount}💬</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Quick View Modal */}
      <UserQuickView
        isOpen={showQuickView}
        userId={userId}
        onClose={() => setShowQuickView(false)}
      />
    </>
  )
}
