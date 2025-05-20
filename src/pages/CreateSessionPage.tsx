import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGameSession } from '../api/gameSessions'
import { useAuth } from '../contexts/AuthContext';

const CreateSessionPage = () => {
  const [maxPlayers, setMaxPlayers] = useState(4);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleCreateSession = async () => {
    if (!token) return;
    try {
      const session = await createGameSession(maxPlayers, token);
      navigate(`/game/${session.id}`);
    } catch (error) {
      console.error('Ошибка создания сессии:', error);
    }
  };

  return (
    <div>
      <h2>Создать игровую сессию</h2>
      <div>
        <label>
          Макс. игроков:
          <input
            type="number"
            min="2"
            max="8"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
          />
        </label>
      </div>
      <button onClick={handleCreateSession}>Создать</button>
    </div>
  );
};

export default CreateSessionPage;