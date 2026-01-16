import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - принять или отклонить запрос
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(session.user.id)
    const { action } = await request.json() // 'accept' или 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Неверное действие' },
        { status: 400 }
      )
    }

    const friendRequest = await prisma.friend.findUnique({
      where: { id: parseInt(id) }
    })

    if (!friendRequest) {
      return NextResponse.json(
        { error: 'Запрос не найден' },
        { status: 404 }
      )
    }

    // Проверяем, что это запрос адресован текущему пользователю
    if (friendRequest.receiverId !== userId) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    if (action === 'accept') {
      const updated = await prisma.friend.update({
        where: { id: parseInt(id) },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date()
        },
        include: {
          sender: { select: { id: true, username: true, avatar: true } },
          receiver: { select: { id: true, username: true, avatar: true } }
        }
      })

      return NextResponse.json(updated)
    } else {
      await prisma.friend.delete({
        where: { id: parseInt(id) }
      })

      return NextResponse.json({ message: 'Запрос отклонен' })
    }
  } catch (error) {
    console.error('Ошибка при обновлении запроса в друзья:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// DELETE - удалить друга
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(session.user.id)

    const friendRequest = await prisma.friend.findUnique({
      where: { id: parseInt(id) }
    })

    if (!friendRequest) {
      return NextResponse.json(
        { error: 'Друг не найден' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь может удалить дружбу
    if (friendRequest.senderId !== userId && friendRequest.receiverId !== userId) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    await prisma.friend.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Друг удален' })
  } catch (error) {
    console.error('Ошибка при удалении друга:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
