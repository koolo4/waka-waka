import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Проверка прав администратора
async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { id: true, role: true }
  })

  if (user?.role !== 'ADMIN') {
    return null
  }

  return user
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await checkAdminAccess()
    if (!admin) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const animeId = parseInt(id)
    if (isNaN(animeId)) {
      return NextResponse.json({ error: 'Неверный ID аниме' }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, genre, year, studio, imageUrl } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Название аниме обязательно' },
        { status: 400 }
      )
    }

    // Проверяем существование аниме
    const existingAnime = await prisma.anime.findUnique({
      where: { id: animeId }
    })

    if (!existingAnime) {
      return NextResponse.json({ error: 'Аниме не найдено' }, { status: 404 })
    }

    // Проверяем, не существует ли другое аниме с таким названием
    const duplicateAnime = await prisma.anime.findFirst({
      where: {
        title: title.trim(),
        id: { not: animeId }
      }
    })

    if (duplicateAnime) {
      return NextResponse.json(
        { error: 'Аниме с таким названием уже существует' },
        { status: 400 }
      )
    }

    const updatedAnime = await prisma.anime.update({
      where: { id: animeId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        genre: genre?.trim() || null,
        year: year || null,
        studio: studio?.trim() || null,
        imageUrl: imageUrl?.trim() || null
      },
      include: {
        creator: {
          select: { username: true }
        },
        _count: {
          select: {
            ratings: true,
            comments: true,
            userStatuses: true
          }
        }
      }
    })

    return NextResponse.json(updatedAnime)
  } catch (error) {
    console.error('Ошибка обновления аниме:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await checkAdminAccess()
    if (!admin) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const animeId = parseInt(id)
    if (isNaN(animeId)) {
      return NextResponse.json({ error: 'Неверный ID аниме' }, { status: 400 })
    }

    // Проверяем существование аниме
    const existingAnime = await prisma.anime.findUnique({
      where: { id: animeId },
      include: {
        _count: {
          select: {
            ratings: true,
            comments: true,
            userStatuses: true
          }
        }
      }
    })

    if (!existingAnime) {
      return NextResponse.json({ error: 'Аниме не найдено' }, { status: 404 })
    }

    // Удаляем связанные данные (каскадное удаление)
    await prisma.$transaction(async (tx) => {
      // Удаляем лайки комментариев для этого аниме
      await tx.commentLike.deleteMany({
        where: {
          comment: {
            animeId: animeId
          }
        }
      })

      // Удаляем комментарии
      await tx.comment.deleteMany({
        where: { animeId: animeId }
      })

      // Удаляем рейтинги
      await tx.rating.deleteMany({
        where: { animeId: animeId }
      })

      // Удаляем статусы пользователей
      await tx.userAnimeStatus.deleteMany({
        where: { animeId: animeId }
      })

      // Наконец, удаляем само аниме
      await tx.anime.delete({
        where: { id: animeId }
      })
    })

    return NextResponse.json({
      message: 'Аниме успешно удалено',
      deletedData: {
        anime: existingAnime.title,
        ratings: existingAnime._count.ratings,
        comments: existingAnime._count.comments,
        userStatuses: existingAnime._count.userStatuses
      }
    })
  } catch (error) {
    console.error('Ошибка удаления аниме:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
