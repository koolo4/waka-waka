'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { TrendingUp, Flame, Star, MessageCircle, Eye } from 'lucide-react'
import Image from 'next/image'

interface TrendingAnime {
  id: number
  title: string
  description: string
  imageUrl: string
  genre: string
  year: number
  studio: string
  creator: { username: string }
  averageRating: number
  trendScore: number
  _count: {
    ratings: number
    comments: number
    userStatuses: number
  }
}

export default function TrendingPage() {
  const [trending, setTrending] = useState<TrendingAnime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/trending')
        const data = await res.json()
        setTrending(data)
      } catch (error) {
        console.error('Failed to fetch trending:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [])

  return (
    <div className="min-h-screen relative">
      {/* Matrix Rain Background */}
      <div className="matrix-rain"></div>
      <div className="digital-particles"></div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="cyber-badge inline-flex items-center gap-2 mb-4">
            <Flame className="h-4 w-4" />
            <span>TREND ANALYSIS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 neon-text-orange">
            АНИМЕ В ТРЕНДЕ
          </h1>
          <p className="text-muted-foreground font-mono">
            Самые горячие релизы и популярные произведения в сообществе
          </p>
        </div>

        {/* Trending Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-cyan-400 font-mono">
              [АНАЛИЗ_ТРЕНДА...]
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map((anime, index) => (
              <Link key={anime.id} href={`/anime/${anime.id}`}>
                <Card className="cyber-card h-full hover:border-orange-400 transition-all duration-300 overflow-hidden group cursor-pointer">
                  {/* Rank Badge */}
                  <div className="absolute top-4 left-4 z-10 cyber-badge bg-gradient-to-r from-orange-500/40 to-red-500/40 border-orange-500/70 text-orange-300 font-bold text-lg">
                    #{index + 1}
                  </div>

                  <div className="relative h-64 overflow-hidden bg-black">
                    <Image
                      src={anime.imageUrl || '/placeholder-anime.jpg'}
                      alt={anime.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    {/* Title and Genre */}
                    <div>
                      <h3 className="text-lg font-bold neon-text line-clamp-2 mb-2">
                        {anime.title}
                      </h3>
                      {anime.genre && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {anime.genre.split(', ').slice(0, 2).map((g, i) => (
                            <Badge key={i} variant="secondary" className="border-cyan-500/50 text-xs">
                              {g}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rating and Stats */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 neon-text-yellow" />
                          <span className="font-bold text-yellow-400">{anime.averageRating.toFixed(1)}/10</span>
                        </div>
                        <Badge className="cyber-badge bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50 text-orange-400 text-xs">
                          <Flame className="h-3 w-3 mr-1" />
                          ТРЕНД
                        </Badge>
                      </div>

                      {/* Activity Stats */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-cyan-500/20">
                        <div className="text-center">
                          <Star className="h-4 w-4 neon-text-magenta mx-auto mb-1" />
                          <div className="text-xs text-muted-foreground">{anime._count.ratings}</div>
                        </div>
                        <div className="text-center">
                          <MessageCircle className="h-4 w-4 neon-text-cyan mx-auto mb-1" />
                          <div className="text-xs text-muted-foreground">{anime._count.comments}</div>
                        </div>
                        <div className="text-center">
                          <Eye className="h-4 w-4 neon-text-green mx-auto mb-1" />
                          <div className="text-xs text-muted-foreground">{anime._count.userStatuses}</div>
                        </div>
                      </div>
                    </div>

                    {/* Creator */}
                    {anime.creator && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-cyan-500/20">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-cyan-900 text-cyan-300">
                            {anime.creator.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-mono">{anime.creator.username}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
