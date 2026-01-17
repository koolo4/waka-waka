# WebSocket Server (Socket.io)

Real-time communication server for waka-waka platform using Socket.io.

## 🚀 Quick Start

### Run Development Servers

Run both Next.js and WebSocket servers simultaneously:

```bash
npm run dev:all
```

Or run them separately:

```bash
# Terminal 1: Next.js server (port 3000)
npm run dev

# Terminal 2: WebSocket server (port 3001)
npm run dev:ws
```

### Environment

The WebSocket server will automatically connect to:
- **Server**: `ws://localhost:3001`
- **CORS Origin**: `http://localhost:3000` (configurable via `NEXTAUTH_URL`)

## 📡 Events Reference

### Client → Server Events

#### `user:join`
User connects and joins their personal room.

```typescript
socket.emit("user:join", userId: number);
```

#### `achievement:unlocked`
Notify about achievement unlock.

```typescript
socket.emit("achievement:unlocked", {
  userId: number,
  achievementId: number
});
```

#### `streak:updated`
Notify about streak update.

```typescript
socket.emit("streak:updated", {
  userId: number,
  currentStreak: number
});
```

#### `message:new`
Notify about new message.

```typescript
socket.emit("message:new", {
  senderId: number,
  recipientId: number,
  message: string
});
```

#### `friend:request`
Notify about friend request.

```typescript
socket.emit("friend:request", {
  senderId: number,
  recipientId: number
});
```

#### `broadcast:notification`
Send notification to all users (admin).

```typescript
socket.emit("broadcast:notification", {
  message: string,
  type: string
});
```

### Server → Client Events

#### `notification:new`
Receive real-time notification.

```typescript
socket.on("notification:new", (data) => {
  // {
  //   type: "achievement" | "streak" | "message" | "friend" | "system",
  //   title: string,
  //   message: string,
  //   icon: string,
  //   timestamp: string,
  //   senderId?: number
  // }
});
```

#### `notification:broadcast`
Receive broadcast notification.

```typescript
socket.on("notification:broadcast", (data) => {
  // { type: string, message: string, timestamp: string }
});
```

## 🔌 Usage in React Components

```typescript
import { useSocketIO } from "@/hooks/useSocketIO";

export function MyComponent() {
  const { connected, emit, on } = useSocketIO();

  useEffect(() => {
    // Listen for notifications
    const unsubscribe = on("notification:new", (data) => {
      console.log("Got notification:", data);
    });

    return unsubscribe;
  }, [on]);

  function handleClick() {
    // Emit event
    emit("achievement:unlocked", {
      userId: 1,
      achievementId: 5
    });
  }

  return (
    <div>
      {connected ? "🟢 Connected" : "🔴 Connecting..."}
      <button onClick={handleClick}>Unlock Achievement</button>
    </div>
  );
}
```

## 📝 Implementation Details

### Architecture

- **Server**: Node.js + Socket.io HTTP server (port 3001)
- **Client Hook**: `useSocketIO` - Manages connection and event handling
- **Auto-Reconnection**: Exponential backoff with max 10 attempts
- **CORS**: Configured for development environment

### Rooms

Users automatically join personal rooms on connection:

```
user:{userId}  - Personal notification room
```

To send notifications to a user:

```typescript
io.to(`user:${userId}`).emit("notification:new", data);
```

## 🔒 Security Notes

1. **Authentication**: Currently no auth validation. Add in production.
2. **Rate Limiting**: Implement to prevent spam.
3. **Message Validation**: Validate all incoming data.
4. **CORS**: Configure for production domain.

Example auth middleware:

```typescript
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify token and validate user
  if (!isValidToken(token)) {
    return next(new Error("Authentication error"));
  }
  next();
});
```

## 🛠 Production Deployment

### Build

Build the WebSocket server for production:

```bash
npm run build
```

### Run Production

```bash
npm run start:ws
```

Set environment variables:

```bash
WEBSOCKET_PORT=3001
NEXTAUTH_URL=https://yourdomain.com
```

### Docker Example

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY websocket-server.ts ./
COPY prisma ./prisma/

CMD ["npm", "run", "start:ws"]
```

## 📊 Monitoring

Monitor WebSocket connections:

```typescript
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  console.log(`Total connections: ${io.engine.clientsCount}`);
});
```

Get connection statistics:

```typescript
const sockets = await io.fetchSockets();
console.log(`Connected clients: ${sockets.length}`);
```

## 🐛 Troubleshooting

### Connection Refused

Make sure WebSocket server is running:

```bash
npm run dev:ws
```

### CORS Errors

Check `NEXTAUTH_URL` environment variable. Default is `http://localhost:3000`.

### Port Already in Use

Change port:

```bash
WEBSOCKET_PORT=3002 npm run dev:ws
```

### Events Not Received

1. Check that user joined their room: `socket.on("user:join", ...)`
2. Verify client is listening: `socket.on("notification:new", ...)`
3. Check console for errors

## 📚 References

- [Socket.io Documentation](https://socket.io/docs/)
- [Socket.io Rooms](https://socket.io/docs/v4/rooms/)
- [Socket.io Namespaces](https://socket.io/docs/v4/namespaces/)

## 🎯 Next Steps

- [ ] Add authentication middleware
- [ ] Implement rate limiting
- [ ] Add message persistence
- [ ] Set up monitoring/logging
- [ ] Add unit tests
- [ ] Deploy to production
