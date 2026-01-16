import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Получаем топ аниме по количеству просмотров, комментариев и оценок за последнее время
    const trendingAnime = await prisma.anime.findMany({
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
      },
      take: 12
    })

    // Получаем рейтинги для тренду
    const animeIds = trendingAnime.map(a => a.id)
    const ratingStats = await prisma.rating.groupBy({
      by: ['animeId'],
      where: { animeId: { in: animeIds } },
      _avg: { overallRating: true }
    })

    const ratingsMap = new Map(
      ratingStats.map(r => [r.animeId, r._avg.overallRating || 0])
    )

    // Вычисляем "трендScore" на основе активности и рейтинга
    const trendingWithScores = trendingAnime.map(anime => {
      const trendScore = 
        (anime._count.ratings * 0.4) + 
        (anime._count.comments * 0.3) + 
        (anime._count.userStatuses * 0.2) +
        ((ratingsMap.get(anime.id) || 0) * 10)
      
      return {
        ...anime,
        averageRating: ratingsMap.get(anime.id) || 0,
        trendScore
      }
    })

    // Сортируем по тренду
    trendingWithScores.sort((a, b) => b.trendScore - a.trendScore)

    return NextResponse.json(trendingWithScores.slice(0, 12))
  } catch (error) {
    console.error('Failed to fetch trending anime:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending anime' },
      { status: 500 }
    )
  }
}
