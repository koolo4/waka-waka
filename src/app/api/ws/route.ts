import { sendNotificationViaWebSocket } from '@/lib/socket-io-server';
import { NextResponse } from 'next/server';

// GET handler - это не реальный WebSocket, но нужен для Next.js
export async function GET(request: Request) {
  return NextResponse.json({
    message: 'WebSocket endpoint. Use Socket.IO client to connect.',
    status: 'ok'
  });
}

// POST handler для отправки уведомлений
export async function POST(request: Request) {
  try {
    const { userId, notification } = await request.json();

    if (!userId || !notification) {
      return NextResponse.json(
        { error: 'Missing userId or notification' },
        { status: 400 }
      );
    }

    // Отправляем через WebSocket если подключен
    sendNotificationViaWebSocket(userId, notification);

    return NextResponse.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('WebSocket POST error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
