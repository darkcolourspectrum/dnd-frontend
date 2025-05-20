import React from "react";
import PlayerToken from "./PlayerToken";

interface GameBoardProps {
  players: Record<string, { x: number; y: number }>;
}

const GameBoard: React.FC<GameBoardProps> = ({ players }) => {
  return (
    <div className="game-board" style={{ 
      position: "relative", 
      width: "800px", 
      height: "600px", 
      backgroundColor: "#f0f0f0",
      border: "2px solid #333"
    }}>
      {Object.entries(players).map(([userId, position]) => (
        <PlayerToken 
          key={userId}
          x={position.x * 50} 
          y={position.y * 50}
          label={`Player ${userId}`}
        />
      ))}
    </div>
  );
};

export default GameBoard;