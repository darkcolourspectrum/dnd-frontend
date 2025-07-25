export interface Character {
  id: number;
  name: string;
  race: string;
  class: string;
  strength: number;
  dexterity: number;
  intelligence: number;
  level?: number; // Добавляем опциональное поле level
  experience?: number; // Добавляем опциональное поле experience
}

export interface GameSession {
  id: string;
  creator_id: number;
  status: 'waiting' | 'active' | 'finished';
  max_players: number;
  players: SessionPlayer[];
  created_at?: string; // Добавляем опциональное поле created_at
}

export interface SessionPlayer {
  id: number;
  user_id: number;
  character_id: number | null;
  is_ready: boolean; 
  is_gm: boolean;
}

export interface DiceRollResult {
  total: number;
  rolls: number[];
  formula: string;
  dice_type: string;
}

export interface GameState {
  currentTurn: number | null;
  players: Record<number, PlayerPosition>;
  diceResult: number | null;
}

export interface PlayerPosition {
  x: number;
  y: number;
}