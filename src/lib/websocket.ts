/**
 * WebSocket Event Types for Real-Time Features
 */

export type WebSocketEventType =
  | "message:new"
  | "message:read"
  | "notification:new"
  | "notification:read"
  | "achievement:unlocked"
  | "streak:updated"
  | "user:online"
  | "user:offline"
  | "typing:start"
  | "typing:end";

export interface WebSocketMessage {
  type: WebSocketEventType;
  userId: number;
  data: Record<string, any>;
  timestamp: string;
}

/**
 * WebSocket Event Manager
 * Handles broadcasting events to connected clients
 */
class WebSocketEventManager {
  private subscribers: Map<
    string,
    Set<(message: WebSocketMessage) => void>
  > = new Map();

  /**
   * Subscribe to a specific event type
   */
  subscribe(
    eventType: WebSocketEventType,
    callback: (message: WebSocketMessage) => void
  ): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    const callbacks = this.subscribers.get(eventType)!;
    callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
    };
  }

  /**
   * Publish an event to all subscribers
   */
  publish(message: WebSocketMessage): void {
    const callbacks = this.subscribers.get(message.type);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          console.error("Error in WebSocket callback:", error);
        }
      });
    }
  }

  /**
   * Clear all subscribers
   */
  clear(): void {
    this.subscribers.clear();
  }
}

export const wsEventManager = new WebSocketEventManager();

/**
 * Create a WebSocket message
 */
export function createWSMessage(
  type: WebSocketEventType,
  userId: number,
  data: Record<string, any>
): WebSocketMessage {
  return {
    type,
    userId,
    data,
    timestamp: new Date().toISOString(),
  };
}
