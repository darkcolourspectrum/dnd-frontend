import { io, Socket } from "socket.io-client";

let socket: Socket;

export const connectWebSocket = (sessionId: string, token: string): Socket => {
  socket = io("https://rg55nfxi0i.loclx.io/", {
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