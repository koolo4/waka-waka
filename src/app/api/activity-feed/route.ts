import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    const limit = Math.min(50, Number(req.nextUrl.searchParams.get('limit')) || 20)
    const offset = Number(req.nextUrl.searchParams.get('offset')) || 0

    // Получаем друзей пользователя
    const friendRequests = await prisma.friend.findMany({
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

    const friendIds = friendRequests.map(fr => 
      fr.senderId === userId ? fr.receiverId : fr.senderId
    )

    if (friendIds.length === 0) {
      return NextResponse.json({
        activities: [],
        total: 0,
        hasMore: false
      })
    }

    // Получаем активность друзей
    const activities: any[] = []

    // Рейтинги друзей
    const friendRatings = await prisma.rating.findMany({
      where: { userId: { in: friendIds } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        userId: true,
        animeId: true,
        overallRating: true,
        createdAt: true,
        user: {
          select: { id: true, username: true, avatar: true }
        },
        anime: {
          select: { id: true, title: true, imageUrl: true }
        }
      }
    })

    friendRatings.forEach(rating => {
      activities.push({
        id: `rating_${rating.id}`,
        userId: rating.userId.toString(),
        username: rating.user.username,
        avatar: rating.user.avatar,
        type: 'rated',
        animeId: rating.animeId,
        animeTitle: rating.anime.title,
        animeImage: rating.anime.imageUrl,
        rating: rating.overallRating,
        timestamp: rating.createdAt
      })
    })

    // Комментарии друзей
    const friendComments = await prisma.comment.findMany({
      where: { userId: { in: friendIds } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        userId: true,
        animeId: true,
        comment: true,
        createdAt: true,
        user: {
          select: { id: true, username: true, avatar: true }
        },
        anime: {
          select: { id: true, title: true, imageUrl: true }
        }
      }
    })

    friendComments.forEach(comment => {
      activities.push({
        id: `comment_${comment.id}`,
        userId: comment.userId.toString(),
        username: comment.user.username,
        avatar: comment.user.avatar,
        type: 'commented',
        animeId: comment.animeId,
        animeTitle: comment.anime.title,
        animeImage: comment.anime.imageUrl,
        comment: comment.comment,
        timestamp: comment.createdAt
      })
    })

    // Статусы друзей (начало просмотра)
    const friendStatuses = await prisma.userAnimeStatus.findMany({
      where: {
        userId: { in: friendIds },
        status: 'WATCHING'
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        userId: true,
        animeId: true,
        updatedAt: true,
        user: {
          select: { id: true, username: true, avatar: true }
        },
        anime: {
          select: { id: true, title: true, imageUrl: true }
        }
      }
    })

    friendStatuses.forEach(status => {
      activities.push({
        id: `status_${status.id}`,
        userId: status.userId.toString(),
        username: status.user.username,
        avatar: status.user.avatar,
        type: 'watched',
        animeId: status.animeId,
        animeTitle: status.anime.title,
        animeImage: status.anime.imageUrl,
        timestamp: status.updatedAt
      })
    })

    // Сортируем по времени (новые сверху)
    const sortedActivities = activities.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    return NextResponse.json({
      activities: sortedActivities.slice(0, limit),
      total: activities.length,
      hasMore: sortedActivities.length > limit
    })
  } catch (error) {
    console.error('Error fetching activity feed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
