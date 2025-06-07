import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSessionById, joinSession } from '../api/gameSessions';
import { GameSession } from '../types/gameTypes';

const JoinSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { token, userId } = useAuth();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [sessionId, token]);

  const loadData = async () => {
    if (!sessionId || !token) return;
    
    try {
      setLoading(true);
      const sessionData = await getSessionById(sessionId, token);
      
      if (!sessionData) {
        setError('Сессия не найдена');
        return;
      }
      
      setSession(sessionData);
      
      // Проверяем, уже ли мы в этой сессии
      const existingPlayer = sessionData.players?.find(p => p.user_id === userId);
      if (existingPlayer) {
        // Уже в сессии, перенаправляем в лобби
        navigate(`/lobby/${sessionId}`);
        return;
      }
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!sessionId || !token) return;
    
    try {
      setJoining(true);
      // Присоединяемся БЕЗ персонажа - выберем его в лобби
      await joinSession({
        sessionId,
        characterId: 1, // Временное значение, исправим в API
        token
      });
      
      // Успешно присоединились, переходим в лобби
      navigate(`/lobby/${sessionId}`);
      
    } catch (err) {
      console.error('Join error:', err);
      setError('Ошибка присоединения к сессии');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="loading">Загрузка сессии...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="card card-medium">
            <div className="error">{error}</div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button onClick={() => navigate('/')} className="btn btn-primary">
                На главную
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="error">Сессия не найдена</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="card card-large">
          <h2>🎮 Присоединение к сессии</h2>
          
          {/* Информация о сессии */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '30px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ color: '#ffd700', marginBottom: '15px' }}>
              📋 Информация о сессии
            </h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <div>
                <strong style={{ color: '#4facfe' }}>ID сессии:</strong>
                <div>{session.id}</div>
              </div>
              <div>
                <strong style={{ color: '#56ab2f' }}>Статус:</strong>
                <div>{session.status === 'waiting' ? '⏳ Ожидание игроков' : '🎯 Активная'}</div>
              </div>
              <div>
                <strong style={{ color: '#ff6b6b' }}>Игроки:</strong>
                <div>{session.players?.length || 0} / {session.max_players}</div>
              </div>
            </div>
          </div>

          {/* Информация о присоединении */}
          <div>
            <h3 style={{ color: '#ffd700', marginBottom: '20px' }}>
              Присоединиться к игре
            </h3>
            
            <div style={{
              padding: '30px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎲</div>
              <h4 style={{ color: '#4facfe', marginBottom: '15px' }}>
                Готовы к приключению?
              </h4>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '25px',
                lineHeight: '1.6'
              }}>
                Вы присоединитесь к игровой сессии <strong style={{ color: '#ffd700' }}>{session.id}</strong>.<br/>
                После присоединения вы сможете выбрать персонажа в лобби игры.
              </p>
              
              {/* Требования */}
              <div style={{
                background: 'rgba(255, 215, 0, 0.1)',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '25px',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                <h5 style={{ color: '#ffd700', marginBottom: '10px' }}>
                  Что потребуется:
                </h5>
                <ul style={{ 
                  textAlign: 'left',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0,
                  paddingLeft: '20px'
                }}>
                  <li>Иметь хотя бы одного созданного персонажа</li>
                  <li>Дождаться готовности всех игроков</li>
                  <li>Следовать указаниям Game Master</li>
                </ul>
              </div>

              {/* Кнопки управления */}
              <div style={{ 
                display: 'flex', 
                gap: '15px', 
                justifyContent: 'center',
                marginTop: '30px'
              }}>
                <button
                  onClick={() => navigate('/')}
                  className="btn btn-secondary"
                >
                  Назад
                </button>
                
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className={`btn btn-success btn-large ${joining ? 'btn-disabled' : ''}`}
                >
                  {joining ? 'Присоединение...' : 'Присоединиться к игре'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinSessionPage;