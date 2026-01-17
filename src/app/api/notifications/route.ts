import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const searchParams = new URL(request.url).searchParams
    const unread = searchParams.get('unread') === 'true'

    // Получаем уведомления
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unread && { read: false })
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Получаем количество непрочитанных
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, read } = await request.json()
    const userId = parseInt(session.user.id)

    // Проверяем что уведомление принадлежит пользователю
    const notification = await prisma.notification.findUnique({
      where: { id }
    })

    if (!notification || notification.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Обновляем статус
    const updated = await prisma.notification.update({
      where: { id },
      data: { read }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update notification:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}

// Пометить все как прочитанные
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)

    await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: { read: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to mark as read:', error)
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
  }
}
