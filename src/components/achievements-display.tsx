'use client'

import { Badge } from '@/components/ui/badge'
import { Trophy, Zap, Heart, MessageSquare, Eye, Award } from 'lucide-react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

interface AchievementsProps {
  userStats?: {
    ratingsCount: number
    commentsCount: number
    animesViewed: number
    friendsCount: number
    activityScore: number
  }
}

export function AchievementsDisplay({ userStats }: AchievementsProps) {
  const achievements: Achievement[] = [
    {
      id: 'first-rating',
      name: 'First Step',
      description: 'Leave your first rating',
      icon: <Heart className="h-6 w-6" />,
      unlocked: (userStats?.ratingsCount ?? 0) >= 1,
      progress: userStats?.ratingsCount ?? 0,
      maxProgress: 1
    },
    {
      id: 'critic',
      name: 'Critic',
      description: 'Rate 50 anime',
      icon: <Trophy className="h-6 w-6" />,
      unlocked: (userStats?.ratingsCount ?? 0) >= 50,
      progress: userStats?.ratingsCount ?? 0,
      maxProgress: 50
    },
    {
      id: 'super-critic',
      name: 'Super Critic',
      description: 'Rate 250 anime',
      icon: <Zap className="h-6 w-6" />,
      unlocked: (userStats?.ratingsCount ?? 0) >= 250,
      progress: userStats?.ratingsCount ?? 0,
      maxProgress: 250
    },
    {
      id: 'conversationalist',
      name: 'Conversationalist',
      description: 'Write 50 comments',
      icon: <MessageSquare className="h-6 w-6" />,
      unlocked: (userStats?.commentsCount ?? 0) >= 50,
      progress: userStats?.commentsCount ?? 0,
      maxProgress: 50
    },
    {
      id: 'watcher',
      name: 'Watcher',
      description: 'Watch 100 anime',
      icon: <Eye className="h-6 w-6" />,
      unlocked: (userStats?.animesViewed ?? 0) >= 100,
      progress: userStats?.animesViewed ?? 0,
      maxProgress: 100
    },
    {
      id: 'legend',
      name: 'Legend',
      description: 'Reach 1000 activity score',
      icon: <Award className="h-6 w-6" />,
      unlocked: (userStats?.activityScore ?? 0) >= 1000,
      progress: userStats?.activityScore ?? 0,
      maxProgress: 1000
    }
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-6 w-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-cyan-400">
            Achievements ({unlockedCount}/{achievements.length})
          </h3>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-magenta-500 transition-all duration-300"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border transition-all ${
              achievement.unlocked
                ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/50'
                : 'bg-muted/30 border-muted-foreground/30 opacity-60'
            }`}
          >
            {/* Icon */}
            <div
              className={`h-12 w-12 rounded-lg flex items-center justify-center mb-2 ${
                achievement.unlocked
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              {achievement.icon}
            </div>

            {/* Info */}
            <h4 className="font-bold text-sm mb-1 text-foreground">
              {achievement.name}
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              {achievement.description}
            </p>

            {/* Progress */}
            {achievement.progress !== undefined && achievement.maxProgress && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{achievement.progress}</span>
                  <span>/{achievement.maxProgress}</span>
                </div>
                <div className="h-1.5 bg-background rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-cyan-500/50'
                    }`}
                    style={{
                      width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Badge */}
            {achievement.unlocked && (
              <div className="mt-2">
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
                  ✓ Unlocked
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
