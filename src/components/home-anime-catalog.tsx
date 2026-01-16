'use client'

import { useState, useEffect, useMemo } from 'react'
import { AdvancedAnimeFilter } from '@/components/advanced-anime-filter'
import { AnimeCard } from '@/components/anime-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Grid3X3, List, LayoutGrid } from 'lucide-react'

interface Anime {
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

interface FilterState {
  search: string
  genres: string[]
  studios: string[]
  yearRange: [number, number]
  ratingRange: [number, number]
  sortBy: 'title' | 'year' | 'rating' | 'created' | 'popularity'
  sortOrder: 'asc' | 'desc'
}

interface HomeAnimeCatalogProps {
  initialAnime: Anime[]
}

type ViewMode = 'grid' | 'list' | 'compact'

export function HomeAnimeCatalog({ initialAnime }: HomeAnimeCatalogProps) {
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>(initialAnime)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const itemsPerPage = viewMode === 'compact' ? 20 : 12

  // Извлечение уникальных жанров и студий
  const availableGenres = useMemo(() => {
    const genres = new Set<string>()
    initialAnime.forEach(anime => {
      if (anime.genre) {
        anime.genre.split(',').forEach(g => genres.add(g.trim()))
      }
    })
    return Array.from(genres).sort()
  }, [initialAnime])

  const availableStudios = useMemo(() => {
    const studios = new Set<string>()
    initialAnime.forEach(anime => {
      if (anime.studio) {
        studios.add(anime.studio.trim())
      }
    })
    return Array.from(studios).sort()
  }, [initialAnime])

  // Применение фильтров
  const applyFilters = (filters: FilterState) => {
    setIsLoading(true)

    setTimeout(() => {
      let filtered = [...initialAnime]

      // Поиск по тексту
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(anime =>
          anime.title.toLowerCase().includes(searchLower) ||
          anime.description?.toLowerCase().includes(searchLower) ||
          anime.genre?.toLowerCase().includes(searchLower) ||
          anime.studio?.toLowerCase().includes(searchLower)
        )
      }

      // Фильтр по жанрам
      if (filters.genres.length > 0) {
        filtered = filtered.filter(anime => {
          if (!anime.genre) return false
          const animeGenres = anime.genre.split(',').map(g => g.trim())
          return filters.genres.some(filterGenre =>
            animeGenres.includes(filterGenre)
          )
        })
      }

      // Фильтр по студиям
      if (filters.studios.length > 0) {
        filtered = filtered.filter(anime => {
          if (!anime.studio) return false
          return filters.studios.includes(anime.studio.trim())
        })
      }

      // Фильтр по году
      if (filters.yearRange[0] !== 1980 || filters.yearRange[1] !== new Date().getFullYear()) {
        filtered = filtered.filter(anime => {
          if (!anime.year) return false
          return anime.year >= filters.yearRange[0] && anime.year <= filters.yearRange[1]
        })
      }

      // Фильтр по рейтингу
      if (filters.ratingRange[0] !== 1 || filters.ratingRange[1] !== 10) {
        filtered = filtered.filter(anime => {
          return anime.averageRating >= filters.ratingRange[0] && anime.averageRating <= filters.ratingRange[1]
        })
      }

      // Сортировка
      filtered.sort((a, b) => {
        let comparison = 0

        switch (filters.sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title)
            break
          case 'year':
            comparison = (a.year || 0) - (b.year || 0)
            break
          case 'rating':
            comparison = a.averageRating - b.averageRating
            break
          case 'popularity':
            comparison = a.viewsCount - b.viewsCount
            break
          case 'created':
          default:
            comparison = a.id - b.id
            break
        }

        return filters.sortOrder === 'desc' ? -comparison : comparison
      })

      setFilteredAnime(filtered)
      setCurrentPage(1)
      setIsLoading(false)
    }, 100)
  }

  // Пагинация
  const paginatedAnime = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAnime.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAnime, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAnime.length / itemsPerPage)

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'grid':
        return <LayoutGrid className="h-4 w-4" />
      case 'list':
        return <List className="h-4 w-4" />
      case 'compact':
        return <Grid3X3 className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <AdvancedAnimeFilter
        onFilterChange={applyFilters}
        availableGenres={availableGenres}
        availableStudios={availableStudios}
        isLoading={isLoading}
      />

      {/* Статистика и настройки отображения */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            Найдено: <span className="font-medium">{filteredAnime.length}</span> из {initialAnime.length} аниме
          </p>
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Поиск...
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Вид:</span>
          {(['grid', 'list', 'compact'] as ViewMode[]).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode(mode)}
            >
              {getViewModeIcon(mode)}
            </Button>
          ))}
        </div>
      </div>

      {/* Результаты */}
      {filteredAnime.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground mb-4">
              Ничего не найдено
            </div>
            <p className="text-sm text-muted-foreground">
              Попробуйте изменить параметры поиска или сбросить фильтры
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Сетка аниме */}
          <div className={`
            ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : ''}
            ${viewMode === 'list' ? 'space-y-4' : ''}
            ${viewMode === 'compact' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4' : ''}
          `}>
            {paginatedAnime.map((anime) => (
              <div key={anime.id}>
                {viewMode === 'list' ? (
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {anime.imageUrl && (
                          <img
                            src={anime.imageUrl}
                            alt={anime.title}
                            className="w-20 h-28 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{anime.title}</h3>
                          {anime.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {anime.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {anime.year && (
                              <Badge variant="outline">{anime.year}</Badge>
                            )}
                            {anime.studio && (
                              <Badge variant="outline">{anime.studio}</Badge>
                            )}
                            <Badge variant="secondary">
                              ⭐ {anime.averageRating.toFixed(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <AnimeCard
                    anime={anime}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Назад
              </Button>

              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + idx
                  if (pageNum > totalPages) return null

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Вперед
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
