import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getSessionById, 
  getSessionPlayers, 
  toggleReadyStatus,
  startSession
} from '../../api/gameSessions';
import { getCharacters } from '../../api/characters';
import { connectWebSocket, getSocket, disconnectWebSocket } from '../../api/websocket';
import CharacterSelect from './CharactersSelect';
import PlayerList from './PlayerList';
import ReadySection from './ReadySection';
import { GameSession, SessionPlayer, Character } from '../../types/gameTypes';
import './SessionLobby.css';
import axios from 'axios';
import { API_CONFIG } from '../../api/config';

interface LobbyState {
  session: GameSession;
  players: SessionPlayer[];
  characters: Character[];
}

const SessionLobby: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { token, userId, login } = useAuth();
  const navigate = useNavigate();
  const [lobbyState, setLobbyState] = useState<LobbyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);

  // Добавим проверку валидности параметров
  const validateParams = useCallback(() => {
    console.log('Validating params:', { sessionId, token, userId });
    
    if (!sessionId) {
      setError('Session ID is missing');
      return false;
    }
    if (!token) {
      setError('Authentication token is missing');
      return false;
    }
    if (!userId) {
      // Если userId отсутствует, попробуем запросить данные пользователя
      if (token) {
        console.log('User ID is missing but token exists. Will try to fetch user data...');
        (async () => {
          try {
            const userResponse = await axios.get(`${API_CONFIG.BASE_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            login(token, userResponse.data.id);
            return true;
          } catch (err) {
            setError('Could not retrieve user information');
            return false;
          }
        })();
      } else {
        setError('User ID is missing');
        return false;
      }
    }
    return true;
  }, [sessionId, token, userId]);

  // Загрузка начальных данных
  const loadInitialData = useCallback(async () => {
    if (!validateParams()) {
      setLoading(false);
      return;
    }

    try {
      console.log('1. Fetching session data...');
      const session = await getSessionById(sessionId!, token!);
      console.log('Session data received:', session);
      
      if (!session) {
        throw new Error('Session not found');
      }

      console.log('2. Fetching players and characters...');
      const [players, characters] = await Promise.all([
        getSessionPlayers(sessionId!, token!),
        getCharacters(token!)
      ]);
      console.log('Players data received:', players);
      console.log('Characters data received:', characters);

      // Добавим валидацию данных
      if (!Array.isArray(players)) {
        throw new Error('Invalid players data');
      }
      if (!Array.isArray(characters)) {
        throw new Error('Invalid characters data');
      }

      setLobbyState({ session, players, characters });
      
      const player = players.find(p => p.user_id === userId);
      if (player?.character_id) {
        setSelectedCharacter(player.character_id);
      }

      console.log('3. Connecting WebSocket...');
      connectWebSocket(sessionId!, token!);
    } catch (err) {
      console.error('Error loading lobby data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load lobby data');
      setLobbyState(null);
      // При ошибке все равно завершаем загрузку
    } finally {
      console.log('Loading completed');
      setLoading(false);
    }
  }, [sessionId, token, userId, validateParams]);

  useEffect(() => {
    console.log('Component mounted or dependencies changed');
    loadInitialData();

    return () => {
      console.log('Component unmounted - cleaning up');
      disconnectWebSocket();
    };
  }, [loadInitialData]);

  // Обработчики WebSocket событий
  useEffect(() => {
    if (!lobbyState) {
      console.log('Skipping WebSocket setup - no lobby state');
      return;
    }

    console.log('Setting up WebSocket listeners');
    const socket = getSocket();
    
    const handlePlayerJoined = (newPlayer: SessionPlayer) => {
      console.log('WebSocket: Player joined:', newPlayer);
      setLobbyState(prev => prev ? {
        ...prev,
        players: [...prev.players, newPlayer]
      } : null);
    };

    const handlePlayerReady = (updatedPlayer: SessionPlayer) => {
      console.log('WebSocket: Player ready:', updatedPlayer);
      setLobbyState(prev => prev ? {
        ...prev,
        players: prev.players.map(p => 
          p.id === updatedPlayer.id ? updatedPlayer : p
        )
      } : null);
    };

    const handleGameStarted = () => {
      console.log('WebSocket: Game started');
      navigate(`/game/${sessionId}`);
    };

    socket.on('player_joined', handlePlayerJoined);
    socket.on('player_ready', handlePlayerReady);
    socket.on('game_started', handleGameStarted);

    return () => {
      console.log('Cleaning up WebSocket listeners');
      socket.off('player_joined', handlePlayerJoined);
      socket.off('player_ready', handlePlayerReady);
      socket.off('game_started', handleGameStarted);
    };
  }, [lobbyState, sessionId, navigate]);

  const handleReadyToggle = async () => {
    if (!token || !sessionId) {
      console.log('Cannot toggle ready - missing token or sessionId');
      return;
    }
    try {
      console.log('Toggling ready status...');
      await toggleReadyStatus(sessionId, token);
    } catch (err) {
      console.error('Error toggling ready status:', err);
      setError('Failed to update ready status');
    }
  };

  const handleCharacterSelect = async (characterId: number) => {
    if (!token || !sessionId || !userId) {
      console.log('Cannot select character - missing required data');
      return;
    }
    try {
      console.log('Selecting character:', characterId);
      setSelectedCharacter(characterId);
      // TODO: Добавить вызов API для выбора персонажа
    } catch (err) {
      console.error('Error selecting character:', err);
      setError('Failed to select character');
    }
  };

  const handleStartGame = async () => {
    if (!token || !sessionId) {
      console.log('Cannot start game - missing token or sessionId');
      return;
    }
    try {
      console.log('Starting game session...');
      await startSession(sessionId, token);
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game');
    }
  };

  // Рендер состояния
  console.log('Rendering component with state:', {
    loading,
    error,
    lobbyState: lobbyState ? 'exists' : 'null',
    selectedCharacter
  });

  if (loading) {
    return <div className="loading">Loading session data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!lobbyState) {
    return <div className="error">Failed to load lobby data</div>;
  }

  const currentPlayer = lobbyState.players.find(p => p.user_id === userId);
  const allPlayersReady = lobbyState.players.length > 0 && lobbyState.players.every(p => p.is_ready);
  const isCreator = lobbyState.session.creator_id === userId;

  return (
    <div className="lobby-container">
      <h2>Game Session: {lobbyState.session.id}</h2>
      <div className="session-status">Status: {lobbyState.session.status}</div>
      
      <div className="lobby-content">
        <CharacterSelect
          characters={lobbyState.characters}
          selectedCharacter={selectedCharacter}
          onSelect={handleCharacterSelect}
          disabled={currentPlayer?.is_ready}
        />
        
        <PlayerList 
          players={lobbyState.players} 
          currentUserId={userId}
          characters={lobbyState.characters}
        />
        
        <ReadySection
          isReady={currentPlayer?.is_ready || false}
          onToggleReady={handleReadyToggle}
          disabled={!selectedCharacter}
        />
        
        {isCreator && (
          <button 
            onClick={handleStartGame}
            disabled={!allPlayersReady}
            className="start-button"
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  );
};

export default SessionLobby;