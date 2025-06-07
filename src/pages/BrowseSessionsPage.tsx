import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAvailableSessions } from '../api/gameSessions';
import { GameSession } from '../types/gameTypes';

const BrowseSessionsPage: React.FC = () => {
  const { token, userId } = useAuth();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    loadSessions();
  }, [token]);

  const loadSessions = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const allSessions = await getAvailableSessions(token);
      // Показываем только сессии в режиме ожидания, где мы не являемся участниками
      const availableSessions = allSessions.filter(session => 
        session.status === 'waiting' && 
        session.creator_id !== userId &&
        !session.players?.some(p => p.user_id === userId)
      );
      setSessions(availableSessions);
    } catch (err) {
      setError('Ошибка загрузки сессий');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinById = () => {
    if (!searchId.trim()) {
      alert('Введите ID сессии');
      return;
    }
    navigate(`/join/${searchId.trim()}`);
  };

  const handleJoinSession = (sessionId: string) => {
    navigate(`/join/${sessionId}`);
  };

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="card card-large">
          <h2>Поиск игровых сессий</h2>
          
          {/* Поиск по ID */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '30px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ color: '#ffd700', marginBottom: '15px' }}>
              Присоединиться по ID сессии
            </h3>
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Введите ID сессии (например: ABC123XY)"
                className="form-input"
                style={{ flex: 1, minWidth: '200px' }}
                maxLength={8}
              />
              <button
                onClick={handleJoinById}
                className="btn btn-primary"
                disabled={!searchId.trim()}
              >
                Присоединиться
              </button>
            </div>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'rgba(255, 255, 255, 0.7)',
              marginTop: '10px'
            }}>
              Если у вас есть ID сессии от друга, введите его выше
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Список доступных сессий */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#ffd700', margin: 0 }}>
                Доступные сессии
              </h3>
              <button
                onClick={loadSessions}
                className="btn btn-secondary"
                disabled={loading}
              >
                Обновить
              </button>
            </div>

            {loading ? (
              <div className="loading">Загрузка сессий...</div>
            ) : sessions.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px dashed rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}></div>
                <h3 style={{ color: '#ffd700', marginBottom: '15px' }}>
                  Нет доступных сессий
                </h3>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '25px'
                }}>
                  В данный момент нет открытых сессий для присоединения. <br/>
                  Попробуйте создать свою собственную или попросите друга поделиться ID сессии.
                </p>
                <button
                  onClick={() => navigate('/create-session')}
                  className="btn btn-primary btn-large"
                >
                  Создать собственную сессию
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {sessions.map(session => (
                  <div
                    key={session.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Заголовок сессии */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <h4 style={{ 
                        color: '#ffd700',
                        fontSize: '1.2rem',
                        margin: 0
                      }}>
                        🎮 {session.id}
                      </h4>
                      <span style={{
                        color: '#56ab2f',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        ⏳ Ожидание
                      </span>
                    </div>

                    {/* Информация о сессии */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '15px',
                        marginBottom: '15px'
                      }}>
                        <div>
                          <strong style={{ color: '#4facfe' }}>Игроки:</strong>
                          <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                            {session.players?.length || 0}/{session.max_players}
                          </div>
                        </div>
                        <div>
                          <strong style={{ color: '#56ab2f' }}>Мест:</strong>
                          <div style={{ 
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: (session.max_players - (session.players?.length || 0)) <= 1 ? 'bold' : 'normal'
                          }}>
                            {session.max_players - (session.players?.length || 0)} свободно
                          </div>
                        </div>
                      </div>

                      {/* Индикатор заполненности */}
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '10px',
                          height: '6px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                            height: '100%',
                            width: `${((session.players?.length || 0) / session.max_players) * 100}%`,
                            borderRadius: '10px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>

                      {/* Список игроков */}
                      {session.players && session.players.length > 0 && (
                        <div>
                          <strong style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>
                            Участники:
                          </strong>
                          <div style={{ 
                            marginTop: '5px',
                            fontSize: '0.8rem',
                            color: 'rgba(255, 255, 255, 0.7)'
                          }}>
                            {session.players.map(player => (
                              <span key={player.id} style={{ marginRight: '10px' }}>
                                {player.is_gm ? 'GM' : ''} Игрок {player.user_id}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Кнопка присоединения */}
                    <button
                      onClick={() => handleJoinSession(session.id)}
                      className="btn btn-success"
                      style={{ width: '100%' }}
                      disabled={(session.players?.length || 0) >= session.max_players}
                    >
                      {(session.players?.length || 0) >= session.max_players 
                        ? 'Сессия заполнена' 
                        : 'Присоединиться'
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Кнопка назад */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              ← Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseSessionsPage;