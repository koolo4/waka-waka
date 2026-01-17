'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AnimePreviewModal } from './anime-preview-modal'

interface SearchEntry {
  id: number
  query: string
  createdAt: string
}

interface AnimePreview {
  id: number
  title: string
  imageUrl?: string
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [history, setHistory] = useState<SearchEntry[]>([])
  const [suggestions, setSuggestions] = useState<AnimePreview[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Загружаем историю при монтировании
  useEffect(() => {
    loadHistory()
  }, [])

  // Закрываем при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/search-history')
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  }

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Сохраняем в историю
    try {
      await fetch('/api/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })
    } catch (error) {
      console.error('Failed to save search:', error)
    }

    // Переходим на результаты
    window.location.href = `/?search=${encodeURIComponent(searchQuery)}`
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (value.trim().length === 0) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setIsOpen(true)
    setLoading(true)

    try {
      // Получаем рекомендации для поиска
      const res = await fetch(
        `/api/anime?search=${encodeURIComponent(value)}&limit=5`
      )
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.anime || [])
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectHistory = (query: string) => {
    setQuery(query)
    handleSearch(query)
  }

  const handleSelectSuggestion = (animeId: number) => {
    setSelectedAnimeId(animeId)
    setIsPreviewOpen(true)
    setIsOpen(false)
  }

  const clearHistory = async () => {
    try {
      await fetch('/api/search-history', { method: 'DELETE' })
      setHistory([])
    } catch (error) {
      console.error('Failed to clear history:', error)
    }
  }

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search anime..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query)
            }
          }}
          className="cyber-input pl-10 pr-4 w-full"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setSuggestions([])
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-card border border-cyan-500/30 rounded-lg shadow-lg shadow-cyan-500/20 z-50 max-h-96 overflow-y-auto">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-cyan-400 border-b border-cyan-500/20">
                Suggestions
              </div>
              {suggestions.map((anime) => (
                <button
                  key={anime.id}
                  onClick={() => handleSelectSuggestion(anime.id)}
                  className="w-full text-left px-4 py-2 hover:bg-card/80 border-b border-cyan-500/10 transition-colors"
                >
                  <p className="text-sm truncate">{anime.title}</p>
                </button>
              ))}
            </>
          )}

          {/* History */}
          {history.length > 0 && (
            <>
              <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-cyan-400 border-b border-cyan-500/20">
                <span>Recent Searches</span>
                <button
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handleSelectHistory(entry.query)}
                  className="w-full text-left px-4 py-2 hover:bg-card/80 border-b border-cyan-500/10 transition-colors flex items-center gap-2"
                >
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{entry.query}</span>
                </button>
              ))}
            </>
          )}

          {!loading && suggestions.length === 0 && history.length === 0 && query && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results or history
            </div>
          )}

          {loading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Anime Preview Modal */}
      {selectedAnimeId && (
        <AnimePreviewModal
          isOpen={isPreviewOpen}
          animeId={selectedAnimeId}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  )
}
