'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { TrendingUp, Flame } from 'lucide-react'
import Image from 'next/image'

interface TrendingAnime {
  id: number
  title: string
  imageUrl: string
  averageRating: number
  trendScore: number
  _count: {
    ratings: number
    comments: number
    userStatuses: number
  }
}

export function TrendingAnimeSection() {
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

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-cyan-500/10 rounded-lg"></div>
      </div>
    )
  }

  return (
    <Card className="cyber-card mb-8 overflow-hidden">
      <CardHeader className="border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-orange-400" />
          <CardTitle className="neon-text-orange">В ТРЕНДЕ ПРЯМО СЕЙЧАС</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trending.slice(0, 4).map((anime) => (
            <Link key={anime.id} href={`/anime/${anime.id}`}>
              <div className="group relative overflow-hidden rounded-lg border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 cursor-pointer h-full">
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={anime.imageUrl || '/placeholder-anime.jpg'}
                    alt={anime.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  
                  {/* Trend Badge */}
                  <div className="absolute top-2 left-2 cyber-badge bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50 text-orange-400">
                    <Flame className="h-3 w-3 mr-1" />
                    ТРЕНД
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="w-full">
                      <h3 className="font-bold text-cyan-300 line-clamp-2 mb-2">{anime.title}</h3>
                      <div className="flex items-center justify-between">
                        <Badge className="cyber-badge bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-400 text-xs">
                          ⭐ {anime.averageRating.toFixed(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {anime._count.ratings} оценок
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View More */}
        <div className="mt-6 text-center">
          <Link href="/trending" className="cyber-button inline-flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Смотреть ещё тренды
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
