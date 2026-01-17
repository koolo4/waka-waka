import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')?.toLowerCase() || ''

    // Получаем всех пользователей кроме текущего
    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
        ...(search && {
          OR: [
            { username: { contains: search } },
            { email: { contains: search } }
          ]
        })
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            ratings: true,
            comments: true
          }
        }
      },
      take: 50
    })

    // Для каждого пользователя получаем статус дружбы
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const friendStatus = await prisma.friend.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: user.id },
              { senderId: user.id, receiverId: userId }
            ]
          },
          select: { status: true, senderId: true }
        })

        return {
          ...user,
          friendStatus
        }
      })
    )

    return NextResponse.json(usersWithStatus)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
