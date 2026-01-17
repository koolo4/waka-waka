/**
 * Hook for syncing anime from external sources
 * Handles MyAnimeList and AniList integration
 */

import { searchMALAnime, convertMALToDBFormat } from '@/lib/external-apis/mal'
import { searchAniListAnime, convertAniListToDBFormat } from '@/lib/external-apis/anilist'
import { prisma } from '@/lib/prisma'

export interface SyncStats {
  imported: number
  updated: number
  skipped: number
  errors: Array<{ query: string; error: string }>
  duration: number
}

/**
 * Sync popular anime from MyAnimeList
 */
export async function syncPopularFromMAL(limit = 25): Promise<SyncStats> {
  const startTime = Date.now()
  const stats: SyncStats = {
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    duration: 0,
  }

  try {
    const malAnimes = await searchMALAnime('', limit)

    for (const malAnime of malAnimes) {
      try {
        const convertedData = convertMALToDBFormat(malAnime)

        // Check if exists by title
        const existing = await prisma.anime.findFirst({
          where: { title: convertedData.title },
        })

        if (existing) {
          // Update with external data if better
          if (convertedData.imageUrl && !existing.imageUrl) {
            await prisma.anime.update({
              where: { id: existing.id },
              data: {
                imageUrl: convertedData.imageUrl,
                description: convertedData.description || existing.description,
                malId: malAnime.mal_id,
                externalSource: 'myanimelist',
                externalRating: malAnime.score,
                externalPopularity: malAnime.popularity,
                lastSyncedAt: new Date(),
              },
            })
            stats.updated++
          } else {
            stats.skipped++
          }
        } else {
          // Create new anime
          await prisma.anime.create({
            data: {
              title: convertedData.title,
              description: convertedData.description,
              genre: convertedData.genre,
              year: convertedData.year,
              studio: convertedData.studio,
              imageUrl: convertedData.imageUrl,
              malId: malAnime.mal_id,
              externalSource: 'myanimelist',
              externalRating: malAnime.score,
              externalPopularity: malAnime.popularity,
              lastSyncedAt: new Date(),
            },
          })
          stats.imported++
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        stats.errors.push({
          query: malAnime.title,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  } catch (error) {
    console.error('Error syncing popular from MAL:', error)
    throw error
  }

  stats.duration = Date.now() - startTime
  return stats
}

/**
 * Sync popular anime from AniList
 */
export async function syncPopularFromAniList(limit = 25): Promise<SyncStats> {
  const startTime = Date.now()
  const stats: SyncStats = {
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    duration: 0,
  }

  try {
    const anilistAnimes = await searchAniListAnime('', limit)

    for (const anilistAnime of anilistAnimes) {
      try {
        const convertedData = convertAniListToDBFormat(anilistAnime)

        // Check if exists by title
        const existing = await prisma.anime.findFirst({
          where: { title: convertedData.title },
        })

        if (existing) {
          // Update with external data if better
          if (convertedData.imageUrl && !existing.imageUrl) {
            await prisma.anime.update({
              where: { id: existing.id },
              data: {
                imageUrl: convertedData.imageUrl,
                description: convertedData.description || existing.description,
                anilistId: anilistAnime.id,
                malId: convertedData.malId || existing.malId,
                externalSource: 'anilist',
                externalRating: anilistAnime.score,
                externalPopularity: anilistAnime.popularity,
                lastSyncedAt: new Date(),
              },
            })
            stats.updated++
          } else {
            stats.skipped++
          }
        } else {
          // Create new anime
          await prisma.anime.create({
            data: {
              title: convertedData.title,
              description: convertedData.description,
              genre: convertedData.genre,
              year: convertedData.year,
              studio: convertedData.studio,
              imageUrl: convertedData.imageUrl,
              anilistId: anilistAnime.id,
              malId: convertedData.malId,
              externalSource: 'anilist',
              externalRating: anilistAnime.score,
              externalPopularity: anilistAnime.popularity,
              lastSyncedAt: new Date(),
            },
          })
          stats.imported++
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        stats.errors.push({
          query: anilistAnime.title.english || anilistAnime.title.romaji,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  } catch (error) {
    console.error('Error syncing popular from AniList:', error)
    throw error
  }

  stats.duration = Date.now() - startTime
  return stats
}

/**
 * Sync specific anime by search query from MAL
 */
export async function syncAnimeByQueryMAL(query: string): Promise<SyncStats> {
  const startTime = Date.now()
  const stats: SyncStats = {
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    duration: 0,
  }

  try {
    const malAnimes = await searchMALAnime(query, 1)

    if (malAnimes.length === 0) {
      stats.errors.push({ query, error: 'Anime not found on MAL' })
      stats.duration = Date.now() - startTime
      return stats
    }

    const malAnime = malAnimes[0]
    const convertedData = convertMALToDBFormat(malAnime)

    const existing = await prisma.anime.findFirst({
      where: { title: convertedData.title },
    })

    if (existing) {
      await prisma.anime.update({
        where: { id: existing.id },
        data: {
          imageUrl: convertedData.imageUrl || existing.imageUrl,
          description: convertedData.description || existing.description,
          malId: malAnime.mal_id,
          externalSource: 'myanimelist',
          externalRating: malAnime.score,
          externalPopularity: malAnime.popularity,
          lastSyncedAt: new Date(),
        },
      })
      stats.updated++
    } else {
      await prisma.anime.create({
        data: {
          title: convertedData.title,
          description: convertedData.description,
          genre: convertedData.genre,
          year: convertedData.year,
          studio: convertedData.studio,
          imageUrl: convertedData.imageUrl,
          malId: malAnime.mal_id,
          externalSource: 'myanimelist',
          externalRating: malAnime.score,
          externalPopularity: malAnime.popularity,
          lastSyncedAt: new Date(),
        },
      })
      stats.imported++
    }
  } catch (error) {
    stats.errors.push({
      query,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  stats.duration = Date.now() - startTime
  return stats
}

/**
 * Sync specific anime by search query from AniList
 */
export async function syncAnimeByQueryAniList(query: string): Promise<SyncStats> {
  const startTime = Date.now()
  const stats: SyncStats = {
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    duration: 0,
  }

  try {
    const anilistAnimes = await searchAniListAnime(query, 1)

    if (anilistAnimes.length === 0) {
      stats.errors.push({ query, error: 'Anime not found on AniList' })
      stats.duration = Date.now() - startTime
      return stats
    }

    const anilistAnime = anilistAnimes[0]
    const convertedData = convertAniListToDBFormat(anilistAnime)

    const existing = await prisma.anime.findFirst({
      where: { title: convertedData.title },
    })

    if (existing) {
      await prisma.anime.update({
        where: { id: existing.id },
        data: {
          imageUrl: convertedData.imageUrl || existing.imageUrl,
          description: convertedData.description || existing.description,
          anilistId: anilistAnime.id,
          malId: convertedData.malId || existing.malId,
          externalSource: 'anilist',
          externalRating: anilistAnime.score,
          externalPopularity: anilistAnime.popularity,
          lastSyncedAt: new Date(),
        },
      })
      stats.updated++
    } else {
      await prisma.anime.create({
        data: {
          title: convertedData.title,
          description: convertedData.description,
          genre: convertedData.genre,
          year: convertedData.year,
          studio: convertedData.studio,
          imageUrl: convertedData.imageUrl,
          anilistId: anilistAnime.id,
          malId: convertedData.malId,
          externalSource: 'anilist',
          externalRating: anilistAnime.score,
          externalPopularity: anilistAnime.popularity,
          lastSyncedAt: new Date(),
        },
      })
      stats.imported++
    }
  } catch (error) {
    stats.errors.push({
      query,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  stats.duration = Date.now() - startTime
  return stats
}
