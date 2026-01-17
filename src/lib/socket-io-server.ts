import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

// Store connected users for real-time updates
const connectedUsers = new Map<number, string>(); // userId -> socketId

// Initialize Socket.IO server (singleton pattern)
let ioInstance: SocketIOServer | null = null;

export function getIO(): SocketIOServer {
  if (ioInstance) {
    return ioInstance;
  }
  throw new Error('Socket.IO not initialized');
}

export function initializeSocket(httpServer: HTTPServer) {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  ioInstance.on('connection', (socket) => {
    console.log(`✓ Socket connected: ${socket.id}`);

    // Пользователь подключился
    socket.on('user:identify', (userId: number) => {
      connectedUsers.set(userId, socket.id);
      console.log(`✓ User ${userId} identified via socket ${socket.id}`);

      // Отправляем событие в остальным клиентам
      socket.broadcast.emit('user:online', { userId, socketId: socket.id });
    });

    // Слушаем новые уведомления и транслируем их
    socket.on('notification:send', (data: {
      userId: number;
      type: string;
      title: string;
      message: string;
      relatedId?: number;
    }) => {
      const targetSocketId = connectedUsers.get(data.userId);
      if (targetSocketId) {
        ioInstance?.to(targetSocketId).emit('notification:new', {
          notification: data,
          timestamp: new Date().toISOString()
        });
        console.log(`✓ Notification sent to user ${data.userId}`);
      }
    });

    // Слушаем отмену уведомления
    socket.on('notification:mark-read', (data: {
      userId: number;
      notificationId: number;
    }) => {
      const targetSocketId = connectedUsers.get(data.userId);
      if (targetSocketId) {
        ioInstance?.to(targetSocketId).emit('notification:read', {
          notificationId: data.notificationId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Пользователь отключился
    socket.on('disconnect', () => {
      // Найдем userId этого сокета и удалим его
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`✓ User ${userId} disconnected`);
          socket.broadcast.emit('user:offline', { userId });
          break;
        }
      }
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });

    // Обработка ошибок
    socket.on('error', (error) => {
      console.error(`⚠️ Socket error for ${socket.id}:`, error);
    });
  });

  return ioInstance;
}

// Функция для отправки уведомления через WebSocket
export function sendNotificationViaWebSocket(userId: number, notification: {
  id: number;
  type: string;
  title: string;
  message: string;
  read?: boolean;
  relatedId?: number | null;
  createdAt: string;
}) {
  if (!ioInstance) return;

  const targetSocketId = connectedUsers.get(userId);
  if (targetSocketId) {
    ioInstance.to(targetSocketId).emit('notification:new', {
      data: { notification },
      type: 'notification:new',
      userId,
      timestamp: new Date().toISOString()
    });
  }
}

// Функция для получения всех подключенных пользователей
export function getConnectedUsers() {
  return Array.from(connectedUsers.entries()).map(([userId, socketId]) => ({
    userId,
    socketId
  }));
}

// Функция для проверки, подключен ли пользователь
export function isUserConnected(userId: number): boolean {
  return connectedUsers.has(userId);
}
