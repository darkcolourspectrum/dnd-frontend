import React, { useEffect, useState } from "react";
import GameBoard from "../components/GameBoard/GameBoard";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { connectWebSocket } from "../api/websocket";

const GamePage = () => {
  const { sessionId } = useParams();
  const { token } = useAuth();
  const [players, setPlayers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!token || !sessionId) return;

    const socket = connectWebSocket(sessionId, token);

    socket.on("player_moved", (data) => {
      setPlayers(prev => ({
        ...prev,
        [data.user_id]: data.position
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, token]);

  return (
    <div>
      <h2>Игровая сессия: {sessionId}</h2>
      <GameBoard players={players} />
    </div>
  );
};

export default GamePage;