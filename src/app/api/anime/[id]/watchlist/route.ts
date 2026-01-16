import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const animeId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    const status = await prisma.userAnimeStatus.findFirst({
      where: { userId, animeId }
    })

    return NextResponse.json(status || { status: null })
  } catch (error) {
    console.error('Failed to fetch status:', error)
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const animeId = parseInt(params.id)
    const userId = parseInt(session.user.id)
    const { status } = await request.json()

    if (!['PLANNED', 'WATCHING', 'COMPLETED', 'DROPPED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const result = await prisma.userAnimeStatus.upsert({
      where: {
        userId_animeId: { userId, animeId }
      },
      update: { status },
      create: { userId, animeId, status }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to update status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const animeId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    await prisma.userAnimeStatus.deleteMany({
      where: { userId, animeId }
    })

    return NextResponse.json({ message: 'Status deleted' })
  } catch (error) {
    console.error('Failed to delete status:', error)
    return NextResponse.json({ error: 'Failed to delete status' }, { status: 500 })
  }
}
