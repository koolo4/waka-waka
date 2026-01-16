'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import {
  User,
  Star,
  MessageCircle,
  Eye,
  Calendar,
  TrendingUp,
  Award,
  Zap,
  Activity,
  Target,
  Crown,
  Flame
} from 'lucide-react'

interface UserStats {
  totalRatings: number
  totalComments: number
  totalViews: number
  averageRating: number
  favoriteGenres: { name: string; count: number; color: string }[]
  ratingDistribution: { rating: number; count: number }[]
  monthlyActivity: { month: string; ratings: number; comments: number }[]
  achievements: {
    id: string
    name: string
    description: string
    icon: string
    earned: boolean
    progress: number
    maxProgress: number
  }[]
  level: number
  experience: number
  nextLevelExp: number
  rank: string
  joinDate: string
}

interface UserStatsDashboardProps {
  userId: number
  username: string
}

const GENRE_COLORS = [
  '#00D9FF', // cyan
  '#FF00FF', // magenta
  '#00FF41', // green
  '#FF8C00', // orange
  '#8A2BE2', // purple
  '#FF69B4', // pink
  '#32CD32', // lime
  '#FF1493'  // deep pink
]

export function UserStatsDashboard({ userId, username }: UserStatsDashboardProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // В реальном приложении здесь был бы API вызов
    // Пока используем mock данные
    const mockStats: UserStats = {
      totalRatings: 127,
      totalComments: 84,
      totalViews: 312,
      averageRating: 8.4,
      favoriteGenres: [
        { name: 'Экшен', count: 34, color: GENRE_COLORS[0] },
        { name: 'Драма', count: 28, color: GENRE_COLORS[1] },
        { name: 'Романтика', count: 22, color: GENRE_COLORS[2] },
        { name: 'Комедия', count: 18, color: GENRE_COLORS[3] },
        { name: 'Фантастика', count: 15, color: GENRE_COLORS[4] },
        { name: 'Приключения', count: 10, color: GENRE_COLORS[5] }
      ],
      ratingDistribution: [
        { rating: 10, count: 23 },
        { rating: 9, count: 31 },
        { rating: 8, count: 28 },
        { rating: 7, count: 22 },
        { rating: 6, count: 15 },
        { rating: 5, count: 8 }
      ],
      monthlyActivity: [
        { month: 'Янв', ratings: 12, comments: 8 },
        { month: 'Фев', ratings: 15, comments: 12 },
        { month: 'Мар', ratings: 18, comments: 14 },
        { month: 'Апр', ratings: 22, comments: 16 },
        { month: 'Май', ratings: 25, comments: 18 },
        { month: 'Июн', ratings: 35, comments: 16 }
      ],
      achievements: [
        {
          id: 'first_rating',
          name: 'Первая Оценка',
          description: 'Поставить первую оценку аниме',
          icon: 'star',
          earned: true,
          progress: 1,
          maxProgress: 1
        },
        {
          id: 'anime_critic',
          name: 'Аниме Критик',
          description: 'Оценить 100 аниме',
          icon: 'target',
          earned: true,
          progress: 127,
          maxProgress: 100
        },
        {
          id: 'comment_master',
          name: 'Мастер Комментариев',
          description: 'Написать 50 комментариев',
          icon: 'message',
          earned: true,
          progress: 84,
          maxProgress: 50
        },
        {
          id: 'high_standards',
          name: 'Высокие Стандарты',
          description: 'Средняя оценка выше 8.0',
          icon: 'crown',
          earned: true,
          progress: 84,
          maxProgress: 80
        },
        {
          id: 'anime_explorer',
          name: 'Исследователь',
          description: 'Посмотреть аниме 10 разных жанров',
          icon: 'compass',
          earned: false,
          progress: 8,
          maxProgress: 10
        }
      ],
      level: 15,
      experience: 2840,
      nextLevelExp: 3200,
      rank: 'Киберотаку',
      joinDate: '2023-03-15'
    }

    setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 1000)
  }, [userId])

  const getLevelIcon = (level: number) => {
    if (level >= 20) return <Crown className="h-5 w-5 text-yellow-400" />
    if (level >= 15) return <Flame className="h-5 w-5 text-orange-400" />
    if (level >= 10) return <Award className="h-5 w-5 text-purple-400" />
    if (level >= 5) return <Star className="h-5 w-5 text-cyan-400" />
    return <Zap className="h-5 w-5 text-green-400" />
  }

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'star': return <Star className="h-6 w-6" />
      case 'target': return <Target className="h-6 w-6" />
      case 'message': return <MessageCircle className="h-6 w-6" />
      case 'crown': return <Crown className="h-6 w-6" />
      case 'compass': return <Activity className="h-6 w-6" />
      default: return <Award className="h-6 w-6" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="cyber-card loading-shimmer">
            <CardContent className="p-6">
              <div className="h-32 bg-muted/20 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const experiencePercent = (stats.experience / stats.nextLevelExp) * 100

  return (
    <div className="space-y-6">
      {/* User Level and Experience */}
      <Card className="cyber-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getLevelIcon(stats.level)}
              <div>
                <CardTitle className="neon-text-green">УРОВЕНЬ {stats.level}</CardTitle>
                <p className="text-sm text-muted-foreground font-mono">{stats.rank}</p>
              </div>
            </div>
            <Badge className="cyber-badge bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 text-purple-400">
              {stats.experience} / {stats.nextLevelExp} EXP
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={experiencePercent} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>До следующего уровня: {stats.nextLevelExp - stats.experience} EXP</span>
              <span>{experiencePercent.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cyber-card">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 neon-text mx-auto mb-2" />
            <div className="text-2xl font-black neon-text">{stats.totalRatings}</div>
            <div className="text-xs text-muted-foreground uppercase">Оценок</div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-8 w-8 neon-text-magenta mx-auto mb-2" />
            <div className="text-2xl font-black neon-text-magenta">{stats.totalComments}</div>
            <div className="text-xs text-muted-foreground uppercase">Комментариев</div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 neon-text-green mx-auto mb-2" />
            <div className="text-2xl font-black neon-text-green">{stats.totalViews}</div>
            <div className="text-xs text-muted-foreground uppercase">Просмотров</div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-orange-400">{stats.averageRating}</div>
            <div className="text-xs text-muted-foreground uppercase">Ср. Оценка</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favorite Genres */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="neon-text-green">ЖАНРОВЫЕ ПРЕДПОЧТЕНИЯ</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.favoriteGenres}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  stroke="#00D9FF"
                  strokeWidth={2}
                >
                  {stats.favoriteGenres.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontFamily: 'monospace'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="neon-text-magenta">РАСПРЕДЕЛЕНИЕ ОЦЕНОК</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="rating"
                  stroke="hsl(var(--muted-foreground))"
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontFamily="monospace"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontFamily: 'monospace'
                  }}
                />
                <Bar dataKey="count" fill="#FF00FF" stroke="#00D9FF" strokeWidth={1} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Activity */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="neon-text">АКТИВНОСТЬ ПО МЕСЯЦАМ</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontFamily="monospace"
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontFamily="monospace"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontFamily: 'monospace'
                }}
              />
              <Line
                type="monotone"
                dataKey="ratings"
                stroke="#00D9FF"
                strokeWidth={3}
                dot={{ fill: '#00D9FF', strokeWidth: 2, r: 4 }}
                name="Оценки"
              />
              <Line
                type="monotone"
                dataKey="comments"
                stroke="#FF00FF"
                strokeWidth={3}
                dot={{ fill: '#FF00FF', strokeWidth: 2, r: 4 }}
                name="Комментарии"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="neon-text-green">ДОСТИЖЕНИЯ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`cyber-card ${achievement.earned ? 'border-green-500/50' : 'border-muted/50'} ${!achievement.earned ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${achievement.earned ? 'bg-green-500/20 text-green-400' : 'bg-muted/20 text-muted-foreground'}`}>
                      {getAchievementIcon(achievement.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm mb-1">{achievement.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                      {!achievement.earned && (
                        <div className="space-y-1">
                          <Progress
                            value={(achievement.progress / achievement.maxProgress) * 100}
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground font-mono">
                            {achievement.progress} / {achievement.maxProgress}
                          </div>
                        </div>
                      )}
                      {achievement.earned && (
                        <Badge className="cyber-badge bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-400 text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Получено
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
