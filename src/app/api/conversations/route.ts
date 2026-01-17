import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Получить все диалоги пользователя
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
    const limit = Math.min(50, Number(req.nextUrl.searchParams.get('limit')) || 50)
    const offset = Number(req.nextUrl.searchParams.get('offset')) || 0

    // Получаем все диалоги пользователя
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      },
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        participant1Id: true,
        participant2Id: true,
        lastMessageAt: true,
        createdAt: true,
        participant1: {
          select: { id: true, username: true, avatar: true }
        },
        participant2: {
          select: { id: true, username: true, avatar: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            senderId: true,
            isRead: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                recipientId: userId,
                isRead: false
              }
            }
          }
        }
      }
    })

    // Преобразуем результаты для удобства
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participant1Id === userId ? conv.participant2 : conv.participant1
      const lastMessage = conv.messages[0]

      return {
        id: conv.id,
        participant: otherParticipant,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          isRead: lastMessage.isRead,
          createdAt: lastMessage.createdAt
        } : null,
        unreadCount: conv._count.messages,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt
      }
    })

    return NextResponse.json({
      conversations: formattedConversations,
      total: await prisma.conversation.count({
        where: {
          OR: [
            { participant1Id: userId },
            { participant2Id: userId }
          ]
        }
      })
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Создать или получить диалог с пользователем
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
    const { participantId } = body

    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId is required' },
        { status: 400 }
      )
    }

    if (participantId === userId) {
      return NextResponse.json(
        { error: 'Cannot create conversation with yourself' },
        { status: 400 }
      )
    }

    // Проверяем, что участник существует
    const participant = await prisma.user.findUnique({
      where: { id: participantId }
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Ищем существующий диалог
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: userId, participant2Id: participantId },
          { participant1Id: participantId, participant2Id: userId }
        ]
      }
    })

    // Если диалога нет, создаем новый
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: userId,
          participant2Id: participantId
        }
      })
    }

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
