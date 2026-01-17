/**
 * AniList API Integration
 * Provides methods to fetch anime data from AniList
 * Uses GraphQL API
 */

export interface AniListAnime {
  id: number
  idMal?: number
  title: {
    romaji: string
    english?: string
    native?: string
  }
  description?: string
  coverImage?: {
    large?: string
    medium?: string
  }
  bannerImage?: string
  episodes?: number
  status?: string
  startDate?: {
    year?: number
    month?: number
    day?: number
  }
  endDate?: {
    year?: number
    month?: number
    day?: number
  }
  season?: string
  seasonYear?: number
  studios?: {
    nodes?: Array<{ id: number; name: string }>
  }
  genres?: string[]
  score?: number
  popularity?: number
  trending?: number
  source?: string
  format?: string
  synonyms?: string[]
  siteUrl?: string
}

export interface AniListSearchResult {
  data: {
    Page: {
      media: AniListAnime[]
      pageInfo: {
        hasNextPage: boolean
        total: number
      }
    }
  }
}

const ANILIST_API_BASE = 'https://graphql.anilist.co'

const ANIME_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          medium
        }
        bannerImage
        episodes
        status
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        season
        seasonYear
        studios(isMain: true) {
          nodes {
            id
            name
          }
        }
        genres
        score
        popularity
        trending
        source
        format
        synonyms
        siteUrl
      }
      pageInfo {
        hasNextPage
        total
      }
    }
  }
`

const TOP_ANIME_QUERY = `
  query ($page: Int, $perPage: Int, $sort: [MediaSort!]) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: $sort) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          medium
        }
        bannerImage
        episodes
        status
        startDate {
          year
          month
          day
        }
        season
        seasonYear
        studios(isMain: true) {
          nodes {
            id
            name
          }
        }
        genres
        score
        popularity
        trending
        source
        format
        siteUrl
      }
      pageInfo {
        hasNextPage
        total
      }
    }
  }
`

// Retry logic for rate limiting
async function fetchWithRetry(
  query: string,
  variables: Record<string, any> = {},
  maxRetries = 3,
  delayMs = 1000
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(ANILIST_API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      // If rate limited, wait and retry
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delayMs * (i + 1)
        console.log(`Rate limited, waiting ${waitTime}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }

      if (!response.ok) {
        throw new Error(`AniList API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.errors) {
        throw new Error(`AniList GraphQL error: ${data.errors[0]?.message}`)
      }

      return data
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

/**
 * Search for anime on AniList
 */
export async function searchAniListAnime(
  query: string,
  limit = 25
): Promise<AniListAnime[]> {
  try {
    const result = (await fetchWithRetry(ANIME_QUERY, {
      search: query,
      page: 1,
      perPage: limit,
    })) as AniListSearchResult

    return result.data.Page.media || []
  } catch (error) {
    console.error('Error searching AniList anime:', error)
    throw error
  }
}

/**
 * Get anime by AniList ID
 */
export async function getAniListAnimeById(id: number): Promise<AniListAnime | null> {
  try {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          description
          coverImage {
            large
            medium
          }
          bannerImage
          episodes
          status
          startDate {
            year
            month
            day
          }
          season
          seasonYear
          studios(isMain: true) {
            nodes {
              id
              name
            }
          }
          genres
          score
          popularity
          trending
          source
          format
          siteUrl
        }
      }
    `

    const result = (await fetchWithRetry(query, { id })) as any
    return result.data.Media || null
  } catch (error) {
    console.error(`Error fetching AniList anime ${id}:`, error)
    return null
  }
}

/**
 * Get top/trending anime
 */
export async function getTopAniListAnime(
  limit = 25,
  sort: 'SCORE_DESC' | 'POPULARITY_DESC' | 'TRENDING_DESC' | 'UPDATED_AT_DESC' = 'SCORE_DESC'
): Promise<AniListAnime[]> {
  try {
    const result = (await fetchWithRetry(TOP_ANIME_QUERY, {
      page: 1,
      perPage: limit,
      sort: [sort],
    })) as AniListSearchResult

    return result.data.Page.media || []
  } catch (error) {
    console.error('Error fetching top AniList anime:', error)
    throw error
  }
}

/**
 * Get seasonal anime from AniList
 */
export async function getSeasonalAniListAnime(
  season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL',
  year: number,
  limit = 25
): Promise<AniListAnime[]> {
  try {
    const query = `
      query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              medium
            }
            episodes
            status
            startDate {
              year
              month
              day
            }
            season
            seasonYear
            genres
            score
            popularity
            source
            siteUrl
          }
          pageInfo {
            hasNextPage
            total
          }
        }
      }
    `

    const result = (await fetchWithRetry(query, {
      season,
      seasonYear: year,
      page: 1,
      perPage: limit,
    })) as AniListSearchResult

    return result.data.Page.media || []
  } catch (error) {
    console.error(`Error fetching ${season} ${year} AniList anime:`, error)
    throw error
  }
}

/**
 * Get related anime recommendations
 */
export async function getAniListRecommendations(
  id: number,
  limit = 10
): Promise<AniListAnime[]> {
  try {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          recommendations(sort: RATING_DESC) {
            nodes {
              mediaRecommendation {
                id
                idMal
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  large
                  medium
                }
                score
                popularity
                siteUrl
              }
            }
          }
        }
      }
    `

    const result = (await fetchWithRetry(query, { id })) as any
    const recommendations = result.data.Media?.recommendations?.nodes || []

    return recommendations
      .slice(0, limit)
      .map((r: any) => r.mediaRecommendation)
      .filter(Boolean)
  } catch (error) {
    console.error(`Error fetching AniList recommendations for ${id}:`, error)
    return []
  }
}

/**
 * Convert AniList anime data to our database format
 */
export function convertAniListToDBFormat(anilistAnime: AniListAnime) {
  const genres = anilistAnime.genres?.join(', ') || ''
  const studios = anilistAnime.studios?.nodes?.map(s => s.name).join(', ') || ''
  const year = anilistAnime.startDate?.year

  return {
    title: anilistAnime.title.english || anilistAnime.title.romaji,
    description: anilistAnime.description || '',
    genre: genres,
    year,
    studio: studios,
    imageUrl: anilistAnime.coverImage?.large || anilistAnime.coverImage?.medium || '',
    externalId: `anilist_${anilistAnime.id}`,
    externalSource: 'anilist' as const,
    externalRating: anilistAnime.score || 0,
    externalPopularity: anilistAnime.popularity || 0,
    malId: anilistAnime.idMal,
  }
}

/**
 * Batch import anime from AniList
 */
export async function batchImportFromAniList(
  queries: string[]
): Promise<Array<{ anime: AniListAnime; success: boolean; error?: string }>> {
  const results = []

  for (const query of queries) {
    try {
      const animes = await searchAniListAnime(query, 1)
      if (animes.length > 0) {
        results.push({ anime: animes[0], success: true })
      } else {
        results.push({
          anime: {} as AniListAnime,
          success: false,
          error: 'Anime not found',
        })
      }
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      results.push({
        anime: {} as AniListAnime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}
