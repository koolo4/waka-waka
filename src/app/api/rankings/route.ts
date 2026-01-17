import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Получаем топ пользователей по активности
    const topUsers = await prisma.userStats.findMany({
      orderBy: { activityScore: 'desc' },
      take: limit,
      skip: offset,
      select: {
        userId: true,
        ratingsCount: true,
        commentsCount: true,
        animesViewed: true,
        friendsCount: true,
        activityScore: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    })

    // Получаем общее количество
    const total = await prisma.userStats.count()

    return NextResponse.json({
      users: topUsers,
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error('Failed to fetch user rankings:', error)
    return NextResponse.json({ error: 'Failed to fetch user rankings' }, { status: 500 })
  }
}
