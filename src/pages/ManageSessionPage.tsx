import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { deleteSession, getAvailableSessions } from '../api/gameSessions';
import { GameSession } from '../types/gameTypes';

// Расширенный тип для сессии с created_at
interface ExtendedGameSession extends GameSession {
  created_at: string;
}

const ManageSessionsPage: React.FC = () => {
  const { token, userId } = useAuth();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<ExtendedGameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingSession, setDeletingSession] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, [token]);

  const loadSessions = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const allSessions = await getAvailableSessions(token);
      // Фильтруем только созданные текущим пользователем и добавляем created_at
      const mySessions = allSessions
        .filter(session => session.creator_id === userId)
        .map(session => ({
          ...session,
          created_at: session.created_at || new Date().toISOString()
        }));
      setSessions(mySessions);
    } catch (err) {
      setError('Ошибка загрузки сессий');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!token) return;
    
    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить сессию ${sessionId}? Это действие нельзя отменить.`
    );
    
    if (!confirmed) return;

    try {
      setDeletingSession(sessionId);
      await deleteSession(sessionId, token);
      
      // Убираем удаленную сессию из списка
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      // Показываем уведомление об успехе
      alert(`Сессия ${sessionId} успешно удалена`);
      
    } catch (err) {
      console.error('Delete error:', err);
      alert('Ошибка при удалении сессии');
    } finally {
      setDeletingSession(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return '#ffd700';
      case 'active': return '#56ab2f';
      case 'finished': return '#666';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return '⏳ Ожидание';
      case 'active': return '🎮 Активная';
      case 'finished': return '✅ Завершена';
      default: return '❓ Неизвестно';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="loading">Загрузка ваших сессий...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="card card-large">
          <h2>🎮 Управление сессиями</h2>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem'
            }}>
              Здесь вы можете управлять созданными вами игровыми сессиями
            </p>
            <button
              onClick={() => navigate('/create-session')}
              className="btn btn-success"
            >
              ➕ Создать новую сессию
            </button>
          </div>

          {sessions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px dashed rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎲</div>
              <h3 style={{ color: '#ffd700', marginBottom: '15px' }}>
                У вас пока нет созданных сессий
              </h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '25px'
              }}>
                Создайте свою первую игровую сессию и пригласите друзей!
              </p>
              <button
                onClick={() => navigate('/create-session')}
                className="btn btn-primary btn-large"
              >
                🚀 Создать первую сессию
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
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
                    <h3 style={{ 
                      color: '#ffd700',
                      fontSize: '1.3rem',
                      margin: 0
                    }}>
                      🎮 {session.id}
                    </h3>
                    <span style={{
                      color: getStatusColor(session.status),
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {getStatusText(session.status)}
                    </span>
                  </div>

                  {/* Информация о сессии */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      marginBottom: '15px'
                    }}>
                      <div>
                        <strong style={{ color: '#4facfe' }}>Игроки:</strong>
                        <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          {session.players?.length || 0}/{session.max_players}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#56ab2f' }}>Создана:</strong>
                        <div style={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '0.9rem'
                        }}>
                          {session.created_at 
                            ? new Date(session.created_at).toLocaleDateString()
                            : 'Недавно'
                          }
                        </div>
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
                              {player.is_gm ? '👑' : '👤'} Игрок {player.user_id}
                              {player.is_ready && ' ✅'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Кнопки управления */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}>
                    {session.status === 'waiting' && (
                      <button
                        onClick={() => navigate(`/lobby/${session.id}`)}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        🚪 Войти в лобби
                      </button>
                    )}
                    
                    {session.status === 'active' && (
                      <button
                        onClick={() => navigate(`/game/${session.id}`)}
                        className="btn btn-success"
                        style={{ flex: 1 }}
                      >
                        🎮 Войти в игру
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={deletingSession === session.id}
                      className="btn"
                      style={{
                        background: deletingSession === session.id 
                          ? '#666' 
                          : 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
                        minWidth: '120px'
                      }}
                    >
                      {deletingSession === session.id ? '⏳ Удаление...' : '🗑️ Удалить'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Информация */}
          <div style={{
            marginTop: '40px',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h4 style={{ color: '#ffd700', marginBottom: '15px' }}>
              ℹ️ Информация об управлении сессиями:
            </h4>
            <ul style={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              listStyle: 'none',
              padding: 0
            }}>
              <li style={{ marginBottom: '8px' }}>
                • <strong>Удаление сессии</strong> - полностью удаляет сессию и всех связанных игроков
              </li>
              <li style={{ marginBottom: '8px' }}>
                • <strong>Активные сессии</strong> - можно удалить, но это отключит всех игроков
              </li>
              <li style={{ marginBottom: '8px' }}>
                • <strong>Только создатель</strong> может удалять сессии
              </li>
              <li>
                • <strong>Ожидающие сессии</strong> - можно войти в лобби для настройки
              </li>
            </ul>
          </div>

          {/* Кнопка назад */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
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

export default ManageSessionsPage;