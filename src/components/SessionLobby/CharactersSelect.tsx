import React from 'react';
import { Character } from '../../types/gameTypes';

interface CharacterSelectProps {
  characters: Character[];
  selectedCharacter: number | null;
  onSelect: (characterId: number) => void;
  disabled?: boolean;
  onJoin?: () => void;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ 
  characters, 
  selectedCharacter, 
  onSelect, 
  disabled 
}) => {
  return (
    <div className="character-select">
      <h3>Select Your Character</h3>
      <div className="character-list">
        {characters.map(character => (
          <div
            key={character.id}
            className={`character-card ${selectedCharacter === character.id ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onSelect(character.id)}
          >
            <h4>{character.name}</h4>
            <p>Class: {character.class}</p>
            <p>Race: {character.race}</p>
            <div className="character-stats">
              <span>STR: {character.strength}</span>
              <span>DEX: {character.dexterity}</span>
              <span>INT: {character.intelligence}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelect;