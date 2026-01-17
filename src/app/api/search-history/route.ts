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

    // Получаем последние 10 уникальных поисков
    const searches = await prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      distinct: ['query'],
      take: 10
    })

    return NextResponse.json(searches)
  } catch (error) {
    console.error('Failed to fetch search history:', error)
    return NextResponse.json({ error: 'Failed to fetch search history' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query } = await request.json()
    const userId = parseInt(session.user.id)

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Добавляем в историю поиска
    const entry = await prisma.searchHistory.create({
      data: {
        userId,
        query: query.trim()
      }
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Failed to save search:', error)
    return NextResponse.json({ error: 'Failed to save search' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)

    // Удаляем всю историю поиска
    await prisma.searchHistory.deleteMany({
      where: { userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to clear search history:', error)
    return NextResponse.json({ error: 'Failed to clear search history' }, { status: 500 })
  }
}
