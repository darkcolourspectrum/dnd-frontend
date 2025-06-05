import React from 'react';
import { SessionPlayer, Character } from '../../types/gameTypes';

interface PlayerListProps {
  players: SessionPlayer[];
  currentUserId: number | null; 
  characters: Character[]; 
}

const PlayerList: React.FC<PlayerListProps> = ({ 
  players, 
  currentUserId, 
  characters 
}) => {
  const getCharacterName = (characterId: number | null) => {
    if (!characterId) return 'No character selected';
    const character = characters.find(c => c.id === characterId);
    return character ? character.name : 'Unknown character';
  };

  return (
    <div className="player-list">
      <h3>Players in Session</h3>
      <ul>
        {players.map(player => (
          <li 
            key={player.id} 
            className={`player-item ${player.user_id === currentUserId ? 'current' : ''}`}
          >
            <div className="player-info">
              <span className="player-name">Player {player.user_id}</span>
              <span className={`status ${player.is_ready ? 'ready' : 'not-ready'}`}>
                {player.is_ready ? 'Ready' : 'Not Ready'}
              </span>
            </div>
            <div className="character-info">
              {getCharacterName(player.character_id)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;