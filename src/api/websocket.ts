import { API_CONFIG } from './config';

export class GameWebSocket {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private token: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(sessionId: string, token: string) {
    this.sessionId = sessionId;
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `ws://localhost:8000/gamesessions/${this.sessionId}/ws?token=${this.token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: any) {
    const handler = this.messageHandlers.get(data.type);
    if (handler) {
      handler(data);
    }

    // Общий обработчик для всех сообщений
    const generalHandler = this.messageHandlers.get('*');
    if (generalHandler) {
      generalHandler(data);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnect failed:', error);
        });
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
      const handler = this.messageHandlers.get('connection_failed');
      if (handler) {
        handler({ type: 'connection_failed' });
      }
    }
  }

  on(event: string, handler: (data: any) => void) {
    this.messageHandlers.set(event, handler);
  }

  off(event: string) {
    this.messageHandlers.delete(event);
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton для управления WebSocket подключениями
class WebSocketManager {
  private connections: Map<string, GameWebSocket> = new Map();

  connect(sessionId: string, token: string): GameWebSocket {
    const existingConnection = this.connections.get(sessionId);
    if (existingConnection) {
      existingConnection.disconnect();
    }

    const ws = new GameWebSocket(sessionId, token);
    this.connections.set(sessionId, ws);
    return ws;
  }

  disconnect(sessionId: string) {
    const connection = this.connections.get(sessionId);
    if (connection) {
      connection.disconnect();
      this.connections.delete(sessionId);
    }
  }

  disconnectAll() {
    this.connections.forEach(connection => connection.disconnect());
    this.connections.clear();
  }
}

export const wsManager = new WebSocketManager();

// Для обратной совместимости
export const connectWebSocket = (sessionId: string, token: string): GameWebSocket => {
  const ws = wsManager.connect(sessionId, token);
  lastCreatedSocket = ws; // Сохраняем ссылку для getSocket
  return ws;
};

export const disconnectWebSocket = (sessionId?: string) => {
  if (sessionId) {
    wsManager.disconnect(sessionId);
  } else {
    wsManager.disconnectAll();
  }
};

// Добавляем getSocket для обратной совместимости
let lastCreatedSocket: GameWebSocket | null = null;

export const getSocket = (): GameWebSocket => {
  if (!lastCreatedSocket) {
    throw new Error("No WebSocket connections available");
  }
  return lastCreatedSocket;
};