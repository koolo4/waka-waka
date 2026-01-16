import { prisma } from '@/lib/prisma'
import { AnimeCard } from '@/components/anime-card'
import { AnimeSearchFilter } from '@/components/anime-search-filter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, TrendingUp, Users, Film, MessageCircle, Zap, Activity, Database } from 'lucide-react'

async function getAnimeWithStats() {
  const anime = await prisma.anime.findMany({
    include: {
      ratings: true,
      comments: true,
      userStatuses: true,
      creator: {
        select: {
          username: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return anime.map(item => {
    const averageRating = item.ratings.length > 0
      ? item.ratings.reduce((acc, rating) => acc + rating.overallRating, 0) / item.ratings.length
      : 0

    return {
      ...item,
      averageRating,
      ratingsCount: item.ratings.length,
      commentsCount: item.comments.length,
      viewsCount: item.userStatuses.length
    }
  })
}

async function getStats() {
  const totalAnime = await prisma.anime.count()
  const totalUsers = await prisma.user.count()
  const totalRatings = await prisma.rating.count()
  const totalComments = await prisma.comment.count()

  return {
    totalAnime,
    totalUsers,
    totalRatings,
    totalComments
  }
}

export default async function HomePage() {
  const [animeList, stats] = await Promise.all([
    getAnimeWithStats(),
    getStats()
  ])

  return (
    <div className="min-h-screen relative">
      {/* Enhanced Matrix Rain Background */}
      <div className="matrix-rain"></div>
      <div className="digital-particles"></div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 cyber-badge mb-6 floating-element">
            <Activity className="h-4 w-4" />
            <span className="scan-line">Добро пожаловать в киберпространство</span>
          </div>

          {/* Glitch Title */}
          <h1
            className="text-4xl md:text-7xl font-black mb-6 glitch-text neon-text relative"
            data-text="WAKA-WAKA ANIME"
          >
            WAKA-WAKA ANIME
          </h1>

          <div className="relative">
            <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              <span className="neon-text-green">Погрузитесь</span> в неоновый мир аниме будущего, где
              <span className="neon-text-magenta"> технологии</span> встречаются с искусством
            </p>

            {/* Scan line effect */}
            <div className="absolute inset-0 scan-line opacity-30"></div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto mt-12">
            <Card className="cyber-stat-card cyan floating-element">
              <CardContent className="p-6 text-center">
                <div className="relative">
                  <Film className="h-10 w-10 neon-text mx-auto mb-3" />
                  <div className="text-3xl font-black neon-text mb-1">{stats.totalAnime}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Аниме Каталог</div>
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-stat-card magenta floating-element" style={{animationDelay: '0.5s'}}>
              <CardContent className="p-6 text-center">
                <div className="relative">
                  <Users className="h-10 w-10 neon-text-magenta mx-auto mb-3" />
                  <div className="text-3xl font-black neon-text-magenta mb-1">{stats.totalUsers}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Киберпользователи</div>
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-stat-card green floating-element" style={{animationDelay: '1s'}}>
              <CardContent className="p-6 text-center">
                <div className="relative">
                  <Star className="h-10 w-10 neon-text-green mx-auto mb-3" />
                  <div className="text-3xl font-black neon-text-green mb-1">{stats.totalRatings}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Нейро Оценки</div>
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-stat-card orange floating-element" style={{animationDelay: '1.5s'}}>
              <CardContent className="p-6 text-center">
                <div className="relative">
                  <MessageCircle className="h-10 w-10 text-orange-400 mx-auto mb-3" />
                  <div className="text-3xl font-black text-orange-400 mb-1">{stats.totalComments}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Хакер Отзывы</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cyberpunk Decorative Elements */}
          <div className="absolute top-10 left-10 w-32 h-32 border border-cyan-500/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border border-magenta-500/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-5 w-16 h-16 border border-green-500/20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
      </section>

      {/* Data Stream Separator */}
      <div className="relative py-8">
        <div className="container mx-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500 via-magenta-500 to-cyan-500 opacity-50 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Anime Catalog Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-3 cyber-badge mb-4">
              <Database className="h-4 w-4" />
              <span>NEURAL DATABASE ACCESS</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black mb-4 neon-text-magenta">
              АНИМЕ РЕЕСТР
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Исследуйте нашу квантовую коллекцию из <span className="neon-text">{stats.totalAnime}</span>
              аниме-файлов с помощью нейронного поиска и киберфильтров
            </p>
          </div>

          {/* Enhanced Search Filter */}
          <div className="cyber-card p-6 mb-8">
            <AnimeSearchFilter initialAnime={animeList} />
          </div>
        </div>

        {/* Background Tech Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 text-6xl font-mono text-cyan-500 rotate-45">01</div>
          <div className="absolute top-3/4 right-1/4 text-6xl font-mono text-magenta-500 -rotate-45">10</div>
          <div className="absolute bottom-1/4 left-1/3 text-6xl font-mono text-green-500 rotate-12">11</div>
        </div>
      </section>

      {/* Terminal Footer */}
      <footer className="relative py-8 border-t border-cyan-500/20">
        <div className="container mx-auto text-center">
          <div className="cyber-badge inline-flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="font-mono">SYSTEM STATUS: ONLINE</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
