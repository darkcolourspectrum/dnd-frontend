import { useEffect } from 'react';
import { getSocket } from '../api/websocket';

export const useWebSocket = (event: string, callback: (data: any) => void) => {
  useEffect(() => {
    const socket = getSocket();
    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);
};