'use client'

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Calendar, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface AnimeWithStatus {
  id: number
  title: string
  description: string | null
  genre: string | null
  year: number | null
  imageUrl: string | null
  status: 'PLANNED' | 'WATCHING' | 'COMPLETED' | 'DROPPED'
  addedAt: string
  rating?: {
    overallRating: number
    storyRating: number
    artRating: number
    charactersRating: number
    soundRating: number
  }
}

interface UserAnimeListsProps {
  userId: number
}

const STATUS_LABELS = {
  PLANNED: 'Запланировано',
  WATCHING: 'Смотрю',
  COMPLETED: 'Завершено',
  DROPPED: 'Брошено'
}

const STATUS_COLORS = {
  PLANNED: 'bg-blue-100 text-blue-800',
  WATCHING: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
  DROPPED: 'bg-red-100 text-red-800'
}

export function UserAnimeLists({ userId }: UserAnimeListsProps) {
  const [animeByStatus, setAnimeByStatus] = useState<Record<string, AnimeWithStatus[]>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('PLANNED')

  const fetchUserAnimeLists = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/${userId}/anime-lists`)
      if (response.ok) {
        const data = await response.json()
        setAnimeByStatus(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки списков аниме:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUserAnimeLists()
  }, [fetchUserAnimeLists])

  const removeFromList = async (animeId: number) => {
    try {
      const response = await fetch(`/api/anime/${animeId}/status`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchUserAnimeLists()
      }
    } catch (error) {
      console.error('Ошибка удаления из списка:', error)
    }
  }

  const changeStatus = async (animeId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/anime/${animeId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        fetchUserAnimeLists()
      }
    } catch (error) {
      console.error('Ошибка изменения статуса:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Загрузка списков...</div>
  }

  const getTotalCount = () => {
    return Object.values(animeByStatus).reduce((total, list) => total + list.length, 0)
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Мои списки аниме</h2>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Всего: {getTotalCount()}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <TabsTrigger key={status} value={status} className="relative">
              {label}
              <Badge className="ml-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                {animeByStatus[status]?.length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <TabsContent key={status} value={status} className="mt-6">
            <div className="space-y-4">
              {!animeByStatus[status] || animeByStatus[status].length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      В списке "{label}" пока нет аниме
                    </p>
                    <Link href="/">
                      <Button className="mt-4">Перейти к каталогу</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                animeByStatus[status].map((anime) => (
                  <Card key={anime.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {anime.imageUrl && (
                          <img
                            src={anime.imageUrl}
                            alt={anime.title}
                            className="w-16 h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link
                                href={`/anime/${anime.id}`}
                                className="text-lg font-semibold hover:underline"
                              >
                                {anime.title}
                              </Link>
                              {anime.year && (
                                <span className="text-muted-foreground ml-2">({anime.year})</span>
                              )}
                            </div>
                            <Badge className={STATUS_COLORS[anime.status]}>
                              {STATUS_LABELS[anime.status]}
                            </Badge>
                          </div>

                          {anime.genre && (
                            <p className="text-sm text-muted-foreground">
                              Жанр: {anime.genre}
                            </p>
                          )}

                          {anime.rating && (
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">
                                {anime.rating.overallRating.toFixed(1)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                (Ваша оценка)
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Добавлено: {new Date(anime.addedAt).toLocaleDateString('ru-RU')}
                          </div>

                          <div className="flex gap-2 mt-3">
                            {Object.entries(STATUS_LABELS)
                              .filter(([s]) => s !== status)
                              .map(([newStatus, newLabel]) => (
                                <Button
                                  key={newStatus}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => changeStatus(anime.id, newStatus)}
                                >
                                  Переместить в "{newLabel}"
                                </Button>
                              ))
                            }
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromList(anime.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Удалить
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
