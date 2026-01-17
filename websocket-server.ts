import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PORT = process.env.WEBSOCKET_PORT || 3001;

const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Track connected users
const connectedUsers = new Map<number, string>();

io.on("connection", (socket) => {
  console.log(`✓ Socket connected: ${socket.id}`);

  // User joins
  socket.on("user:join", (userId: number) => {
    connectedUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    console.log(`📍 User ${userId} joined room user:${userId}`);
  });

  // Achievement unlocked
  socket.on("achievement:unlocked", async (data: { userId: number; achievementId: number }) => {
    const { userId, achievementId } = data;

    try {
      const achievement = await prisma.achievement.findUnique({
        where: { id: achievementId },
      });

      if (achievement) {
        io.to(`user:${userId}`).emit("notification:new", {
          type: "achievement",
          title: `🏆 Achievement Unlocked!`,
          message: `You unlocked: ${achievement.name}`,
          icon: achievement.icon,
          timestamp: new Date().toISOString(),
        });
        console.log(`🏆 Achievement ${achievementId} unlocked for user ${userId}`);
      }
    } catch (error) {
      console.error("Error processing achievement:", error);
    }
  });

  // Streak updated
  socket.on("streak:updated", async (data: { userId: number; currentStreak: number }) => {
    const { userId, currentStreak } = data;

    io.to(`user:${userId}`).emit("notification:new", {
      type: "streak",
      title: `🔥 Streak Updated!`,
      message: `Your streak is now ${currentStreak} days!`,
      icon: "🔥",
      timestamp: new Date().toISOString(),
    });
    console.log(`🔥 Streak updated for user ${userId}: ${currentStreak}`);
  });

  // New message
  socket.on("message:new", async (data: { senderId: number; recipientId: number; message: string }) => {
    const { senderId, recipientId, message } = data;

    io.to(`user:${recipientId}`).emit("notification:new", {
      type: "message",
      title: `💬 New Message`,
      message: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
      icon: "💬",
      timestamp: new Date().toISOString(),
      senderId,
    });
    console.log(`💬 Message from user ${senderId} to user ${recipientId}`);
  });

  // Friend request
  socket.on("friend:request", async (data: { senderId: number; recipientId: number }) => {
    const { senderId, recipientId } = data;

    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { username: true },
    });

    io.to(`user:${recipientId}`).emit("notification:new", {
      type: "friend",
      title: `👥 Friend Request`,
      message: `${sender?.username} sent you a friend request`,
      icon: "👥",
      timestamp: new Date().toISOString(),
      senderId,
    });
    console.log(`👥 Friend request from ${senderId} to ${recipientId}`);
  });

  // Broadcast to all users (admin feature)
  socket.on("broadcast:notification", (data: { message: string; type: string }) => {
    io.emit("notification:broadcast", {
      type: data.type,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
    console.log(`📢 Broadcast: ${data.message}`);
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });

  // Error handling
  socket.on("error", (error) => {
    console.error(`⚠️ Socket error: ${error}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   WebSocket Server (Socket.io)        ║
║   Running on: ws://localhost:${PORT}    ║
║   CORS: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}
╚═══════════════════════════════════════╝
  `);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  httpServer.close(() => {
    prisma.$disconnect();
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  httpServer.close(() => {
    prisma.$disconnect();
    process.exit(0);
  });
});
