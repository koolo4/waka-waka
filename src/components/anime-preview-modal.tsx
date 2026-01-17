'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Star, Play, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from './toast-provider'

interface AnimePreviewData {
  id: number
  title: string
  description: string | null
  genre: string | null
  year: number | null
  studio: string | null
  imageUrl: string | null
  videoUrl: string | null
  averageRating: number
  ratingsCount: number
  commentsCount: number
}

interface AnimePreviewModalProps {
  isOpen: boolean
  animeId: number
  onClose: () => void
}

export function AnimePreviewModal({ isOpen, animeId, onClose }: AnimePreviewModalProps) {
  const [anime, setAnime] = useState<AnimePreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [addingToWatchlist, setAddingToWatchlist] = useState(false)
  const [inWatchlist, setInWatchlist] = useState(false)
  const { addToast } = useToast()

  const checkWatchlist = useCallback(async () => {
    try {
      const res = await fetch(`/api/anime/${animeId}/status`)
      if (res.ok) {
        const data = await res.json()
        setInWatchlist(!!data.status)
      }
    } catch (error) {
      console.error('Failed to check watchlist:', error)
    }
  }, [animeId])

  const loadAnime = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/anime/${animeId}`)
      if (res.ok) {
        const data = await res.json()
        setAnime(data)
        // Проверяем в ли в watchlist
        checkWatchlist()
      }
    } catch (error) {
      console.error('Failed to load anime:', error)
      addToast('Failed to load anime details', 'error')
    } finally {
      setLoading(false)
    }
  }, [animeId, addToast, checkWatchlist])

  useEffect(() => {
    if (isOpen && animeId) {
      loadAnime()
    }
  }, [isOpen, animeId, loadAnime])

  const handleAddToWatchlist = async () => {
    setAddingToWatchlist(true)
    try {
      const res = await fetch(`/api/anime/${animeId}/watchlist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PLANNED' })
      })
      if (res.ok) {
        setInWatchlist(true)
        addToast('Added to watchlist!', 'success')
      } else {
        addToast('Failed to add to watchlist', 'error')
      }
    } catch (error) {
      console.error('Failed to add to watchlist:', error)
      addToast('Error adding to watchlist', 'error')
    } finally {
      setAddingToWatchlist(false)
    }
  }

  if (!isOpen || !anime) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/20 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in scale-95 fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1 hover:bg-card/50 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Header Image */}
        {anime.imageUrl && (
          <div className="relative w-full h-64 bg-gradient-to-b from-cyan-500/10 to-transparent">
            <Image
              src={anime.imageUrl}
              alt={anime.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Title & Rating */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">{anime.title}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-lg font-semibold text-yellow-400">
                  {anime.averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({anime.ratingsCount} ratings)
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {anime.commentsCount} comments
              </span>
            </div>

            {/* Info Badges */}
            <div className="flex flex-wrap gap-2">
              {anime.year && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {anime.year}
                </Badge>
              )}
              {anime.studio && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {anime.studio}
                </Badge>
              )}
              {anime.genre && anime.genre.split(', ').slice(0, 3).map((genre, idx) => (
                <Badge key={idx} className="bg-green-500/20 text-green-400 border-green-500/30">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-cyan-400 mb-2">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
              {anime.description || 'No description available'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              asChild
              className="cyber-button border-cyan-500/50 text-cyan-400 hover:border-cyan-400 flex-1"
            >
              <Link href={`/anime/${anime.id}`} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                View Full Details
              </Link>
            </Button>

            <Button
              onClick={handleAddToWatchlist}
              disabled={inWatchlist || addingToWatchlist}
              className={`cyber-button flex-1 transition-colors ${
                inWatchlist
                  ? 'border-green-500/50 text-green-400'
                  : 'border-cyan-500/50 text-cyan-400 hover:border-cyan-400'
              }`}
            >
              {inWatchlist ? (
                <>
                  <Check className="h-4 w-4" />
                  In Watchlist
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add to Watchlist
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
