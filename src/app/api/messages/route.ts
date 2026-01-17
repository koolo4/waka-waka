import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Получить все сообщения в диалоге
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const conversationId = req.nextUrl.searchParams.get('conversationId')
    const limit = Math.min(50, Number(req.nextUrl.searchParams.get('limit')) || 30)
    const offset = Number(req.nextUrl.searchParams.get('offset')) || 0

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    const userId = parseInt(session.user.id)

    // Проверяем, что пользователь участник диалога
    const conversation = await prisma.conversation.findUnique({
      where: { id: parseInt(conversationId) }
    })

    if (!conversation || 
        (conversation.participant1Id !== userId && conversation.participant2Id !== userId)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Получаем сообщения
    const messages = await prisma.message.findMany({
      where: { conversationId: parseInt(conversationId) },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        senderId: true,
        content: true,
        isRead: true,
        createdAt: true,
        sender: {
          select: { id: true, username: true, avatar: true }
        }
      }
    })

    // Отмечаем все сообщения текущего пользователя как прочитанные
    if (messages.length > 0) {
      await prisma.message.updateMany({
        where: {
          conversationId: parseInt(conversationId),
          recipientId: userId,
          isRead: false
        },
        data: { isRead: true }
      })
    }

    return NextResponse.json({
      messages: messages.reverse(),
      total: await prisma.message.count({
        where: { conversationId: parseInt(conversationId) }
      })
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Отправить сообщение
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
    const { conversationId, content } = body

    if (!conversationId || !content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'conversationId and content are required' },
        { status: 400 }
      )
    }

    // Проверяем, что пользователь участник диалога
    const conversation = await prisma.conversation.findUnique({
      where: { id: parseInt(conversationId) }
    })

    if (!conversation || 
        (conversation.participant1Id !== userId && conversation.participant2Id !== userId)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const recipientId = conversation.participant1Id === userId 
      ? conversation.participant2Id 
      : conversation.participant1Id

    // Создаем сообщение
    const message = await prisma.message.create({
      data: {
        senderId: userId,
        recipientId,
        conversationId: parseInt(conversationId),
        content: content.trim()
      },
      select: {
        id: true,
        senderId: true,
        content: true,
        isRead: true,
        createdAt: true,
        sender: {
          select: { id: true, username: true, avatar: true }
        }
      }
    })

    // Обновляем lastMessageAt в диалоге
    await prisma.conversation.update({
      where: { id: parseInt(conversationId) },
      data: { lastMessageAt: new Date() }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Отметить сообщение как прочитанное
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
    const { messageId } = body

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      )
    }

    // Проверяем, что пользователь получатель сообщения
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message || message.recipientId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Отмечаем как прочитанное
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
      select: {
        id: true,
        senderId: true,
        content: true,
        isRead: true,
        createdAt: true,
        sender: {
          select: { id: true, username: true, avatar: true }
        }
      }
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
