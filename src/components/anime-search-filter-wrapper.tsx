'use client'

import { AnimeSearchFilter } from '@/components/anime-search-filter'

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

interface AnimeSearchFilterWrapperProps {
  initialAnime: Anime[]
}

export function AnimeSearchFilterWrapper({ initialAnime }: AnimeSearchFilterWrapperProps) {
  return <AnimeSearchFilter initialAnime={initialAnime} />
}
