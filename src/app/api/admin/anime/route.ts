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

export async function GET() {
  try {
    const admin = await checkAdminAccess()
    if (!admin) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const anime = await prisma.anime.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(anime)
  } catch (error) {
    console.error('Ошибка получения списка аниме:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdminAccess()
    if (!admin) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, genre, year, studio, imageUrl } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Название аниме обязательно' },
        { status: 400 }
      )
    }

    // Проверяем, не существует ли уже аниме с таким названием
    const existingAnime = await prisma.anime.findFirst({
      where: { title: title.trim() }
    })

    if (existingAnime) {
      return NextResponse.json(
        { error: 'Аниме с таким названием уже существует' },
        { status: 400 }
      )
    }

    const newAnime = await prisma.anime.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        genre: genre?.trim() || null,
        year: year || null,
        studio: studio?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        createdBy: admin.id
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

    return NextResponse.json(newAnime, { status: 201 })
  } catch (error) {
    console.error('Ошибка создания аниме:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
