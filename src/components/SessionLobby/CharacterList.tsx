import React, { useEffect, useState } from 'react';
import { getCharacters } from '../../api/characters';
import { useAuth } from '../../contexts/AuthContext';

interface CharacterSelectProps {
  selectedCharacter: number | null;
  onSelect: (id: number) => void;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ 
  selectedCharacter, 
  onSelect 
}) => {
  const [characters, setCharacters] = useState<any[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCharacters = async () => {
      if (!token) return;
      const data = await getCharacters(token);
      setCharacters(data);
    };
    fetchCharacters();
  }, [token]);

  return (
    <div className="character-select">
      <h3>Выберите персонажа:</h3>
      <select
        value={selectedCharacter || ''}
        onChange={(e) => onSelect(Number(e.target.value))}
      >
        <option value="">-- Не выбран --</option>
        {characters.map(char => (
          <option key={char.id} value={char.id}>
            {char.name} ({char.race} {char.class})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CharacterSelect;