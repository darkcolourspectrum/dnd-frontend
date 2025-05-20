import React from 'react';

interface Player {
  id: number;
  user_id: number;
  character_id: number | null;
  is_gm: boolean;
  is_ready: boolean;
  user?: {
    nickname: string;
  };
}

interface PlayerListProps {
  players: Player[];
  currentUserId: number;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentUserId }) => {
  return (
    <div className="player-list">
      <h3>Players:</h3>
      <ul>
        {players.map(player => (
          <li key={player.id} className={player.user_id === currentUserId ? 'current-user' : ''}>
            {player.user?.nickname || `Player ${player.user_id}`}
            {player.is_gm && ' (GM)'}
            {player.character_id && ` - Character #${player.character_id}`}
            {player.is_ready && ' - Ready'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;