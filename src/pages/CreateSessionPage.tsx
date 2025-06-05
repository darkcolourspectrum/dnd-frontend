import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGameSession } from '../api/gameSessions';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_CONFIG } from '../api/config';

const CreateSessionPage: React.FC = () => {
  const [maxPlayers, setMaxPlayers] = useState(4);
  const { token, userId, login } = useAuth();
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!token) return;
    try {
      const session = await createGameSession({ 
        maxPlayers, 
        token 
      });
      
      // Проверяем, что userId существует в контексте аутентификации
      if (!userId) {
        console.error('User ID is missing. Fetching user data...');
        try {
          const userResponse = await axios.get(`${API_CONFIG.BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Устанавливаем userId в контексте
          login(token, userResponse.data.id);
        } catch (userError) {
          console.error('Failed to get user data:', userError);
        }
      }
      
      navigate(`/lobby/${session.id}`);
    } catch (error) {
      console.error('Session creation error:', error);
    }
  };

  return (
    <div className="create-session">
      <h2>Create New Session</h2>
      <div>
        <label>
          Max Players:
          <input
            type="number"
            min="2"
            max="8"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
          />
        </label>
      </div>
      <button onClick={handleCreate}>Create Session</button>
    </div>
  );
};

export default CreateSessionPage;