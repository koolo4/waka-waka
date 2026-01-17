import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;
    const userIdNum = parseInt(userId, 10);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'addedAt';
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.id !== userIdNum) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Получаем фильтр по статусу
    const whereCondition: any = {
      userId: user.id
    };

    if (status) {
      whereCondition.status = status;
    }

    // Получаем список с сортировкой
    const userAnimeStatuses = await prisma.userAnimeStatus.findMany({
      where: whereCondition,
      include: {
        anime: {
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
                overallRating: true
              }
            },
            _count: {
              select: {
                comments: true,
                ratings: true
              }
            }
          }
        }
      },
      orderBy: {
        [sort === 'rating' ? 'rating' : sort === 'progress' ? 'watchPercentage' : 'createdAt']: order as any
      },
      take: limit,
      skip: skip
    });

    // Подсчитываем статистику по каждому статусу
    const stats = await prisma.userAnimeStatus.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: true
    });

    const statsMap = stats.reduce((acc: any, s: any) => {
      acc[s.status] = s._count;
      return acc;
    }, {});

    // Получаем общее количество
    const total = await prisma.userAnimeStatus.count({
      where: whereCondition
    });

    return NextResponse.json({
      data: userAnimeStatuses,
      stats: statsMap,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching user anime lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user anime lists' },
      { status: 500 }
    );
  }
}
