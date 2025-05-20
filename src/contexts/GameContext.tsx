import React, { createContext, useContext, useState } from 'react';

interface GameState {
  currentTurn: number | null;
  players: Record<number, { x: number; y: number }>;
  diceResult: number | null;
}

interface GameContextType {
  gameState: GameState;
  updatePosition: (userId: number, position: { x: number; y: number }) => void;
  setCurrentTurn: (userId: number) => void;
  setDiceResult: (result: number) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>({
    currentTurn: null,
    players: {},
    diceResult: null
  });

  const updatePosition = (userId: number, position: { x: number; y: number }) => {
    setGameState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [userId]: position
      }
    }));
  };

  const setCurrentTurn = (userId: number) => {
    setGameState(prev => ({ ...prev, currentTurn: userId }));
  };

  const setDiceResult = (result: number) => {
    setGameState(prev => ({ ...prev, diceResult: result }));
  };

  return (
    <GameContext.Provider 
      value={{ gameState, updatePosition, setCurrentTurn, setDiceResult }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};