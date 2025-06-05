import { useEffect } from 'react';
import { io, Socket } from "socket.io-client";
import { API_CONFIG } from './config';

let socket: Socket;

export const connectWebSocket = (sessionId: string, token: string): Socket => {
  socket = io(`${API_CONFIG.WS_URL}`, {
    path: `/gamesessions/${sessionId}/ws`,
    query: { token },
    transports: ["websocket"]
  });
  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) throw new Error("WebSocket not connected");
  return socket;
};

export const disconnectWebSocket = (): void => {
  if (socket) socket.disconnect();
};

export const useWebSocket = (event: string, callback: (data: any) => void) => {
  useEffect(() => {
    const socket = getSocket();
    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);
};