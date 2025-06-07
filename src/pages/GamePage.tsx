import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getSessionById } from "../api/gameSessions";
import { GameSession } from "../types/gameTypes";
import { GameWebSocket, connectWebSocket, disconnectWebSocket } from "../api/websocket";

interface PlayerPosition {
  x: number;
  y: number;
}

interface GameState {
  currentTurn: number | null;
  players: Record<number, PlayerPosition>;
  turnNumber: number;
  isMyTurn: boolean;
  diceResult: any | null;
  systemMessages: string[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'failed';
}

const GamePage = () => {
  const { sessionId } = useParams();
  const { token, userId } = useAuth();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<GameSession | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentTurn: null,
    players: {},
    turnNumber: 0,
    isMyTurn: false,
    diceResult: null,
    systemMessages: [],
    connectionStatus: 'connecting'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCell, setSelectedCell] = useState<{x: number, y: number} | null>(null);
  const [diceFormula, setDiceFormula] = useState('d20');
  
  const wsRef = useRef<GameWebSocket | null>(null);

  // Размеры игрового поля
  const GRID_SIZE = 40;
  const BOARD_WIDTH = 20;
  const BOARD_HEIGHT = 15;

  // Инициализация игрока на случайной позиции (ТОЛЬКО ДЛЯ НЕ-GM)
  useEffect(() => {
    if (userId && !gameState.players[userId] && session) {
      // Проверяем, является ли пользователь GM
      const isGM = session.players?.find(p => p.user_id === userId)?.is_gm;
      
      if (!isGM) {
        // Только обычные игроки появляются на поле
        const randomX = Math.floor(Math.random() * BOARD_WIDTH);
        const randomY = Math.floor(Math.random() * BOARD_HEIGHT);
        
        setGameState(prev => ({
          ...prev,
          players: {
            ...prev.players,
            [userId]: { x: randomX, y: randomY }
          }
        }));
      }
    }
  }, [userId, gameState.players, session]);

  // Подключение к WebSocket
  useEffect(() => {
    if (!sessionId || !token) return;

    const initWebSocket = async () => {
      try {
        setGameState(prev => ({ ...prev, connectionStatus: 'connecting' }));
        
        const ws = connectWebSocket(sessionId, token);
        wsRef.current = ws;

        // Настройка обработчиков событий
        ws.on('*', handleWebSocketMessage);
        ws.on('connection_failed', () => {
          setGameState(prev => ({ ...prev, connectionStatus: 'failed' }));
          addSystemMessage('Не удалось подключиться к серверу');
        });

        await ws.connect();
        setGameState(prev => ({ ...prev, connectionStatus: 'connected' }));
        addSystemMessage('Подключение к игре установлено');
        
      } catch (error) {
        console.error('WebSocket connection error:', error);
        setGameState(prev => ({ ...prev, connectionStatus: 'failed' }));
        addSystemMessage('Ошибка подключения к серверу');
      }
    };

    initWebSocket();

    return () => {
      if (sessionId) {
        disconnectWebSocket(sessionId);
      }
    };
  }, [sessionId, token]);

  // Загрузка данных сессии
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId || !token) return;
      
      try {
        const sessionData = await getSessionById(sessionId, token);
        if (!sessionData) {
          setError('Сессия не найдена');
          return;
        }
        setSession(sessionData);
        addSystemMessage(`Загружена сессия: ${sessionData.id}`);
      } catch (err) {
        console.error('Session loading error:', err);
        setError('Ошибка загрузки сессии');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, token]);

  // Обработка сообщений WebSocket
  const handleWebSocketMessage = (data: any) => {
    console.log('WebSocket message received:', data);
    
    switch (data.type) {
      case 'initial_state':
        if (data.data?.players) {
          const playersMap: Record<number, PlayerPosition> = {};
          data.data.players.forEach((player: any) => {
            playersMap[player.user_id] = player.position || { x: 0, y: 0 };
          });
          setGameState(prev => ({
            ...prev,
            players: { ...prev.players, ...playersMap }
          }));
          addSystemMessage('Состояние игры синхронизировано');
        }
        break;

      case 'player_moved':
        if (data.data?.user_id && data.data?.position) {
          setGameState(prev => ({
            ...prev,
            players: {
              ...prev.players,
              [data.data.user_id]: data.data.position
            }
          }));
          const playerName = data.data.user_id === userId ? 'Вы' : `Игрок ${data.data.user_id}`;
          addSystemMessage(`${playerName} переместился на (${data.data.position.x}, ${data.data.position.y})`);
        }
        break;

      case 'turn_ended':
        if (data.data) {
          setGameState(prev => ({
            ...prev,
            currentTurn: data.data.next_player_id,
            turnNumber: data.data.turn_number || prev.turnNumber + 1,
            isMyTurn: data.data.next_player_id === userId
          }));
          
          const currentPlayerName = data.data.current_player_id === userId ? 'Вы' : `Игрок ${data.data.current_player_id}`;
          const nextPlayerName = data.data.next_player_id === userId ? 'Вы' : `Игрок ${data.data.next_player_id}`;
          addSystemMessage(`${currentPlayerName} завершили ход. Следующий ход: ${nextPlayerName}`);
        }
        break;

      case 'dice_rolled':
        if (data.data?.result) {
          setGameState(prev => ({ ...prev, diceResult: data.data.result }));
          const playerName = data.data.user_id === userId ? 'Вы' : `Игрок ${data.data.user_id}`;
          const rolls = data.data.result.rolls ? ` [${data.data.result.rolls.join(', ')}]` : '';
          addSystemMessage(`🎲 ${playerName} бросили ${data.data.formula}: ${data.data.result.total}${rolls}`);
        }
        break;

      case 'game_started':
        addSystemMessage('🚀 Игра началась!');
        if (data.data?.turn_info) {
          setGameState(prev => ({
            ...prev,
            currentTurn: data.data.turn_info.current_player_id,
            isMyTurn: data.data.turn_info.current_player_id === userId,
            turnNumber: 1
          }));
          const firstPlayerName = data.data.turn_info.current_player_id === userId ? 'Вы' : `Игрок ${data.data.turn_info.current_player_id}`;
          addSystemMessage(`Первый ход: ${firstPlayerName}`);
        }
        break;

      case 'player_connected':
        if (data.data?.user_id) {
          const playerName = data.data.user_id === userId ? 'Вы' : `Игрок ${data.data.user_id}`;
          addSystemMessage(`👋 ${playerName} подключился к игре`);
        }
        break;

      case 'player_disconnected':
        if (data.data?.user_id) {
          const playerName = data.data.user_id === userId ? 'Вы' : `Игрок ${data.data.user_id}`;
          addSystemMessage(`👋 ${playerName} отключился от игры`);
        }
        break;

      case 'dice_error':
        if (data.data?.error) {
          addSystemMessage(`❌ Ошибка броска: ${data.data.error}`);
        }
        break;

      default:
        console.log('Unhandled WebSocket message type:', data.type);
        break;
    }
  };

  // Добавление системных сообщений
  const addSystemMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setGameState(prev => ({
      ...prev,
      systemMessages: [...prev.systemMessages, `${timestamp}: ${message}`].slice(-15) // Ограничиваем 15 сообщениями
    }));
  };

  // Перемещение игрока
  const handleCellClick = (x: number, y: number) => {
    if (!gameState.isMyTurn) {
      addSystemMessage('❌ Сейчас не ваш ход!');
      return;
    }

    if (!wsRef.current?.isConnected()) {
      addSystemMessage('❌ Нет соединения с сервером');
      return;
    }

    // Проверка на валидность хода (можно добавить логику дальности)
    const currentPos = gameState.players[userId!];
    if (currentPos) {
      const distance = Math.abs(x - currentPos.x) + Math.abs(y - currentPos.y);
      if (distance > 3) { // Максимальная дальность хода
        addSystemMessage('❌ Слишком далеко! Максимальная дальность хода: 3 клетки');
        return;
      }
    }

    const message = {
      type: 'move',
      data: {
        position: { x, y }
      }
    };

    wsRef.current.send(message);
    setSelectedCell({ x, y });
    addSystemMessage(`🚶 Перемещение на клетку (${x}, ${y})...`);
  };

  // Завершение хода
  const handleEndTurn = () => {
    if (!gameState.isMyTurn) {
      addSystemMessage('❌ Сейчас не ваш ход!');
      return;
    }

    if (!wsRef.current?.isConnected()) {
      addSystemMessage('❌ Нет соединения с сервером');
      return;
    }

    const message = {
      type: 'end_turn',
      data: {}
    };

    wsRef.current.send(message);
    addSystemMessage('⏭️ Завершение хода...');
  };

  // Бросок костей
  const handleDiceRoll = () => {
    if (!wsRef.current?.isConnected()) {
      addSystemMessage('❌ Нет соединения с сервером');
      return;
    }

    const message = {
      type: 'roll_dice',
      data: {
        dice_formula: diceFormula
      }
    };

    wsRef.current.send(message);
    addSystemMessage(`🎲 Бросок ${diceFormula}...`);
  };

  // Статус соединения
  const getConnectionStatusColor = () => {
    switch (gameState.connectionStatus) {
      case 'connected': return '#56ab2f';
      case 'connecting': return '#ffd700';
      case 'disconnected': return '#ff6b6b';
      case 'failed': return '#ff4444';
      default: return '#666';
    }
  };

  const getConnectionStatusText = () => {
    switch (gameState.connectionStatus) {
      case 'connected': return '🟢 Подключено';
      case 'connecting': return '🟡 Подключение...';
      case 'disconnected': return '🔴 Отключено';
      case 'failed': return '❌ Ошибка соединения';
      default: return '⚪ Неизвестно';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: '#fff',
        fontSize: '1.2rem'
      }}>
        🎲 Загрузка игры...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: '#fff',
        gap: '20px'
      }}>
        <div style={{ fontSize: '1.5rem', color: '#ff6b6b' }}>
          ❌ {error}
        </div>
        <button 
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          На главную
        </button>
      </div>
    );
  }

  // Проверяем, является ли пользователь GM
  const isGM = session?.players?.find(p => p.user_id === userId)?.is_gm;
  const actualPlayers = Object.fromEntries(
    Object.entries(gameState.players).filter(([playerId]) => {
      // Показываем только игроков, которые не являются GM
      const player = session?.players?.find(p => p.user_id === parseInt(playerId));
      return !player?.is_gm;
    })
  );

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      color: '#fff'
    }}>
      {/* Основная игровая область */}
      <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
        {/* Заголовок и статус */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2>🎮 Сессия: {session?.id}</h2>
            <div style={{ 
              color: getConnectionStatusColor(),
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              {getConnectionStatusText()}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ 
              fontSize: '1.1rem',
              color: '#ffd700',
              fontWeight: 'bold'
            }}>
              Ход #{gameState.turnNumber}
            </span>
            <span style={{ 
              fontSize: '1.1rem',
              color: gameState.isMyTurn ? '#56ab2f' : '#ff6b6b',
              fontWeight: 'bold',
              padding: '5px 12px',
              borderRadius: '20px',
              background: gameState.isMyTurn ? 'rgba(86, 171, 47, 0.2)' : 'rgba(255, 107, 107, 0.2)'
            }}>
              {gameState.isMyTurn ? '🟢 ВАШ ХОД' : '⏳ Ожидание'}
            </span>
            {gameState.currentTurn && (
              <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Текущий игрок: {gameState.currentTurn === userId ? 'Вы' : gameState.currentTurn}
              </span>
            )}
          </div>
        </div>

        {/* Игровое поле */}
        <div style={{
          display: 'inline-block',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${GRID_SIZE}px)`,
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${GRID_SIZE}px)`,
            gap: '1px',
            background: '#333',
            border: '2px solid #555'
          }}>
            {Array.from({ length: BOARD_HEIGHT }, (_, y) =>
              Array.from({ length: BOARD_WIDTH }, (_, x) => {
                const playersHere = Object.entries(actualPlayers).filter(
                  ([_, pos]) => pos.x === x && pos.y === y
                );
                const isSelected = selectedCell?.x === x && selectedCell?.y === y;
                const isMyPosition = gameState.players[userId!]?.x === x && gameState.players[userId!]?.y === y;
                
                // Проверка доступности хода
                const currentPos = gameState.players[userId!];
                const isValidMove = currentPos ? 
                  (Math.abs(x - currentPos.x) + Math.abs(y - currentPos.y)) <= 3 : true;
                
                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    style={{
                      width: `${GRID_SIZE}px`,
                      height: `${GRID_SIZE}px`,
                      background: isSelected 
                        ? '#4facfe'
                        : isMyPosition
                        ? '#56ab2f'
                        : playersHere.length > 0
                        ? '#ff6b6b' 
                        : gameState.isMyTurn && isValidMove
                        ? '#fff'
                        : '#ddd',
                      cursor: gameState.isMyTurn && isValidMove ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      opacity: (!gameState.isMyTurn || isValidMove) ? 1 : 0.5
                    }}
                    title={
                      playersHere.length > 0 
                        ? `Игроки: ${playersHere.map(([id]) => id === userId?.toString() ? 'Вы' : id).join(', ')}` 
                        : `Клетка (${x}, ${y})`
                    }
                  >
                    {playersHere.map(([playerId], index) => (
                      <span key={playerId} style={{
                        position: 'absolute',
                        top: `${2 + index * 6}px`,
                        left: `${2 + index * 6}px`,
                        fontSize: '18px'
                      }}>
                        {playerId === userId?.toString() ? '👤' : '🧙'}
                      </span>
                    ))}
                  </div>
                );
              })
            )}
          </div>
          <div style={{ 
            marginTop: '10px', 
            fontSize: '0.9rem', 
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center'
          }}>
            Максимальная дальность хода: 3 клетки | 👤 - Вы | 🧙 - Другие игроки
          </div>
        </div>

        {/* Панель управления */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {isGM ? (
            // Панель управления для GM
            <>
              <h3 style={{ marginBottom: '15px', color: '#ffd700' }}>👑 Панель Game Master</h3>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Бросок костей от имени системы */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label style={{ color: '#ffd700', fontWeight: 'bold' }}>🎲 Системный бросок:</label>
                  <select
                    value={diceFormula}
                    onChange={(e) => setDiceFormula(e.target.value)}
                    className="form-select"
                    style={{ minWidth: '100px' }}
                  >
                    <option value="d4">d4</option>
                    <option value="d6">d6</option>
                    <option value="d8">d8</option>
                    <option value="d10">d10</option>
                    <option value="d12">d12</option>
                    <option value="d20">d20</option>
                    <option value="d100">d100</option>
                    <option value="2d6">2d6</option>
                    <option value="3d6">3d6</option>
                    <option value="1d20+5">d20+5</option>
                  </select>
                  <button
                    onClick={handleDiceRoll}
                    className="btn btn-success"
                    disabled={gameState.connectionStatus !== 'connected'}
                  >
                    🎲 Бросить
                  </button>
                </div>

                {/* Управление ходами */}
                <button
                  onClick={() => {
                    // Логика принудительного завершения хода
                    if (wsRef.current?.isConnected()) {
                      const message = {
                        type: 'gm_command',
                        data: {
                          action: 'force_end_turn',
                          current_player: gameState.currentTurn
                        }
                      };
                      wsRef.current.send(message);
                      addSystemMessage('GM принудительно завершил ход');
                    }
                  }}
                  className="btn"
                  style={{ background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)' }}
                  disabled={!gameState.currentTurn || gameState.connectionStatus !== 'connected'}
                >
                  ⏭️ Принудительно завершить ход
                </button>

                {/* Результат последнего броска */}
                {gameState.diceResult && (
                  <div style={{
                    padding: '10px 15px',
                    background: 'rgba(255, 215, 0, 0.2)',
                    borderRadius: '8px',
                    border: '1px solid #ffd700',
                    fontWeight: 'bold'
                  }}>
                    🎲 Последний бросок: {gameState.diceResult.total}
                    {gameState.diceResult.rolls && (
                      <span style={{ fontSize: '0.9rem', marginLeft: '10px', opacity: 0.8 }}>
                        ({gameState.diceResult.rolls.join(' + ')})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Дополнительная информация для GM */}
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: 'rgba(255, 215, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                <h4 style={{ color: '#ffd700', marginBottom: '10px', fontSize: '1rem' }}>
                  💡 Подсказки для GM:
                </h4>
                <ul style={{ 
                  margin: 0,
                  paddingLeft: '20px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.9rem'
                }}>
                  <li>Наблюдайте за действиями игроков на карте</li>
                  <li>Используйте системные броски для проверок окружения</li>
                  <li>Принудительно завершайте ходы, если игрок долго думает</li>
                  <li>Следите за событиями игры в правой панели</li>
                </ul>
              </div>
            </>
          ) : (
            // Обычная панель для игроков
            <>
              <h3 style={{ marginBottom: '15px' }}>🎯 Действия</h3>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Бросок костей */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label style={{ color: '#ffd700', fontWeight: 'bold' }}>Кости:</label>
                  <select
                    value={diceFormula}
                    onChange={(e) => setDiceFormula(e.target.value)}
                    className="form-select"
                    style={{ minWidth: '100px' }}
                  >
                    <option value="d4">d4</option>
                    <option value="d6">d6</option>
                    <option value="d8">d8</option>
                    <option value="d10">d10</option>
                    <option value="d12">d12</option>
                    <option value="d20">d20</option>
                    <option value="d100">d100</option>
                    <option value="2d6">2d6</option>
                    <option value="3d6">3d6</option>
                    <option value="1d20+5">d20+5</option>
                  </select>
                  <button
                    onClick={handleDiceRoll}
                    className="btn btn-success"
                    disabled={gameState.connectionStatus !== 'connected'}
                  >
                    🎲 Бросить
                  </button>
                </div>

                {/* Завершение хода */}
                <button
                  onClick={handleEndTurn}
                  disabled={!gameState.isMyTurn || gameState.connectionStatus !== 'connected'}
                  className={`btn ${gameState.isMyTurn ? '' : 'btn-disabled'}`}
                  style={{ 
                    background: gameState.isMyTurn && gameState.connectionStatus === 'connected'
                      ? 'linear-gradient(45deg, #ff6b6b, #ee5a52)' 
                      : '#666'
                  }}
                >
                  ⏭️ Завершить ход
                </button>

                {/* Результат последнего броска */}
                {gameState.diceResult && (
                  <div style={{
                    padding: '10px 15px',
                    background: 'rgba(255, 215, 0, 0.2)',
                    borderRadius: '8px',
                    border: '1px solid #ffd700',
                    fontWeight: 'bold'
                  }}>
                    🎲 Последний бросок: {gameState.diceResult.total}
                    {gameState.diceResult.rolls && (
                      <span style={{ fontSize: '0.9rem', marginLeft: '10px', opacity: 0.8 }}>
                        ({gameState.diceResult.rolls.join(' + ')})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Боковая панель */}
      <div style={{
        width: '300px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px'
      }}>
        {/* Информация об игроках */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#ffd700' }}>👥 Игроки онлайн</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.keys(actualPlayers).length === 0 ? (
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                padding: '20px',
                border: '1px dashed rgba(255, 255, 255, 0.3)',
                borderRadius: '8px'
              }}>
                {isGM ? 'Вы наблюдаете за игроками как GM' : 'Ожидание игроков...'}
              </div>
            ) : (
              Object.entries(actualPlayers).map(([playerId, position]) => (
                <div 
                  key={playerId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: playerId === userId?.toString() 
                      ? 'rgba(79, 172, 254, 0.2)' 
                      : gameState.currentTurn?.toString() === playerId
                      ? 'rgba(255, 215, 0, 0.2)'
                      : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    border: `1px solid ${
                      playerId === userId?.toString() 
                        ? '#4facfe' 
                        : gameState.currentTurn?.toString() === playerId
                        ? '#ffd700'
                        : 'rgba(255, 255, 255, 0.2)'
                    }`
                  }}
                >
                  <div>
                    <div style={{ 
                      fontWeight: 'bold',
                      color: playerId === userId?.toString() ? '#4facfe' : '#fff',
                      marginBottom: '2px'
                    }}>
                      {playerId === userId?.toString() ? '👤 Вы' : `🧙 Игрок ${playerId}`}
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      Позиция: ({position.x}, {position.y})
                    </div>
                  </div>
                  {gameState.currentTurn?.toString() === playerId && (
                    <div style={{ 
                      fontSize: '0.8rem',
                      color: '#ffd700',
                      fontWeight: 'bold'
                    }}>
                      ⚡ ХОД
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Системные сообщения */}
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '15px', color: '#ffd700' }}>📋 События игры</h3>
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '15px',
            height: '300px',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {gameState.systemMessages.length === 0 ? (
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.5)',
                textAlign: 'center',
                padding: '40px 0'
              }}>
                События появятся здесь...
              </div>
            ) : (
              gameState.systemMessages.map((message, index) => (
                <div 
                  key={index}
                  style={{
                    marginBottom: '8px',
                    padding: '8px 10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    borderLeft: '3px solid #4facfe'
                  }}
                >
                  {message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Кнопки управления */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => navigate(`/lobby/${sessionId}`)}
            className="btn btn-secondary"
          >
            🔄 Вернуться в лобби
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            🏠 На главную
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;