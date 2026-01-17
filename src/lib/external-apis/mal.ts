/**
 * MyAnimeList API Integration
 * Provides methods to fetch anime data from MyAnimeList
 */

export interface MALAnime {
  id: number
  title: string
  title_english?: string
  title_japanese?: string
  images: {
    jpg: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
    webp?: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
  }
  synopsis?: string
  background?: string
  year?: number
  season?: string
  studios?: Array<{ id: number; name: string }>
  genres?: Array<{ id: number; name: string }>
  mal_id: number
  url?: string
  episodes?: number
  status?: string
  airing?: boolean
  aired?: {
    from?: string
    to?: string
  }
  score?: number
  scored_by?: number
  rank?: number
  popularity?: number
  rating?: string
  type?: string
  source?: string
}

export interface MALSearchResult {
  data: MALAnime[]
  pagination?: {
    last_visible_page: number
    has_next_page: boolean
  }
}

const MAL_API_BASE = 'https://api.jikan.moe/v4'

// Retry logic for rate limiting
async function fetchWithRetry(
  url: string,
  maxRetries = 3,
  delayMs = 1000
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url)

      // If rate limited, wait and retry
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delayMs * (i + 1)
        console.log(`Rate limited, waiting ${waitTime}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }

      if (!response.ok) {
        throw new Error(`MAL API error: ${response.status}`)
      }

      return response
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

/**
 * Search for anime on MyAnimeList
 */
export async function searchMALAnime(query: string, limit = 25): Promise<MALAnime[]> {
  try {
    const url = new URL(`${MAL_API_BASE}/anime`)
    url.searchParams.append('query', query)
    url.searchParams.append('limit', limit.toString())

    const response = await fetchWithRetry(url.toString())
    const data = (await response.json()) as MALSearchResult

    return data.data || []
  } catch (error) {
    console.error('Error searching MAL anime:', error)
    throw error
  }
}

/**
 * Get anime details by ID
 */
export async function getMALAnimeById(malId: number): Promise<MALAnime | null> {
  try {
    const response = await fetchWithRetry(`${MAL_API_BASE}/anime/${malId}`)
    const data = (await response.json()) as { data: MALAnime }

    return data.data || null
  } catch (error) {
    console.error(`Error fetching MAL anime ${malId}:`, error)
    return null
  }
}

/**
 * Get anime by query with full details
 */
export async function getMALAnimeByTitle(
  title: string
): Promise<MALAnime | null> {
  const results = await searchMALAnime(title, 1)
  return results.length > 0 ? results[0] : null
}

/**
 * Get top anime (trending/popular)
 */
export async function getTopMALAnime(
  limit = 25,
  filter: 'airing' | 'upcoming' | 'by_score' | 'by_members' = 'by_score'
): Promise<MALAnime[]> {
  try {
    const url = new URL(`${MAL_API_BASE}/top/anime`)
    url.searchParams.append('limit', limit.toString())
    url.searchParams.append('filter', filter)

    const response = await fetchWithRetry(url.toString())
    const data = (await response.json()) as MALSearchResult

    return data.data || []
  } catch (error) {
    console.error('Error fetching top MAL anime:', error)
    throw error
  }
}

/**
 * Get seasonal anime
 */
export async function getSeasonalMALAnime(
  year: number,
  season: 'winter' | 'spring' | 'summer' | 'fall',
  limit = 25
): Promise<MALAnime[]> {
  try {
    const url = new URL(`${MAL_API_BASE}/seasons/${year}/${season}`)
    url.searchParams.append('limit', limit.toString())

    const response = await fetchWithRetry(url.toString())
    const data = (await response.json()) as MALSearchResult

    return data.data || []
  } catch (error) {
    console.error(`Error fetching ${season} ${year} MAL anime:`, error)
    throw error
  }
}

/**
 * Get recommendations for anime
 */
export async function getMALAnimeRecommendations(
  malId: number
): Promise<
  Array<{
    entry: MALAnime
    url: string
    votes: number
  }>
> {
  try {
    const response = await fetchWithRetry(
      `${MAL_API_BASE}/anime/${malId}/recommendations`
    )
    const data = (await response.json()) as {
      data: Array<{
        entry: MALAnime
        url: string
        votes: number
      }>
    }

    return data.data || []
  } catch (error) {
    console.error(`Error fetching MAL recommendations for ${malId}:`, error)
    return []
  }
}

/**
 * Convert MAL anime data to our database format
 */
export function convertMALToDBFormat(malAnime: MALAnime) {
  const genres = malAnime.genres?.map(g => g.name).join(', ') || ''
  const studios = malAnime.studios?.map(s => s.name).join(', ') || ''

  return {
    title: malAnime.title,
    description: malAnime.synopsis || '',
    genre: genres,
    year: malAnime.year,
    studio: studios,
    imageUrl: malAnime.images.jpg.large_image_url,
    externalId: `mal_${malAnime.mal_id}`,
    externalSource: 'myanimelist' as const,
    externalRating: malAnime.score || 0,
    externalPopularity: malAnime.popularity || 0,
  }
}

/**
 * Batch import anime from MAL
 */
export async function batchImportFromMAL(
  queries: string[]
): Promise<Array<{ anime: MALAnime; success: boolean; error?: string }>> {
  const results = []

  for (const query of queries) {
    try {
      const anime = await getMALAnimeByTitle(query)
      if (anime) {
        results.push({ anime, success: true })
      } else {
        results.push({
          anime: {} as MALAnime,
          success: false,
          error: 'Anime not found',
        })
      }
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      results.push({
        anime: {} as MALAnime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}
