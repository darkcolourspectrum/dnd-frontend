import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionDetails, joinGameSession, startGameSession } from '../../api/gameSessions';
import PlayerList from './PlayerList';
import CharacterSelect from './CharactersSelect';
import { useAuth } from '../../contexts/AuthContext';

const SessionLobby: React.FC = () => {
  const { sessionId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId || !token) return;
      
      try {
        setIsLoading(true);
        const data = await getSessionDetails(sessionId, token);
        setSession(data);
      } catch (err) {
        setError('Failed to load session');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSession();
    
    // Опционально: подписка на обновления через WebSocket
  }, [sessionId, token]);

  const handleJoin = async (characterId: number) => {
    if (!sessionId || !token) return;
    
    try {
      await joinGameSession(sessionId, characterId, token);
      // После успешного присоединения можно перенаправить в игру
      navigate(`/game/${sessionId}`);
    } catch (err) {
      setError('Failed to join session');
      console.error(err);
    }
  };

  const handleStartGame = async () => {
    if (!sessionId || !token) return;
    
    try {
      await startGameSession(sessionId, token);
      navigate(`/game/${sessionId}`);
    } catch (err) {
      setError('Failed to start game');
      console.error(err);
    }
  };

  if (isLoading) return <div>Loading session...</div>;
  if (!session) return <div>Session not found</div>;

  const isCreator = session.creator_id === parseInt(localStorage.getItem('userId') || '0');

  return (
    <div className="session-lobby">
      <h2>Session: {sessionId}</h2>
      <p>Status: {session.status}</p>
      
      {error && <div className="error">{error}</div>}
      
      <PlayerList 
        players={session.players} 
        currentUserId={parseInt(localStorage.getItem('userId') || '0')}
      />
      
      {session.status === 'waiting' && (
        <CharacterSelect 
          selectedCharacter={selectedCharacter}
          onSelect={setSelectedCharacter}
          onJoin={handleJoin}
        />
      )}
      
      {isCreator && session.status === 'waiting' && (
        <button 
          onClick={handleStartGame}
          disabled={session.players.length < 2}
        >
          Start Game
        </button>
      )}
      
      {session.status === 'active' && (
        <button onClick={() => navigate(`/game/${sessionId}`)}>
          Enter Game
        </button>
      )}
    </div>
  );
};

export default SessionLobby;