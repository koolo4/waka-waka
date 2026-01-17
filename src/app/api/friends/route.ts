import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyFriendRequest } from '@/lib/notifications'
import { sendNotificationViaWebSocket } from '@/lib/socket-io-server'

// GET - получить всех друзей и запросы
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // all, accepted, pending, sent

    let query: any = {}

    if (type === 'accepted') {
      query = {
        OR: [
          { senderId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' }
        ]
      }
    } else if (type === 'pending') {
      query = {
        receiverId: userId,
        status: 'PENDING'
      }
    } else if (type === 'sent') {
      query = {
        senderId: userId,
        status: 'PENDING'
      }
    }

    const friends = await prisma.friend.findMany({
      where: query,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: {
        acceptedAt: 'desc'
      }
    })

    return NextResponse.json({ friends })
  } catch (error) {
    console.error('Ошибка получения друзей:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// POST - отправить запрос в друзья
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const { targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'ID пользователя обязателен' },
        { status: 400 }
      )
    }

    if (userId === targetUserId) {
      return NextResponse.json(
        { error: 'Нельзя добавить себя в друзья' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли уже запрос
    const existing = await prisma.friend.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: userId }
        ]
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Запрос уже существует' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли целевой пользователь
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    const friend = await prisma.friend.create({
      data: {
        senderId: userId,
        receiverId: targetUserId,
        status: 'PENDING'
      },
      include: {
        sender: { select: { username: true, avatar: true } },
        receiver: { select: { username: true, avatar: true } }
      }
    })

    // Отправляем уведомление получателю
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true }
    })

    if (sender) {
      // Создаем уведомление в БД
      const notification = await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: 'friend_request',
          title: `Новый запрос в друзья`,
          message: `${sender.username} отправил вам запрос в друзья`,
          relatedId: userId
        }
      })

      // Отправляем через WebSocket
      sendNotificationViaWebSocket(targetUserId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        relatedId: notification.relatedId,
        createdAt: notification.createdAt.toISOString()
      })

      // Также отправляем через старый метод для совместимости
      await notifyFriendRequest(userId, targetUserId, sender.username)
    }

    return NextResponse.json(friend)
  } catch (error) {
    console.error('Ошибка создания запроса в друзья:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
