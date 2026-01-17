import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { searchMALAnime, convertMALToDBFormat } from '@/lib/external-apis/mal'
import { searchAniListAnime, convertAniListToDBFormat } from '@/lib/external-apis/anilist'

export async function GET(req: Request) {
  try {
    // Check for admin access
    const session = await getServerSession()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
    })

    if (user?.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    const source = url.searchParams.get('source') as 'mal' | 'anilist' | undefined
    const query = url.searchParams.get('query')

    if (action === 'search' && source && query) {
      if (source === 'mal') {
        const results = await searchMALAnime(query, 10)
        return Response.json({
          source: 'myanimelist',
          results: results.map(anime => ({
            id: anime.mal_id,
            title: anime.title,
            imageUrl: anime.images.jpg.large_image_url,
            year: anime.year,
            genres: anime.genres?.map(g => g.name) || [],
            synopsis: anime.synopsis,
            score: anime.score,
            episodes: anime.episodes,
            externalData: anime,
          })),
        })
      } else if (source === 'anilist') {
        const results = await searchAniListAnime(query, 10)
        return Response.json({
          source: 'anilist',
          results: results.map(anime => ({
            id: anime.id,
            title: anime.title.english || anime.title.romaji,
            imageUrl: anime.coverImage?.large || anime.coverImage?.medium,
            year: anime.startDate?.year,
            genres: anime.genres || [],
            synopsis: anime.description,
            score: anime.score,
            episodes: anime.episodes,
            externalData: anime,
          })),
        })
      }
    }

    if (action === 'import') {
      const animeId = url.searchParams.get('animeId')
      const importSource = url.searchParams.get('source') as 'mal' | 'anilist' | undefined

      if (!animeId || !importSource) {
        return Response.json(
          { error: 'Missing animeId or source' },
          { status: 400 }
        )
      }

      let newAnime
      let convertedData

      if (importSource === 'mal') {
        const malId = parseInt(animeId)
        const malAnime = await searchMALAnime('', 1)
        // In real scenario, fetch by ID
        if (malAnime.length === 0) {
          return Response.json({ error: 'Anime not found on MAL' }, { status: 404 })
        }
        convertedData = convertMALToDBFormat(malAnime[0])
      } else if (importSource === 'anilist') {
        const anilistAnimes = await searchAniListAnime('', 1)
        if (anilistAnimes.length === 0) {
          return Response.json(
            { error: 'Anime not found on AniList' },
            { status: 404 }
          )
        }
        convertedData = convertAniListToDBFormat(anilistAnimes[0])
      }

      if (!convertedData) {
        return Response.json(
          { error: 'Failed to convert anime data' },
          { status: 400 }
        )
      }

      // Check if anime already exists
      let anime = await prisma.anime.findFirst({
        where: {
          title: convertedData.title,
        },
      })

      if (anime) {
        // Update existing anime with better data
        anime = await prisma.anime.update({
          where: { id: anime.id },
          data: {
            description: convertedData.description || anime.description,
            genre: convertedData.genre || anime.genre,
            year: convertedData.year || anime.year,
            studio: convertedData.studio || anime.studio,
            imageUrl: convertedData.imageUrl || anime.imageUrl,
          },
        })
      } else {
        // Create new anime
        newAnime = await prisma.anime.create({
          data: {
            title: convertedData.title,
            description: convertedData.description,
            genre: convertedData.genre,
            year: convertedData.year,
            studio: convertedData.studio,
            imageUrl: convertedData.imageUrl,
          },
        })
      }

      return Response.json({
        success: true,
        anime: anime || newAnime,
        message: anime ? 'Anime updated with external data' : 'New anime imported',
      })
    }

    if (action === 'sync-popular') {
      const source = url.searchParams.get('source') as 'mal' | 'anilist' | undefined
      const limit = parseInt(url.searchParams.get('limit') || '20')

      if (!source) {
        return Response.json({ error: 'Missing source' }, { status: 400 })
      }

      let results: any[] = []

      if (source === 'mal') {
        results = await searchMALAnime('', limit)
      } else if (source === 'anilist') {
        results = await searchAniListAnime('', limit)
      }

      const imported = []
      const skipped = []

      for (const result of results) {
        try {
          const convertedData =
            source === 'mal'
              ? convertMALToDBFormat(result)
              : convertAniListToDBFormat(result)

          // Check if already exists
          const existing = await prisma.anime.findFirst({
            where: { title: convertedData.title },
          })

          if (!existing) {
            const newAnime = await prisma.anime.create({
              data: {
                title: convertedData.title,
                description: convertedData.description,
                genre: convertedData.genre,
                year: convertedData.year,
                studio: convertedData.studio,
                imageUrl: convertedData.imageUrl,
              },
            })
            imported.push(newAnime)
          } else {
            skipped.push(existing.id)
          }
        } catch (error) {
          console.error('Error importing anime:', error)
        }
      }

      return Response.json({
        success: true,
        imported: imported.length,
        skipped: skipped.length,
        animes: imported,
      })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('External API sync error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
