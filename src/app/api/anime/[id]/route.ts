import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid anime ID' },
        { status: 400 }
      )
    }

    const anime = await prisma.anime.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        ratings: {
          select: {
            id: true,
            overallRating: true,
            storyRating: true,
            artRating: true,
            charactersRating: true,
            soundRating: true
          }
        },
        comments: {
          select: {
            id: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            ratings: true,
            comments: true,
            userStatuses: true,
            recommendations: true
          }
        }
      }
    })

    if (!anime) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      )
    }

    // Вычислить среднюю оценку
    const avgRating = anime.ratings.length > 0
      ? anime.ratings.reduce((sum, r) => sum + r.overallRating, 0) / anime.ratings.length
      : 0

    return NextResponse.json({
      ...anime,
      averageRating: Math.round(avgRating * 10) / 10,
      stats: anime._count
    })
  } catch (error) {
    console.error('Error fetching anime:', error)
    return NextResponse.json(
      { error: 'Failed to fetch anime' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userSession = await getServerSession()
    if (!userSession?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid anime ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, description, genre, year, studio, imageUrl, trailerUrl, videoUrl } = body

    const anime = await prisma.anime.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(genre && { genre }),
        ...(year && { year }),
        ...(studio && { studio }),
        ...(imageUrl && { imageUrl }),
        ...(trailerUrl && { trailerUrl }),
        ...(videoUrl && { videoUrl })
      },
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

    return NextResponse.json(anime)
  } catch (error) {
    console.error('Error updating anime:', error)
    return NextResponse.json(
      { error: 'Failed to update anime' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userSession = await getServerSession()
    
    if (!userSession?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid anime ID' },
        { status: 400 }
      )
    }

    await prisma.anime.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting anime:', error)
    return NextResponse.json(
      { error: 'Failed to delete anime' },
      { status: 500 }
    )
  }
}
