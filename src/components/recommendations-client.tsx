'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, Heart, Users, Zap } from 'lucide-react'
import { AnimeCard } from '@/components/anime-card'
import Link from 'next/link'

interface AnimeData {
  id: number
  title: string
  description: string | null
  genre: string | null
  year: number | null
  studio: string | null
  imageUrl: string | null
  averageRating: number
  ratingsCount: number
  commentsCount: number
  viewsCount: number
  creator?: { username: string } | null
}

interface RecommendationData {
  id: number
  reason: string
  score: number
  anime: AnimeData
}

export function RecommendationsClient() {
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/recommendations')
      const data = await res.json()

      if (res.ok) {
        setRecommendations(data.recommendations || [])
      } else {
        setError(data.error || 'Не удалось загрузить рекомендации')
      }
    } catch (e) {
      console.error(e)
      setError('Произошла ошибка при загрузке рекомендаций')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST'
      })

      if (res.ok) {
        await loadRecommendations()
      }
    } catch (e) {
      console.error(e)
      setError('Ошибка при обновлении рекомендаций')
    } finally {
      setRefreshing(false)
    }
  }

  const getReasonIcon = (reason: string) => {
    if (reason.includes('friend')) return <Users className="h-4 w-4" />
    if (reason.includes('genre')) return <Zap className="h-4 w-4" />
    return <Heart className="h-4 w-4" />
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      'friend_rating': 'Рекомендация друга',
      'genre': 'Похожий жанр',
      'similar': 'Похожее аниме'
    }
    return labels[reason] || reason
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Анализирую твои предпочтения...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Управление */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black neon-text-green">
            Найдено рекомендаций: {recommendations.length}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Персонализированы на основе твоих оценок и друзей
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {error && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="p-4">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recommendations.map((rec) => (
            <Link key={rec.id} href={`/anime/${rec.anime.id}`}>
              <AnimeCard {...rec.anime} />

                {/* Причина рекомендации */}
                <div className="absolute top-2 right-2 z-50">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                  >
                    {getReasonIcon(rec.reason)}
                    <span className="text-xs">Рел: {rec.score.toFixed(0)}</span>
                  </Badge>
                </div>

                {/* Подсказка с причиной */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-cyan-400 font-mono">
                    {getReasonLabel(rec.reason)}
                  </p>
                  {rec.score > 70 && (
                    <p className="text-xs text-green-400 mt-1">
                      ✓ Очень релевантно
                    </p>
                  )}
                </div>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="cyber-card">
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет рекомендаций</h3>
            <p className="text-muted-foreground mb-4">
              Оцени больше аниме, чтобы получить персональные рекомендации
            </p>
            <Link href="/">
              <Button>Начать оценивать</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
