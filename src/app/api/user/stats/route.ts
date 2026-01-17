import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    
    // Получаем существующие stats или создаем новые
    let userStats = await prisma.userStats.findUnique({
      where: { userId }
    })

    if (!userStats) {
      userStats = await prisma.userStats.create({
        data: {
          userId,
          ratingsCount: 0,
          commentsCount: 0,
          animesViewed: 0,
          friendsCount: 0,
          activityScore: 0
        }
      })
    }

    return NextResponse.json(userStats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    const body = await req.json()

    // Валидация данных
    const { ratingsCount, commentsCount, animesViewed, friendsCount, activityScore } = body

    if (
      typeof ratingsCount !== 'undefined' && typeof ratingsCount !== 'number' ||
      typeof commentsCount !== 'undefined' && typeof commentsCount !== 'number' ||
      typeof animesViewed !== 'undefined' && typeof animesViewed !== 'number' ||
      typeof friendsCount !== 'undefined' && typeof friendsCount !== 'number' ||
      typeof activityScore !== 'undefined' && typeof activityScore !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Invalid data types' },
        { status: 400 }
      )
    }

    const updateData: Record<string, number> = {}
    if (typeof ratingsCount === 'number') updateData.ratingsCount = Math.max(0, ratingsCount)
    if (typeof commentsCount === 'number') updateData.commentsCount = Math.max(0, commentsCount)
    if (typeof animesViewed === 'number') updateData.animesViewed = Math.max(0, animesViewed)
    if (typeof friendsCount === 'number') updateData.friendsCount = Math.max(0, friendsCount)
    if (typeof activityScore === 'number') updateData.activityScore = Math.max(0, activityScore)

    const updatedStats = await prisma.userStats.update({
      where: { userId },
      data: updateData
    })

    return NextResponse.json(updatedStats)
  } catch (error) {
    console.error('Error updating user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Increment specific stat
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    const body = await req.json()
    const { stat, increment = 1 } = body

    if (!['ratingsCount', 'commentsCount', 'animesViewed', 'friendsCount', 'activityScore'].includes(stat)) {
      return NextResponse.json(
        { error: 'Invalid stat name' },
        { status: 400 }
      )
    }

    // Получаем текущие stats
    let userStats = await prisma.userStats.findUnique({
      where: { userId }
    })

    if (!userStats) {
      userStats = await prisma.userStats.create({
        data: {
          userId,
          ratingsCount: 0,
          commentsCount: 0,
          animesViewed: 0,
          friendsCount: 0,
          activityScore: 0
        }
      })
    }

    // Обновляем конкретный stat
    const updateData: Record<string, number> = {}
    const currentValue = userStats[stat as keyof typeof userStats] as number
    updateData[stat] = Math.max(0, currentValue + increment)

    const updatedStats = await prisma.userStats.update({
      where: { userId },
      data: updateData
    })

    return NextResponse.json(updatedStats)
  } catch (error) {
    console.error('Error incrementing user stat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
