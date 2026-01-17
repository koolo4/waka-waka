import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Film,
  Users,
  MessageCircle,
  Star,
  Plus,
  Edit,
  Trash2,
  Settings,
  ShieldCheck,
  Download
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { AnimeManagement } from '@/components/admin/anime-management'
import { UserManagement } from '@/components/admin/user-management'
import { CommentModeration } from '@/components/admin/comment-moderation'

async function getAdminStats() {
  const [
    totalAnime,
    totalUsers,
    totalComments,
    totalRatings,
    recentAnime,
    recentUsers,
    recentComments
  ] = await Promise.all([
    prisma.anime.count(),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.rating.count(),
    prisma.anime.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { username: true } },
        _count: {
          select: {
            ratings: true,
            comments: true,
            userStatuses: true
          }
        }
      }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    }),
    prisma.comment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true } },
        anime: { select: { title: true } }
      }
    })
  ])

  return {
    stats: {
      totalAnime,
      totalUsers,
      totalComments,
      totalRatings
    },
    recent: {
      anime: recentAnime,
      users: recentUsers,
      comments: recentComments
    }
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Проверяем права администратора
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { role: true }
  })

  if (user?.role !== 'ADMIN') {
    redirect('/')
  }

  const { stats, recent } = await getAdminStats()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              Админ-панель
            </h1>
            <p className="text-muted-foreground mt-2">
              Управление контентом и пользователями платформы Waka-Waka Anime
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/anime/import">
              <Button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700">
                <Download className="h-4 w-4" />
                Import Anime
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                ← Вернуться на главную
              </Button>
            </Link>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Всего аниме</p>
                  <p className="text-3xl font-bold text-blue-800">{stats.totalAnime}</p>
                </div>
                <Film className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Пользователей</p>
                  <p className="text-3xl font-bold text-green-800">{stats.totalUsers}</p>
                </div>
                <Users className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Комментариев</p>
                  <p className="text-3xl font-bold text-purple-800">{stats.totalComments}</p>
                </div>
                <MessageCircle className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Оценок</p>
                  <p className="text-3xl font-bold text-yellow-800">{stats.totalRatings}</p>
                </div>
                <Star className="h-12 w-12 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Основной контент */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="anime">Аниме</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="comments">Комментарии</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Боковая панель с последними действиями */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Последние аниме */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Film className="h-5 w-5" />
                    Последние аниме
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recent.anime.map((anime) => (
                    <div key={anime.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/anime/${anime.id}`}
                          className="font-medium hover:underline"
                        >
                          {anime.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {anime.creator?.username} • {anime._count.ratings} оценок
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Последние пользователи */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Новые пользователи
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recent.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Последние комментарии */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Последние комментарии
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recent.comments.map((comment) => (
                    <div key={comment.id} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium">{comment.user.username}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        К аниме: {comment.anime.title}
                      </p>
                      <p className="text-sm">{comment.comment.substring(0, 100)}...</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="anime">
            <AnimeManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="comments">
            <CommentModeration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
