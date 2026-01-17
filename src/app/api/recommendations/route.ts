import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Функция для расчета рекомендаций
async function generateRecommendations(userId: number) {
  // 1. Получаем оценки пользователя и его предпочтения
  const userRatings = await prisma.rating.findMany({
    where: { userId },
    include: {
      anime: {
        select: {
          id: true,
          genre: true,
          title: true
        }
      }
    }
  })

  const ratedAnimeIds = userRatings.map(r => r.anime.id)
  const userGenres = new Map<string, number>()
  const avgUserRating = userRatings.length > 0 
    ? userRatings.reduce((sum, r) => sum + r.overallRating, 0) / userRatings.length
    : 5

  // Собираем жанры из оценённого аниме с весами
  userRatings.forEach(rating => {
    if (rating.anime.genre) {
      rating.anime.genre.split(',').forEach(g => {
        const genre = g.trim()
        const weight = rating.overallRating / 10 // Высокооценённые аниме имеют больше веса
        userGenres.set(genre, (userGenres.get(genre) || 0) + weight)
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
    take: 100
  })

  // 3. Получаем аниме с похожими жанрами
  const topGenres = Array.from(userGenres.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([g]) => g)

  const similarGenreAnime = await prisma.anime.findMany({
    where: {
      id: { notIn: ratedAnimeIds },
      OR: topGenres.map(g => ({
        genre: { contains: g }
      }))
    },
    select: {
      id: true,
      title: true,
      genre: true
    },
    take: 100
  })

  // 4. Получаем статистику аниме для учёта популярности
  const allAnimeToScore = new Set([
    ...friendRatings.map(r => r.anime.id),
    ...similarGenreAnime.map(a => a.id)
  ])

  const animeStats = await prisma.rating.groupBy({
    by: ['animeId'],
    where: { animeId: { in: Array.from(allAnimeToScore) } },
    _avg: { overallRating: true },
    _count: { id: true }
  })

  const statsMap = new Map<number, { avgRating: number; count: number }>(
    animeStats.map(s => [
      s.animeId,
      { avgRating: s._avg.overallRating || 0, count: (s._count.id as unknown) as number }
    ])
  )

  // 5. Создаём рекомендации с улучшенным скорингом
  const recommendations = new Map<number, any>()

  // Рекомендации от друзей
  friendRatings.forEach(rating => {
    const baseScore = 40 + (rating.overallRating - 5) * 5 // 40-70
    const stats = statsMap.get(rating.anime.id)
    const popularityBonus = Math.min(20, Math.max(0, (stats?.count ?? 0) / 10)) // Бонус за популярность
    const ratingBonus = Math.max(0, (stats?.avgRating ?? 0) / 10 * 10) // Бонус за средний рейтинг

    const totalScore = baseScore + popularityBonus + ratingBonus

    if (recommendations.has(rating.anime.id)) {
      recommendations.get(rating.anime.id).score += totalScore
      recommendations.get(rating.anime.id).reasons.add('friend_rating')
    } else {
      recommendations.set(rating.anime.id, {
        animeId: rating.anime.id,
        score: totalScore,
        reasons: new Set(['friend_rating'])
      })
    }
  })

  // Рекомендации по жанрам
  similarGenreAnime.forEach(anime => {
    const baseScore = 25
    const stats = statsMap.get(anime.id)
    const popularityBonus = Math.min(15, Math.max(0, (stats?.count ?? 0) / 15))
    const ratingBonus = Math.max(0, (stats?.avgRating ?? 0) / 10 * 8)

    const totalScore = baseScore + popularityBonus + ratingBonus

    if (recommendations.has(anime.id)) {
      const existing = recommendations.get(anime.id)
      existing.score += totalScore
      existing.reasons.add('genre')
    } else {
      recommendations.set(anime.id, {
        animeId: anime.id,
        score: totalScore,
        reasons: new Set(['genre'])
      })
    }
  })

  // Сортируем по релевантности и нормализуем оценки
  const sortedRecs = Array.from(recommendations.values())
    .sort((a, b) => b.score - a.score)
    .map(rec => ({
      ...rec,
      score: Math.min(100, Math.round((rec.score / 100) * 100)), // Нормализуем 0-100
      reasons: Array.from(rec.reasons)
    }))

  // Удаляем старые рекомендации
  await prisma.recommendation.deleteMany({
    where: { userId }
  })

  // Сохраняем новые (топ 25)
  for (const rec of sortedRecs.slice(0, 25)) {
    await prisma.recommendation.create({
      data: {
        userId,
        animeId: rec.animeId,
        reason: rec.reasons.join(', '),
        score: rec.score
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
