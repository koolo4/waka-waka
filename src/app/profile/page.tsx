import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Film,
  Star,
  MessageCircle,
  Trophy,
  Clock,
  Eye,
  User,
  Activity,
  Target,
  Shield,
  Calendar,
  TrendingUp,
  BarChart3,
  Zap,
  Crown,
  Users as UsersIcon
} from 'lucide-react'
import { AvatarUploader } from '@/components/avatar-uploader'
import { UserAnimeLists } from '@/components/user-anime-lists'
import { UserStatsDashboard } from '@/components/user-stats-dashboard'
import { FriendsClient } from '@/components/friends-client'
import { FriendActivityFeed } from '@/components/friend-activity-feed'
import { AchievementsDisplay } from '@/components/achievements-display'
import { ActivityStreakDisplay } from '@/components/activity-streak-display'
import { RecentlyWatchedSection } from '@/components/recently-watched-section'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }
  const userId = parseInt(session.user.id)

  const [user, ratingsCount, commentsCount, statuses, averageRating, favoriteGenres] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, avatar: true, role: true, createdAt: true }
    }),
    prisma.rating.count({ where: { userId } }),
    prisma.comment.count({ where: { userId } }),
    prisma.userAnimeStatus.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
    }),
    // Средний рейтинг пользователя
    prisma.rating.aggregate({
      where: { userId },
      _avg: { overallRating: true }
    }),
    // Любимые жанры на основе высоких оценок
    prisma.rating.findMany({
      where: {
        userId,
        overallRating: { gte: 8 }
      },
      include: {
        anime: { select: { genre: true } }
      },
      take: 10
    })
  ])

  const statusMap: Record<string, number> = { PLANNED: 0, WATCHING: 0, COMPLETED: 0, DROPPED: 0 }
  for (const s of statuses) {
    statusMap[s.status] = s._count.status
  }

  // Обработка любимых жанров
  const genreCount: Record<string, number> = {}
  favoriteGenres.forEach(rating => {
    if (rating.anime.genre) {
      const genres = rating.anime.genre.split(',').map(g => g.trim())
      genres.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 1
      })
    }
  })
  const topGenres = Object.entries(genreCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genre)

  const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : 'Неизвестно'
  const isAdmin = user?.role === 'ADMIN'
  const totalAnime = statusMap.WATCHING + statusMap.PLANNED + statusMap.COMPLETED + statusMap.DROPPED

  return (
    <div className="min-h-screen relative">
      {/* Matrix Rain Background */}
      <div className="matrix-rain"></div>
      <div className="digital-particles"></div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Cyber Header */}
        <div className="text-center mb-8">
          <div className="cyber-badge inline-flex items-center gap-2 mb-4">
            <User className="h-4 w-4" />
            <span>USER PROFILE ACCESS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 neon-text">
            ЛИЧНЫЙ ТЕРМИНАЛ
          </h1>
        </div>

        {/* Main Profile Card */}
        <Card className="cyber-card mb-8">
          <CardHeader className="border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <Shield className={`h-6 w-6 ${isAdmin ? 'text-yellow-400' : 'text-cyan-400'}`} />
              <CardTitle className="neon-text-green">ПРОФИЛЬ ОПЕРАТОРА</CardTitle>
              {isAdmin && (
                <Badge className="cyber-badge bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-400">
                  <Crown className="h-3 w-3 mr-1" />
                  ADMIN ACCESS
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-6 relative">
                <div className="relative">
                  {/* Holographic corners around avatar */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 border-l-2 border-t-2 border-cyan-500/70"></div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 border-r-2 border-t-2 border-cyan-500/70"></div>
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-2 border-b-2 border-cyan-500/70"></div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-2 border-b-2 border-cyan-500/70"></div>

                  <Avatar className="h-40 w-40 border-4 border-cyan-500/50 shadow-2xl shadow-cyan-500/20">
                    <AvatarImage src={user?.avatar || undefined} />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-cyan-900 to-magenta-900 text-cyan-300 font-mono font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Status indicator */}
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse border-4 border-card shadow-lg shadow-green-500/50"></div>
                </div>

                <AvatarUploader />

                {/* Connection status */}
                <div className="cyber-badge">
                  <Activity className="h-4 w-4 animate-pulse" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="text-4xl font-black neon-text mb-2 font-mono">{user?.username}</div>
                  <div className="text-lg text-muted-foreground font-mono mb-4">{user?.email}</div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={`cyber-badge ${isAdmin ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-400' : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400'}`}>
                      {isAdmin ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          АДМИНИСТРАТОР
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          ПОЛЬЗОВАТЕЛЬ
                        </>
                      )}
                    </Badge>

                    <Badge className="cyber-badge bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      С {memberSince} ГОДА
                    </Badge>

                    <Badge className="cyber-badge bg-gradient-to-r from-purple-500/20 to-violet-500/20 border-purple-500/50 text-purple-400">
                      <Target className="h-3 w-3 mr-1" />
                      УРОВЕНЬ 15
                    </Badge>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="cyber-stat-card cyan">
                    <CardContent className="p-4 text-center">
                      <Film className="h-8 w-8 neon-text mx-auto mb-2" />
                      <div className="text-2xl font-black neon-text">{totalAnime}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Всего Аниме</div>
                    </CardContent>
                  </Card>

                  <Card className="cyber-stat-card magenta">
                    <CardContent className="p-4 text-center">
                      <Star className="h-8 w-8 neon-text-magenta mx-auto mb-2" />
                      <div className="text-2xl font-black neon-text-magenta">{ratingsCount}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Оценок</div>
                    </CardContent>
                  </Card>

                  <Card className="cyber-stat-card green">
                    <CardContent className="p-4 text-center">
                      <MessageCircle className="h-8 w-8 neon-text-green mx-auto mb-2" />
                      <div className="text-2xl font-black neon-text-green">{commentsCount}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Комментариев</div>
                    </CardContent>
                  </Card>

                  <Card className="cyber-stat-card orange">
                    <CardContent className="p-4 text-center">
                      <Trophy className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                      <div className="text-2xl font-black text-orange-400">{statusMap.COMPLETED}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Завершено</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="cyber-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 neon-text-green" />
                        <span className="font-mono font-bold text-sm neon-text-green">СРЕДНИЙ РЕЙТИНГ</span>
                      </div>
                      <div className="text-2xl font-black neon-text">
                        {averageRating._avg.overallRating
                          ? averageRating._avg.overallRating.toFixed(1)
                          : 'N/A'
                        }
                        {averageRating._avg.overallRating && (
                          <span className="text-sm text-muted-foreground ml-1">/ 10.0</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cyber-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="h-4 w-4 neon-text-magenta" />
                        <span className="font-mono font-bold text-sm neon-text-magenta">ТОП ЖАНРЫ</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {topGenres.length > 0 ? (
                          topGenres.map((genre, index) => (
                            <Badge key={genre} className={`cyber-badge text-xs ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-400' :
                              index === 1 ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400' :
                              'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-400'
                            }`}>
                              {genre}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground font-mono">
                            [НЕДОСТАТОЧНО_ДАННЫХ]
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="lists" className="space-y-6">
          <TabsList className="cyber-card bg-card/50 backdrop-blur-sm border border-cyan-500/30">
            <TabsTrigger value="lists" className="cyber-button">
              <Film className="h-4 w-4 mr-2" />
              Мои Списки
            </TabsTrigger>
            <TabsTrigger value="streak" className="cyber-button">
              <Zap className="h-4 w-4 mr-2" />
              Полоса
            </TabsTrigger>
            <TabsTrigger value="recently" className="cyber-button">
              <Clock className="h-4 w-4 mr-2" />
              Недавно
            </TabsTrigger>
            <TabsTrigger value="friends" className="cyber-button">
              <UsersIcon className="h-4 w-4 mr-2" />
              Друзья
            </TabsTrigger>
            <TabsTrigger value="stats" className="cyber-button">
              <BarChart3 className="h-4 w-4 mr-2" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="achievements" className="cyber-button">
              <Trophy className="h-4 w-4 mr-2" />
              Достижения
            </TabsTrigger>
            <TabsTrigger value="activity" className="cyber-button">
              <Activity className="h-4 w-4 mr-2" />
              Активность
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lists" className="space-y-6">
            <UserAnimeLists userId={userId} />
          </TabsContent>

          <TabsContent value="streak" className="space-y-6">
            <Card className="cyber-card">
              <CardHeader className="border-b border-cyan-500/20">
                <CardTitle className="neon-text-magenta flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-400" />
                  ПОЛОСА АКТИВНОСТИ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <ActivityStreakDisplay userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recently" className="space-y-6">
            <Card className="cyber-card">
              <CardHeader className="border-b border-cyan-500/20">
                <CardTitle className="neon-text-green flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  НЕДАВНО ПРОСМОТРЕННОЕ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <RecentlyWatchedSection userId={userId} limit={12} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friends" className="space-y-6">
            <FriendsClient currentUserId={userId} />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <UserStatsDashboard userId={userId} username={user?.username || ''} />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="cyber-card">
              <CardHeader className="border-b border-cyan-500/20">
                <CardTitle className="neon-text-green flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  СИСТЕМА ДОСТИЖЕНИЙ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <AchievementsDisplay />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <FriendActivityFeed />
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link href="/" className="cyber-button inline-flex items-center gap-2">
            <Film className="h-4 w-4" />
            Вернуться в главный терминал
          </Link>
        </div>
      </div>
    </div>
  )
}
