import React, { useEffect, useState } from 'react';
import { getCharacters } from '../../api/characters';
import { useAuth } from '../../contexts/AuthContext';

interface Character {
  id: number;
  name: string;
  race: string;
  class_: string;
}

interface CharacterSelectProps {
  selectedCharacter: number | null;
  onSelect: (id: number) => void;
  onJoin: (characterId: number) => void;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ 
  selectedCharacter, 
  onSelect,
  onJoin
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCharacters = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        const data = await getCharacters(token);
        setCharacters(data);
      } catch (error) {
        console.error('Error fetching characters:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCharacters();
  }, [token]);

  if (isLoading) return <div>Loading characters...</div>;

  return (
    <div className="character-select">
      <h3>Select your character:</h3>
      <select
        value={selectedCharacter || ''}
        onChange={(e) => onSelect(Number(e.target.value))}
        disabled={characters.length === 0}
      >
        <option value="">-- Select character --</option>
        {characters.map(char => (
          <option key={char.id} value={char.id}>
            {char.name} ({char.race} {char.class_})
          </option>
        ))}
      </select>
      
      <button 
        onClick={() => selectedCharacter && onJoin(selectedCharacter)}
        disabled={!selectedCharacter}
      >
        Join Session
      </button>
      
      {characters.length === 0 && (
        <p>No characters available. Create one first.</p>
      )}
    </div>
  );
};

export default CharacterSelect;