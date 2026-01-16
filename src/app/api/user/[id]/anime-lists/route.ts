import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    const userId = parseInt(id)
    const currentUserId = parseInt(session.user.id)

    // Проверяем, что пользователь запрашивает свои собственные списки или является админом
    if (userId !== currentUserId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    }

    // Получаем все аниме пользователя с их статусами и рейтингами
    const userAnimeStatuses = await prisma.userAnimeStatus.findMany({
      where: { userId },
      include: {
        anime: {
          select: {
            id: true,
            title: true,
            description: true,
            genre: true,
            year: true,
            imageUrl: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Получаем рейтинги пользователя для этих аниме
    const animeIds = userAnimeStatuses.map(status => status.animeId)
    const userRatings = await prisma.rating.findMany({
      where: {
        userId,
        animeId: { in: animeIds }
      }
    })

    // Создаем карту рейтингов для быстрого доступа
    const ratingsMap = new Map(
      userRatings.map(rating => [rating.animeId, rating])
    )

    // Группируем аниме по статусам
    const animeByStatus: Record<string, any[]> = {
      PLANNED: [],
      WATCHING: [],
      COMPLETED: [],
      DROPPED: []
    }

    userAnimeStatuses.forEach(userStatus => {
      const anime = userStatus.anime
      const rating = ratingsMap.get(anime.id)

      const animeWithDetails = {
        id: anime.id,
        title: anime.title,
        description: anime.description,
        genre: anime.genre,
        year: anime.year,
        imageUrl: anime.imageUrl,
        status: userStatus.status,
        addedAt: userStatus.createdAt.toISOString(),
        rating: rating ? {
          overallRating: rating.overallRating,
          storyRating: rating.storyRating,
          artRating: rating.artRating,
          charactersRating: rating.charactersRating,
          soundRating: rating.soundRating
        } : undefined
      }

      animeByStatus[userStatus.status].push(animeWithDetails)
    })

    return NextResponse.json(animeByStatus)
  } catch (error) {
    console.error('Ошибка получения списков аниме:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
