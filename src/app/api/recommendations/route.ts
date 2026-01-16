import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Функция для расчета рекомендаций
async function generateRecommendations(userId: number) {
  // 1. Получаем оценки пользователя
  const userRatings = await prisma.rating.findMany({
    where: { userId },
    include: {
      anime: {
        select: {
          id: true,
          genre: true
        }
      }
    }
  })

  const ratedAnimeIds = userRatings.map(r => r.anime.id)
  const userGenres = new Set<string>()

  // Собираем жанры из оценённого аниме
  userRatings.forEach(rating => {
    if (rating.anime.genre) {
      rating.anime.genre.split(',').forEach(g => {
        userGenres.add(g.trim())
      })
    }
  })

  // 2. Получаем рекомендации от друзей
  const acceptedFriends = await prisma.friend.findMany({
    where: {
      OR: [
        { senderId: userId, status: 'ACCEPTED' },
        { receiverId: userId, status: 'ACCEPTED' }
      ]
    },
    select: {
      senderId: true,
      receiverId: true
    }
  })

  const friendIds = acceptedFriends.map(f =>
    f.senderId === userId ? f.receiverId : f.senderId
  )

  // Получаем оценки друзей с высоким рейтингом
  const friendRatings = await prisma.rating.findMany({
    where: {
      userId: { in: friendIds },
      animeId: { notIn: ratedAnimeIds },
      overallRating: { gte: 7 } // Только хорошие оценки
    },
    include: {
      anime: {
        select: {
          id: true,
          title: true,
          genre: true
        }
      }
    },
    take: 50
  })

  // 3. Получаем аниме с похожими жанрами
  const genreQuery = Array.from(userGenres).join('|')
  const similarGenreAnime = await prisma.anime.findMany({
    where: {
      AND: [
        { genre: { search: Array.from(userGenres).join(' | ') } },
        { id: { notIn: ratedAnimeIds } }
      ]
    },
    select: {
      id: true,
      title: true
    },
    take: 50
  })

  // 4. Создаём рекомендации
  const recommendations: any[] = []

  // Рекомендации от друзей
  friendRatings.forEach(rating => {
    const existingIndex = recommendations.findIndex(
      r => r.animeId === rating.animeId
    )

    if (existingIndex >= 0) {
      recommendations[existingIndex].score += 30
      recommendations[existingIndex].reasons.push('friend_rating')
    } else {
      recommendations.push({
        animeId: rating.anime.id,
        score: 30 + (rating.overallRating - 5),
        reasons: ['friend_rating']
      })
    }
  })

  // Рекомендации по жанрам
  similarGenreAnime.forEach(anime => {
    const existingIndex = recommendations.findIndex(
      r => r.animeId === anime.id
    )

    if (existingIndex >= 0) {
      recommendations[existingIndex].score += 25
      recommendations[existingIndex].reasons.push('genre')
    } else {
      recommendations.push({
        animeId: anime.id,
        score: 25,
        reasons: ['genre']
      })
    }
  })

  // Сортируем по релевантности и сохраняем
  recommendations.sort((a, b) => b.score - a.score)

  // Удаляем старые рекомендации
  await prisma.recommendation.deleteMany({
    where: { userId }
  })

  // Сохраняем новые (топ 20)
  for (const rec of recommendations.slice(0, 20)) {
    await prisma.recommendation.create({
      data: {
        userId,
        animeId: rec.animeId,
        reason: rec.reasons.join(', '),
        score: Math.min(100, rec.score)
      }
    })
  }
}

// GET - получить рекомендации
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')

    // Генерируем рекомендации если их нет
    const existingRecs = await prisma.recommendation.findMany({
      where: { userId }
    })

    if (existingRecs.length === 0) {
      await generateRecommendations(userId)
    }

    // Получаем рекомендации
    const recommendations = await prisma.recommendation.findMany({
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
            studio: true,
            creator: { select: { username: true } },
            _count: {
              select: {
                ratings: true,
                comments: true,
                userStatuses: true
              }
            }
          }
        }
      },
      orderBy: { score: 'desc' },
      take: limit
    })

    // Получаем рейтинги для рекомендованного аниме
    const animeIds = recommendations.map(r => r.anime.id)
    const ratingStats = await prisma.rating.groupBy({
      by: ['animeId'],
      where: { animeId: { in: animeIds } },
      _avg: {
        overallRating: true
      }
    })

    const ratingsMap = new Map(
      ratingStats.map(r => [r.animeId, r._avg.overallRating || 0])
    )

    const formatted = recommendations.map(rec => ({
      ...rec,
      anime: {
        ...rec.anime,
        averageRating: ratingsMap.get(rec.anime.id) || 0,
        ratingsCount: rec.anime._count.ratings,
        commentsCount: rec.anime._count.comments,
        viewsCount: rec.anime._count.userStatuses
      }
    }))

    return NextResponse.json({ recommendations: formatted })
  } catch (error) {
    console.error('Ошибка получения рекомендаций:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// POST - переген рекомендаций
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    await generateRecommendations(userId)

    return NextResponse.json({ message: 'Рекомендации обновлены' })
  } catch (error) {
    console.error('Ошибка при генерации рекомендаций:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
