import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)

    // Получаем друзей пользователя
    const friends = await prisma.friend.findMany({
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

    const friendIds = friends.map(f =>
      f.senderId === userId ? f.receiverId : f.senderId
    )

    if (friendIds.length === 0) {
      return NextResponse.json([])
    }

    // Получаем последнюю активность друзей (рейтинги и комментарии за последние 7 дней)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const friendActivity = await prisma.rating.findMany({
      where: {
        userId: { in: friendIds },
        createdAt: { gte: sevenDaysAgo }
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        anime: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    const friendComments = await prisma.comment.findMany({
      where: {
        userId: { in: friendIds },
        createdAt: { gte: sevenDaysAgo }
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        anime: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Объединяем и сортируем по времени
    const activity = [
      ...friendActivity.map(r => ({
        type: 'rating' as const,
        id: `rating-${r.id}`,
        userId: r.userId,
        user: r.user,
        anime: r.anime,
        data: {
          rating: r.overallRating
        },
        createdAt: r.createdAt
      })),
      ...friendComments.map(c => ({
        type: 'comment' as const,
        id: `comment-${c.id}`,
        userId: c.userId,
        user: c.user,
        anime: c.anime,
        data: {
          text: c.text.substring(0, 100)
        },
        createdAt: c.createdAt
      }))
    ]

    activity.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return NextResponse.json(activity.slice(0, 15))
  } catch (error) {
    console.error('Failed to fetch activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}
