import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Проверяем права администратора
    const adminUser = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true }
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Нет прав доступа' }, { status: 403 })
    }

    const { id } = await params
    const userId = parseInt(id)
    const { role } = await request.json()

    // Не позволяем изменить свою собственную роль
    if (userId === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Нельзя изменить свою собственную роль' },
        { status: 400 }
      )
    }

    // Проверяем, что роль валидна
    if (!['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Неверная роль' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Ошибка изменения пользователя:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Проверяем права администратора
    const adminUser = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true }
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Нет прав доступа' }, { status: 403 })
    }

    const { id } = await params
    const userId = parseInt(id)

    // Не позволяем удалить самого себя
    if (userId === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Нельзя удалить самого себя' },
        { status: 400 }
      )
    }

    // Сначала удаляем связанные данные
    await prisma.$transaction(async (tx) => {
      // Удаляем комментарии пользователя
      await tx.comment.deleteMany({
        where: { userId }
      })

      // Удаляем оценки пользователя
      await tx.rating.deleteMany({
        where: { userId }
      })

      // Удаляем статусы аниме пользователя
      await tx.userAnimeStatus.deleteMany({
        where: { userId }
      })

      // Удаляем попытки входа
      await tx.loginAttempt.deleteMany({
        where: { username: (await tx.user.findUnique({ where: { id: userId }, select: { username: true } }))?.username }
      })

      // Удаляем самого пользователя
      await tx.user.delete({
        where: { id: userId }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
