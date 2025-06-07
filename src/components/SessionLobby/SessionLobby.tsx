import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getSessionById, 
  getSessionPlayers, 
  toggleReadyStatus,
  startSession
} from '../../api/gameSessions';
import { getCharacters } from '../../api/characters';
import { GameWebSocket, connectWebSocket, disconnectWebSocket } from '../../api/websocket';
import { GameSession, SessionPlayer, Character } from '../../types/gameTypes';
import './SessionLobby.css';

interface LobbyState {
  session: GameSession;
  players: SessionPlayer[];
  characters: Character[];
}

const SessionLobby: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { token, userId } = useAuth();
  const navigate = useNavigate();
  
  const [lobbyState, setLobbyState] = useState<LobbyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  
  // Используем ref для хранения WebSocket соединения
  const wsRef = useRef<GameWebSocket | null>(null);

  // Вспомогательные функции для рас и классов
  const getRaceEmoji = (race: string) => {
    const raceEmojis: { [key: string]: string } = {
      human: '👤',
      elf: '🧝',
      dwarf: '🧙',
      orc: '👹'
    };
    return raceEmojis[race] || '👤';
  };

  const getClassEmoji = (className: string) => {
    const classEmojis: { [key: string]: string } = {
      warrior: '⚔️',
      mage: '🔮',
      rogue: '🗡️',
      cleric: '⚡'
    };
    return classEmojis[className] || '⚔️';
  };

  const getRaceName = (race: string) => {
    const raceNames: { [key: string]: string } = {
      human: 'Человек',
      elf: 'Эльф',
      dwarf: 'Гном',
      orc: 'Орк'
    };
    return raceNames[race] || race;
  };

  const getClassName = (className: string) => {
    const classNames: { [key: string]: string } = {
      warrior: 'Воин',
      mage: 'Маг',
      rogue: 'Плут',
      cleric: 'Жрец'
    };
    return classNames[className] || className;
  };

  // Валидация параметров
  const validateParams = useCallback(() => {
    if (!sessionId) {
      setError('ID сессии отсутствует');
      return false;
    }
    if (!token) {
      setError('Токен аутентификации отсутствует');
      return false;
    }
    if (!userId) {
      setError('ID пользователя отсутствует');
      return false;
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
      const [session, players, characters] = await Promise.all([
        getSessionById(sessionId!, token!),
        getSessionPlayers(sessionId!, token!),
        getCharacters(token!)
      ]);

      if (!session) {
        throw new Error('Сессия не найдена');
      }

      setLobbyState({ session, players, characters });
      
      const player = players.find(p => p.user_id === userId);
      if (player?.character_id) {
        setSelectedCharacter(player.character_id);
      }

      // Подключаем WebSocket
      if (sessionId && token) {
        try {
          const ws = connectWebSocket(sessionId, token);
          wsRef.current = ws;
          
          // Настраиваем обработчики
          ws.on('*', handleWebSocketMessage);
          await ws.connect();
        } catch (wsError) {
          console.error('WebSocket connection error:', wsError);
          // Продолжаем работу без WebSocket
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки данных лобби:', err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить данные лобби');
    } finally {
      setLoading(false);
    }
  }, [sessionId, token, userId, validateParams]);

  useEffect(() => {
    loadInitialData();
    return () => {
      console.log('Component unmounted - cleaning up');
      if (sessionId) {
        disconnectWebSocket(sessionId);
      }
    };
  }, [loadInitialData, sessionId]);

  // Обработчики WebSocket событий
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'player_joined':
        setLobbyState(prev => prev ? {
          ...prev,
          players: [...prev.players, data.data as SessionPlayer]
        } : null);
        break;

      case 'player_ready':
        setLobbyState(prev => prev ? {
          ...prev,
          players: prev.players.map(p => 
            p.id === data.data.id ? data.data : p
          )
        } : null);
        break;

      case 'game_started':
        navigate(`/game/${sessionId}`);
        break;

      default:
        console.log('Unhandled message:', data.type);
    }
  };

  const handleReadyToggle = async () => {
    if (!token || !sessionId) return;
    try {
      const updatedPlayer = await toggleReadyStatus(sessionId, token);
      // Обновляем локальное состояние
      setLobbyState(prev => prev ? {
        ...prev,
        players: prev.players.map(p => 
          p.user_id === userId ? updatedPlayer : p
        )
      } : null);
    } catch (err) {
      console.error('Ошибка изменения статуса готовности:', err);
      setError('Не удалось изменить статус готовности');
    }
  };

  const handleCharacterSelect = (characterId: number) => {
    setSelectedCharacter(characterId);
  };

  const handleStartGame = async () => {
    if (!token || !sessionId) return;
    try {
      await startSession(sessionId, token);
      navigate(`/game/${sessionId}`);
    } catch (err) {
      console.error('Ошибка начала игры:', err);
      setError('Не удалось начать игру');
    }
  };

  if (loading) {
    return (
      <div className="lobby-container">
        <div className="loading">Загрузка данных сессии...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lobby-container">
        <div className="error">Ошибка: {error}</div>
      </div>
    );
  }

  if (!lobbyState) {
    return (
      <div className="lobby-container">
        <div className="error">Не удалось загрузить данные лобби</div>
      </div>
    );
  }

  const currentPlayer = lobbyState.players.find(p => p.user_id === userId);
  const readyPlayers = lobbyState.players.filter(p => p.is_ready).length;
  const totalPlayers = lobbyState.players.length;
  const allPlayersReady = totalPlayers > 1 && lobbyState.players.every(p => p.is_ready);
  const isCreator = lobbyState.session.creator_id === userId;
  const readinessPercentage = totalPlayers > 0 ? (readyPlayers / totalPlayers) * 100 : 0;

  return (
    <div className="lobby-container">
      {/* Информация о сессии */}
      <div className="session-info-card">
        <div className="session-id">{lobbyState.session.id}</div>
        <div style={{ textAlign: 'center' }}>
          <span className={`session-status ${lobbyState.session.status}`}>
            {lobbyState.session.status === 'waiting' ? 'Ожидание игроков' : 'Активная'}
          </span>
        </div>
      </div>

      <div className="lobby-content">
        {/* Основной контент */}
        <div className="lobby-main">
          {/* Выбор персонажа */}
            <div className="character-selection">
              <h3>🎭 Выберите своего персонажа</h3>
              
              {/* Проверяем, является ли пользователь GM */}
              {currentPlayer?.is_gm ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  background: 'rgba(255, 215, 0, 0.2)',
                  borderRadius: '12px',
                  border: '2px solid #ffd700'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '20px' }}>👑</div>
                  <h4 style={{ color: '#ffd700', marginBottom: '15px' }}>
                    Вы - Game Master (Мастер игры)
                  </h4>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginBottom: '20px',
                    lineHeight: '1.6'
                  }}>
                    Как GM вы управляете игрой, рассказываете историю и контролируете NPC.<br/>
                    Вам не нужно создавать персонажа - вы управляете всем миром!
                  </p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginTop: '20px'
                  }}>
                    <div style={{ 
                      padding: '15px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }}>
                      <strong style={{ color: '#4facfe' }}>🎲 Управление игрой</strong>
                      <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                        Принимайте решения о результатах действий игроков
                      </p>
                    </div>
                    <div style={{ 
                      padding: '15px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }}>
                      <strong style={{ color: '#56ab2f' }}>🧙 Управление NPC</strong>
                      <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                        Создавайте и контролируйте неигровых персонажей
                      </p>
                    </div>
                    <div style={{ 
                      padding: '15px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }}>
                      <strong style={{ color: '#ff6b6b' }}>📖 Повествование</strong>
                      <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                        Рассказывайте историю и создавайте атмосферу
                      </p>
                    </div>
                  </div>
                </div>
              ) : lobbyState.characters.length === 0 ? (
                // Обычная логика для игроков без персонажей
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '20px' }}>
                    У вас пока нет персонажей
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/characters')}
                  >
                    ✨ Создать персонажа
                  </button>
                </div>
              ) : (
                // Обычная логика выбора персонажей для игроков
                <div className="character-grid">
                  {lobbyState.characters.map(character => (
                    <div
                      key={character.id}
                      className={`character-card ${
                        selectedCharacter === character.id ? 'selected' : ''
                      } ${currentPlayer?.is_ready ? 'disabled' : ''}`}
                      onClick={() => !currentPlayer?.is_ready && handleCharacterSelect(character.id)}
                    >
                      {/* Обычная карточка персонажа */}
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>

        {/* Боковая панель */}
        <div className="lobby-sidebar">
          {/* Список игроков */}
          <div className="players-section">
            <div className="players-header">
              <h3>👥 Игроки</h3>
              <div className="players-count">
                {totalPlayers}/{lobbyState.session.max_players}
              </div>
            </div>

            {/* Индикатор готовности */}
            <div className="readiness-indicator">
              <div className="readiness-bar">
                <div 
                  className="readiness-progress" 
                  style={{ width: `${readinessPercentage}%` }}
                />
              </div>
              <div className="readiness-text">
                Готово: {readyPlayers}/{totalPlayers}
              </div>
            </div>

            <div className="players-list">
              {lobbyState.players.map(player => {
                const character = lobbyState.characters.find(c => c.id === player.character_id);
                return (
                  <div 
                    key={player.id} 
                    className={`player-item ${
                      player.user_id === userId ? 'current' : ''
                    } ${player.is_gm ? 'gm' : ''}`}
                  >
                    <div className="player-header">
                      <div className="player-name">
                        👤 Игрок {player.user_id}
                        {player.is_gm && <span className="gm-badge">GM</span>}
                      </div>
                      <span className={`player-status status ${player.is_ready ? 'ready' : 'not-ready'}`}>
                        {player.is_ready ? 'Готов' : 'Не готов'}
                      </span>
                    </div>
                    <div className="player-character">
                      {character ? (
                        <>
                          {getRaceEmoji(character.race)} {character.name} 
                          ({getClassName(character.class)})
                        </>
                      ) : (
                        'Персонаж не выбран'
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Кнопка готовности */}
        <div className="ready-section">
          {currentPlayer?.is_gm ? (
            // GM всегда готов, показываем только информацию
            <div style={{ textAlign: 'center' }}>
              <div style={{
                padding: '15px',
                background: 'rgba(255, 215, 0, 0.2)',
                borderRadius: '12px',
                border: '2px solid #ffd700'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>👑</div>
                <div style={{ 
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: '#ffd700',
                  marginBottom: '8px'
                }}>
                  Game Master готов
                </div>
                <div style={{ 
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  Дождитесь готовности всех игроков
                </div>
              </div>
            </div>
          ) : (
            // Обычная логика для игроков
            <>
              <button
                className={`ready-button ${currentPlayer?.is_ready ? 'ready' : ''} ${
                  !selectedCharacter ? 'disabled' : ''
                }`}
                onClick={handleReadyToggle}
                disabled={!selectedCharacter}
              >
                {currentPlayer?.is_ready ? 'Отменить готовность' : 'Я готов!'}
              </button>
              
              {!selectedCharacter && (
                <div className="ready-hint">
                  Сначала выберите персонажа
                </div>
              )}
            </>
          )}
        </div>
            ) : (
              // Обычная логика для игроков
              <>
                <button
                  className={`ready-button ${currentPlayer?.is_ready ? 'ready' : ''} ${
                    !selectedCharacter ? 'disabled' : ''
                  }`}
                  onClick={handleReadyToggle}
                  disabled={!selectedCharacter}
                >
                  {currentPlayer?.is_ready ? '❌ Отменить готовность' : '✅ Я готов!'}
                </button>
                
                {!selectedCharacter && (
                  <div className="ready-hint">
                    Сначала выберите персонажа
                  </div>
                )}
              </>
            )}
          </div>

          {/* Кнопка начала игры для GM */}
          {isCreator && (
            <button
              className="start-button"
              onClick={handleStartGame}
              disabled={!allPlayersReady}
            >
              {allPlayersReady ? 'Начать игру!' : 'Ждем игроков...'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionLobby;