'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Filter,
  X,
  Calendar,
  Star,
  ChevronDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react'
import { AnimeCard } from '@/components/anime-card'

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

interface SearchFiltersProps {
  initialAnime: Anime[]
}

interface Filters {
  search: string
  genres: string[]
  yearFrom: number | null
  yearTo: number | null
  minRating: number | null
  sortBy: 'newest' | 'oldest' | 'rating' | 'popular' | 'title'
  sortOrder: 'asc' | 'desc'
}

const POPULAR_GENRES = [
  'Экшен', 'Драма', 'Комедия', 'Романтика', 'Фантастика',
  'Приключения', 'Психологическое', 'Ужасы', 'Мистика', 'Спорт',
  'Мехи', 'Школа', 'Сёнен', 'Сёдзё', 'Сейнен', 'Дзёсей'
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Новые', icon: Calendar },
  { value: 'oldest', label: 'Старые', icon: Calendar },
  { value: 'rating', label: 'По рейтингу', icon: Star },
  { value: 'popular', label: 'Популярные', icon: TrendingUp },
  { value: 'title', label: 'По названию', icon: Target }
]

const ITEMS_PER_PAGE = 12

export function AnimeSearchFilter({ initialAnime }: SearchFiltersProps) {
  const [anime, setAnime] = useState<Anime[]>(initialAnime)
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>(initialAnime)
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    search: '',
    genres: [],
    yearFrom: null,
    yearTo: null,
    minRating: null,
    sortBy: 'newest',
    sortOrder: 'desc'
  })

  // Получение доступных жанров из данных
  const availableGenres = useMemo(() => Array.from(
    new Set(
      initialAnime
        .filter(a => a.genre)
        .flatMap(a => a.genre!.split(',').map(g => g.trim()))
    )
  ).sort(), [initialAnime])

  const availableYears = useMemo(() => Array.from(
    new Set(initialAnime.filter(a => a.year).map(a => a.year))
  ).sort((a, b) => b! - a!), [initialAnime])

  // Автодополнение для поиска
  const generateSuggestions = useCallback((searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchSuggestions([])
      return
    }

    const suggestions = initialAnime
      .filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(a => a.title)
      .slice(0, 5)

    setSearchSuggestions(suggestions)
  }, [initialAnime])

  const applyFilters = useCallback(() => {
    setLoading(true)
    let result = [...anime]

    // Поиск по названию и описанию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(a =>
        a.title.toLowerCase().includes(searchLower) ||
        a.description?.toLowerCase().includes(searchLower) ||
        a.studio?.toLowerCase().includes(searchLower)
      )
    }

    // Фильтр по жанрам
    if (filters.genres.length > 0) {
      result = result.filter(a => {
        if (!a.genre) return false
        const animeGenres = a.genre.split(',').map(g => g.trim())
        return filters.genres.some(genre => animeGenres.includes(genre))
      })
    }

    // Фильтр по годам
    if (filters.yearFrom) {
      result = result.filter(a => a.year && a.year >= filters.yearFrom!)
    }
    if (filters.yearTo) {
      result = result.filter(a => a.year && a.year <= filters.yearTo!)
    }

    // Фильтр по рейтингу
    if (filters.minRating) {
      result = result.filter(a => a.averageRating >= filters.minRating!)
    }

    // Сортировка
    result.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case 'newest':
        case 'oldest':
          comparison = (a.year || 0) - (b.year || 0)
          if (filters.sortBy === 'newest') comparison = -comparison
          break
        case 'rating':
          comparison = a.averageRating - b.averageRating
          break
        case 'popular':
          comparison = a.viewsCount - b.viewsCount
          break
        case 'title':
          comparison = a.title.localeCompare(b.title, 'ru')
          break
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison
    })

    setFilteredAnime(result)
    setCurrentPage(1)
    setLoading(false)
  }, [anime, filters])

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters()
    }, 300) // Дебаунс для поиска

    return () => clearTimeout(timer)
  }, [applyFilters])

  useEffect(() => {
    generateSuggestions(filters.search)
  }, [filters.search, generateSuggestions])

  const toggleGenre = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      genres: [],
      yearFrom: null,
      yearTo: null,
      minRating: null,
      sortBy: 'newest',
      sortOrder: 'desc'
    })
    setCurrentPage(1)
  }

  const hasActiveFilters =
    filters.search ||
    filters.genres.length > 0 ||
    filters.yearFrom ||
    filters.yearTo ||
    filters.minRating

  // Пагинация
  const totalPages = Math.ceil(filteredAnime.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentAnime = filteredAnime.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      {/* Cyber Panel Поиска */}
      <Card className="cyber-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="cyber-badge">
              <Search className="h-4 w-4" />
              <span>NEURAL SEARCH INTERFACE</span>
            </div>
            {loading && (
              <div className="cyber-badge">
                <Zap className="h-4 w-4 animate-pulse" />
                <span>PROCESSING...</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Улучшенная строка поиска с автодополнением */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 neon-text" />
              <Input
                placeholder="Введите название аниме, студию или описание..."
                value={filters.search}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, search: e.target.value }))
                  setShowSuggestions(true)
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => setShowSuggestions(searchSuggestions.length > 0)}
                className="cyber-input pl-10 pr-4"
              />

              {/* Автодополнение */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 cyber-card border">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-primary/10 transition-colors cyber-button border-0 rounded-none first:rounded-t-md last:rounded-b-md"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, search: suggestion }))
                        setShowSuggestions(false)
                      }}
                    >
                      <span className="neon-text-green">{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Контролы */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? "default" : "outline"}
                onClick={() => setViewMode('grid')}
                className="cyber-button"
                size="icon"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>

              <Button
                variant={viewMode === 'list' ? "default" : "outline"}
                onClick={() => setViewMode('list')}
                className="cyber-button"
                size="icon"
              >
                <List className="h-4 w-4" />
              </Button>

              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="cyber-button flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Фильтры
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs neon-text">
                    {filters.genres.length + (filters.yearFrom ? 1 : 0) + (filters.yearTo ? 1 : 0) + (filters.minRating ? 1 : 0)}
                  </Badge>
                )}
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="cyber-button">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Расширенная панель фильтров */}
          {showFilters && (
            <div className="space-y-6 border-t border-border/50 pt-6">
              {/* Быстрые жанры */}
              <div>
                <h4 className="text-sm font-medium mb-3 neon-text-green">ЖАНРЫ СКАНИРОВАНИЯ</h4>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_GENRES.map(genre => (
                    <Badge
                      key={genre}
                      variant={filters.genres.includes(genre) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/20 transition-all duration-300 cyber-badge"
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Параметры фильтрации */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block neon-text-magenta">ГОД СОЗДАНИЯ ОТ</label>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={filters.yearFrom || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      yearFrom: e.target.value ? parseInt(e.target.value) : null
                    }))}
                    className="cyber-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block neon-text-magenta">ГОД СОЗДАНИЯ ДО</label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={filters.yearTo || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      yearTo: e.target.value ? parseInt(e.target.value) : null
                    }))}
                    className="cyber-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block neon-text-magenta">МИН. НЕЙРО-РЕЙТИНГ</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="7.0"
                    value={filters.minRating || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      minRating: e.target.value ? parseFloat(e.target.value) : null
                    }))}
                    className="cyber-input"
                  />
                </div>
              </div>

              {/* Сортировка */}
              <div>
                <h4 className="text-sm font-medium mb-3 neon-text-green">АЛГОРИТМ СОРТИРОВКИ</h4>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map(option => {
                    const Icon = option.icon
                    return (
                      <Badge
                        key={option.value}
                        variant={filters.sortBy === option.value ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20 transition-all duration-300 cyber-badge flex items-center gap-1"
                        onClick={() => setFilters(prev => ({ ...prev, sortBy: option.value as any }))}
                      >
                        <Icon className="h-3 w-3" />
                        {option.label}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Статистика поиска */}
          <div className="flex items-center justify-between text-sm">
            <div className="cyber-badge">
              <Target className="h-4 w-4" />
              <span>НАЙДЕНО: {filteredAnime.length} / {anime.length} ЗАПИСЕЙ</span>
            </div>
            {hasActiveFilters && (
              <div className="cyber-badge">
                <Zap className="h-4 w-4" />
                <span>ФИЛЬТРЫ АКТИВНЫ</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Результаты */}
      {currentAnime.length > 0 ? (
        <>
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {currentAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} viewMode={viewMode} />
            ))}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <Card className="cyber-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="cyber-button"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                    if (pageNum > totalPages) return null
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        onClick={() => goToPage(pageNum)}
                        className="cyber-button w-10"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}

                  {currentPage < totalPages - 2 && <span className="neon-text">...</span>}

                  <Button
                    variant="outline"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="cyber-button"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-center mt-4 text-sm text-muted-foreground">
                  Страница {currentPage} из {totalPages}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="cyber-card">
          <CardContent className="text-center py-12">
            <div className="relative">
              <Search className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4 floating-element" />
              <div className="scan-line absolute inset-0"></div>
            </div>
            <h3 className="text-xl font-bold mb-3 neon-text-magenta">ДАННЫЕ НЕ ОБНАРУЖЕНЫ</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Нейронная сеть не смогла найти аниме по заданным параметрам.
              Попробуйте изменить критерии поиска или сбросить фильтры.
            </p>
            <Button onClick={clearFilters} className="cyber-button">
              <X className="h-4 w-4 mr-2" />
              Очистить фильтры
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
