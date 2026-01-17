'use client'

import { useState, useCallback } from 'react'
import { Search, Sliders, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface FilterState {
  query: string
  genres: string[]
  yearFrom: number
  yearTo: number
  ratingFrom: number
  ratingTo: number
  sortBy: 'rating' | 'views' | 'newest' | 'popular'
}

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller', 'Psychological'
]

const CURRENT_YEAR = new Date().getFullYear()

export function AdvancedSearchFilters() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    genres: [],
    yearFrom: 1990,
    yearTo: CURRENT_YEAR,
    ratingFrom: 0,
    ratingTo: 10,
    sortBy: 'rating'
  })

  const toggleGenre = useCallback((genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      query: '',
      genres: [],
      yearFrom: 1990,
      yearTo: CURRENT_YEAR,
      ratingFrom: 0,
      ratingTo: 10,
      sortBy: 'rating'
    })
  }, [])

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams()
    
    if (filters.query) params.append('search', filters.query)
    if (filters.genres.length > 0) params.append('genres', filters.genres.join(','))
    if (filters.yearFrom > 1990) params.append('yearFrom', filters.yearFrom.toString())
    if (filters.yearTo < CURRENT_YEAR) params.append('yearTo', filters.yearTo.toString())
    if (filters.ratingFrom > 0) params.append('ratingFrom', filters.ratingFrom.toString())
    if (filters.ratingTo < 10) params.append('ratingTo', filters.ratingTo.toString())
    if (filters.sortBy !== 'rating') params.append('sort', filters.sortBy)

    router.push(`/?${params.toString()}`)
    setIsOpen(false)
  }, [filters, router])

  const hasActiveFilters = 
    filters.query || 
    filters.genres.length > 0 || 
    filters.yearFrom > 1990 || 
    filters.yearTo < CURRENT_YEAR ||
    filters.ratingFrom > 0 ||
    filters.ratingTo < 10

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-card/50 rounded-lg transition-colors"
        title="Advanced Search"
      >
        <Sliders className="h-5 w-5 text-cyan-400" />
        {hasActiveFilters && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" />
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="relative bg-card border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/20 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
              <h2 className="text-2xl font-bold text-cyan-400">Advanced Search</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-card/50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  Search Query
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Anime name..."
                    value={filters.query}
                    onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-cyan-500/30 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {/* Genres */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-3">
                  Genres ({filters.genres.length})
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {GENRES.map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-2 rounded-lg transition-all text-sm ${
                        filters.genres.includes(genre)
                          ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-400'
                          : 'bg-card border border-cyan-500/20 text-muted-foreground hover:border-cyan-400'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Range */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Year From: {filters.yearFrom}
                  </label>
                  <Slider
                    value={[filters.yearFrom]}
                    onValueChange={([val]) => setFilters(prev => ({ ...prev, yearFrom: val }))}
                    min={1990}
                    max={CURRENT_YEAR}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Year To: {filters.yearTo}
                  </label>
                  <Slider
                    value={[filters.yearTo]}
                    onValueChange={([val]) => setFilters(prev => ({ ...prev, yearTo: val }))}
                    min={1990}
                    max={CURRENT_YEAR}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Rating Range */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Rating From: {filters.ratingFrom.toFixed(1)}
                  </label>
                  <Slider
                    value={[filters.ratingFrom]}
                    onValueChange={([val]) => setFilters(prev => ({ ...prev, ratingFrom: val }))}
                    min={0}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Rating To: {filters.ratingTo.toFixed(1)}
                  </label>
                  <Slider
                    value={[filters.ratingTo]}
                    onValueChange={([val]) => setFilters(prev => ({ ...prev, ratingTo: val }))}
                    min={0}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  Sort By
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['rating', 'views', 'newest', 'popular'].map(sort => (
                    <button
                      key={sort}
                      onClick={() => setFilters(prev => ({ ...prev, sortBy: sort as any }))}
                      className={`px-3 py-2 rounded-lg transition-all text-sm capitalize ${
                        filters.sortBy === sort
                          ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-400'
                          : 'bg-card border border-cyan-500/20 text-muted-foreground hover:border-cyan-400'
                      }`}
                    >
                      {sort}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters Preview */}
              {hasActiveFilters && (
                <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <p className="text-sm text-cyan-400 mb-2">Active Filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {filters.query && (
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400">
                        Query: {filters.query}
                      </Badge>
                    )}
                    {filters.genres.map(g => (
                      <Badge key={g} className="bg-green-500/20 text-green-400 border-green-400">
                        {g}
                      </Badge>
                    ))}
                    {(filters.yearFrom > 1990 || filters.yearTo < CURRENT_YEAR) && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-400">
                        {filters.yearFrom}-{filters.yearTo}
                      </Badge>
                    )}
                    {(filters.ratingFrom > 0 || filters.ratingTo < 10) && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400">
                        ⭐ {filters.ratingFrom.toFixed(1)}-{filters.ratingTo.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-cyan-500/20">
              <Button
                onClick={resetFilters}
                className="flex-1 cyber-button border-cyan-500/50 text-cyan-400 hover:border-cyan-400"
              >
                Reset
              </Button>
              <Button
                onClick={handleSearch}
                className="flex-1 cyber-button bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 border-cyan-400 text-cyan-400"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
