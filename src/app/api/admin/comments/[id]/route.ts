import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Нет прав доступа' }, { status: 403 })
    }

    const { id } = await params
    const commentId = parseInt(id)

    // Удаляем комментарий и связанные лайки
    await prisma.$transaction(async (tx) => {
      // Удаляем лайки комментария
      await tx.commentLike.deleteMany({
        where: { commentId }
      })

      // Удаляем сам комментарий
      await tx.comment.delete({
        where: { id: commentId }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка удаления комментария:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
