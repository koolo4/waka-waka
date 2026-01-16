'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Filter,
  X,
  Calendar,
  Star,
  Building,
  Tags,
  SortAsc,
  SortDesc,
  RefreshCw
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'

interface FilterState {
  search: string
  genres: string[]
  studios: string[]
  yearRange: [number, number]
  ratingRange: [number, number]
  sortBy: 'title' | 'year' | 'rating' | 'created' | 'popularity'
  sortOrder: 'asc' | 'desc'
}

interface AnimeFilterProps {
  onFilterChange: (filters: FilterState) => void
  availableGenres: string[]
  availableStudios: string[]
  isLoading?: boolean
}

export function AdvancedAnimeFilter({
  onFilterChange,
  availableGenres,
  availableStudios,
  isLoading = false
}: AnimeFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    genres: [],
    studios: [],
    yearRange: [1980, new Date().getFullYear()],
    ratingRange: [1, 10],
    sortBy: 'created',
    sortOrder: 'desc'
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // Debounced filter changes
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      onFilterChange(filters)
    }, 300)

    setDebounceTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [filters, onFilterChange, debounceTimer])

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const toggleGenre = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }))
  }

  const toggleStudio = (studio: string) => {
    setFilters(prev => ({
      ...prev,
      studios: prev.studios.includes(studio)
        ? prev.studios.filter(s => s !== studio)
        : [...prev.studios, studio]
    }))
  }

  const handleYearRangeChange = (values: number[]) => {
    setFilters(prev => ({ ...prev, yearRange: [values[0], values[1]] }))
  }

  const handleRatingRangeChange = (values: number[]) => {
    setFilters(prev => ({ ...prev, ratingRange: [values[0], values[1]] }))
  }

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      genres: [],
      studios: [],
      yearRange: [1980, new Date().getFullYear()],
      ratingRange: [1, 10],
      sortBy: 'created',
      sortOrder: 'desc'
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.genres.length > 0) count++
    if (filters.studios.length > 0) count++
    if (filters.yearRange[0] !== 1980 || filters.yearRange[1] !== new Date().getFullYear()) count++
    if (filters.ratingRange[0] !== 1 || filters.ratingRange[1] !== 10) count++
    return count
  }

  const getSortIcon = () => {
    return filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Поиск и фильтры
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
            )}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="h-4 w-4" />
              Расширенные
            </Button>
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
              >
                <RefreshCw className="h-4 w-4" />
                Сбросить
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Основной поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию аниме..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>

        {/* Быстрая сортировка */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.sortBy === 'title' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortChange('title')}
            className="flex items-center gap-1"
          >
            По названию {filters.sortBy === 'title' && getSortIcon()}
          </Button>
          <Button
            variant={filters.sortBy === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortChange('year')}
            className="flex items-center gap-1"
          >
            <Calendar className="h-3 w-3" />
            По году {filters.sortBy === 'year' && getSortIcon()}
          </Button>
          <Button
            variant={filters.sortBy === 'rating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortChange('rating')}
            className="flex items-center gap-1"
          >
            <Star className="h-3 w-3" />
            По рейтингу {filters.sortBy === 'rating' && getSortIcon()}
          </Button>
          <Button
            variant={filters.sortBy === 'popularity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortChange('popularity')}
            className="flex items-center gap-1"
          >
            По популярности {filters.sortBy === 'popularity' && getSortIcon()}
          </Button>
        </div>

        {showAdvanced && (
          <Tabs defaultValue="genres" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="genres">Жанры</TabsTrigger>
              <TabsTrigger value="studios">Студии</TabsTrigger>
              <TabsTrigger value="year">Год</TabsTrigger>
              <TabsTrigger value="rating">Рейтинг</TabsTrigger>
            </TabsList>

            <TabsContent value="genres" className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Tags className="h-4 w-4" />
                <Label>Жанры ({filters.genres.length} выбрано)</Label>
                {filters.genres.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, genres: [] }))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableGenres.map((genre) => (
                  <Badge
                    key={genre}
                    variant={filters.genres.includes(genre) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="studios" className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Building className="h-4 w-4" />
                <Label>Студии ({filters.studios.length} выбрано)</Label>
                {filters.studios.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, studios: [] }))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableStudios.map((studio) => (
                  <Badge
                    key={studio}
                    variant={filters.studios.includes(studio) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => toggleStudio(studio)}
                  >
                    {studio}
                  </Badge>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="year" className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4" />
                <Label>Год выпуска: {filters.yearRange[0]} - {filters.yearRange[1]}</Label>
              </div>
              <Slider
                value={filters.yearRange}
                onValueChange={handleYearRangeChange}
                min={1980}
                max={new Date().getFullYear()}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1980</span>
                <span>{new Date().getFullYear()}</span>
              </div>
            </TabsContent>

            <TabsContent value="rating" className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4" />
                <Label>Рейтинг: {filters.ratingRange[0]} - {filters.ratingRange[1]}</Label>
              </div>
              <Slider
                value={filters.ratingRange}
                onValueChange={handleRatingRangeChange}
                min={1}
                max={10}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1.0</span>
                <span>10.0</span>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Активные фильтры */}
        {(filters.genres.length > 0 || filters.studios.length > 0) && (
          <div className="space-y-2">
            {filters.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-sm text-muted-foreground mr-2">Жанры:</span>
                {filters.genres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="flex items-center gap-1">
                    {genre}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => toggleGenre(genre)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            {filters.studios.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-sm text-muted-foreground mr-2">Студии:</span>
                {filters.studios.map((studio) => (
                  <Badge key={studio} variant="secondary" className="flex items-center gap-1">
                    {studio}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => toggleStudio(studio)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
