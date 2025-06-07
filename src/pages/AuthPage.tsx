import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // Состояние для формы входа
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Состояние для формы регистрации
  const [registerData, setRegisterData] = useState({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setError('Заполните все поля');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await login(loginData.email, loginData.password, 'device-fingerprint');
      const { access_token } = response;
      
      // Получаем информацию о пользователе
      const userResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const userData = await userResponse.json();
      
      authLogin(access_token, userData.id);
      navigate('/');
    } catch (err) {
      setError('Ошибка входа. Проверьте данные.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.nickname || !registerData.email || !registerData.password) {
      setError('Заполните все поля');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (registerData.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      await register(registerData.nickname, registerData.email, registerData.password);
      setIsLogin(true);
      setError('');
      // Показываем успешное сообщение
      setError(''); // Очищаем ошибки
      alert('Регистрация успешна! Теперь вы можете войти в систему.');
    } catch (err) {
      setError('Ошибка регистрации. Возможно, email уже занят.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="card card-medium">
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
              🎲 DnD Multiplayer
            </h1>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem'
            }}>
              {isLogin ? 'Добро пожаловать обратно!' : 'Присоединяйтесь к приключению!'}
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Переключатель между входом и регистрацией */}
          <div style={{ 
            display: 'flex', 
            marginBottom: '30px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '5px'
          }}>
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                background: isLogin ? 'rgba(79, 172, 254, 0.3)' : 'transparent',
                color: isLogin ? '#4facfe' : 'rgba(255, 255, 255, 0.7)',
                fontWeight: isLogin ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                background: !isLogin ? 'rgba(86, 171, 47, 0.3)' : 'transparent',
                color: !isLogin ? '#56ab2f' : 'rgba(255, 255, 255, 0.7)',
                fontWeight: !isLogin ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Регистрация
            </button>
          </div>

          {/* Форма входа */}
          {isLogin ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Пароль</label>
                <input
                  type="password"
                  className="form-input"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  placeholder="Введите пароль"
                  required
                />
              </div>

              <button 
                type="submit"
                className={`btn btn-primary btn-large ${isSubmitting ? 'btn-disabled' : ''}`}
                style={{ width: '100%', marginTop: '20px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Входим...' : 'Войти'}
              </button>
            </form>
          ) : (
            /* Форма регистрации */
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  value={registerData.nickname}
                  onChange={(e) => setRegisterData({...registerData, nickname: e.target.value})}
                  placeholder="Ваш игровой никнейм"
                  required
                  minLength={3}
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  className="form-input"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  className="form-input"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  placeholder="Минимум 8 символов"
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  className="form-input"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  placeholder="Повторите пароль"
                  required
                />
              </div>

              <button 
                type="submit"
                className={`btn btn-success btn-large ${isSubmitting ? 'btn-disabled' : ''}`}
                style={{ width: '100%', marginTop: '20px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Регистрируем...' : 'Зарегистрироваться'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;