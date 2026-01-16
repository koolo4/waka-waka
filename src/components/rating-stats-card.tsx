'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, BarChart3 } from 'lucide-react'

interface RatingStats {
  overall: number
  story: number
  art: number
  characters: number
  sound: number
  count: number
  distribution: {
    [key: number]: number
  }
}

export function RatingStatsCard({ animeId }: { animeId: number }) {
  const [stats, setStats] = useState<RatingStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/anime/${animeId}/rating-stats`)
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch rating stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [animeId])

  if (loading) {
    return <div className="h-48 bg-cyan-500/10 rounded-lg animate-pulse"></div>
  }

  if (!stats) return null

  const maxRatings = Math.max(...Object.values(stats.distribution || {}), 1)

  return (
    <Card className="cyber-card">
      <CardHeader className="border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 neon-text-cyan" />
          <CardTitle className="neon-text-cyan">АНАЛИЗ ОЦЕНОК</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Overall Rating */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-cyan-300">Средняя оценка</span>
            <span className="text-2xl font-black neon-text">{stats.overall.toFixed(1)}/10</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 bg-cyan-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ width: `${(stats.overall / 10) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-muted-foreground">({stats.count} оценок)</span>
          </div>
        </div>

        {/* Category Ratings */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Сюжет', value: stats.story },
            { label: 'Арт', value: stats.art },
            { label: 'Персонажи', value: stats.characters },
            { label: 'Звук', value: stats.sound }
          ].map((cat) => (
            <div key={cat.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{cat.label}</span>
                <span className="font-bold text-cyan-300">{cat.value.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-cyan-500/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-magenta-500 to-cyan-500"
                  style={{ width: `${(cat.value / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Rating Distribution */}
        {stats.distribution && Object.keys(stats.distribution).length > 0 && (
          <div className="space-y-3 pt-4 border-t border-cyan-500/20">
            <div className="text-sm font-bold text-cyan-300 mb-3">Распределение оценок</div>
            <div className="space-y-2">
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => {
                const count = stats.distribution[rating] || 0
                const percentage = (count / maxRatings) * 100
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="w-8 text-right">
                      <span className="font-mono text-sm font-bold text-cyan-300">{rating}</span>
                    </div>
                    <div className="flex-1 h-2 bg-cyan-500/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
