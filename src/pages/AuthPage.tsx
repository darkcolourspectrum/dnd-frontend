import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth';
import LoginForm from '../components/common/LoginForm';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm from '../components/common/RegisterForm';
import axios from 'axios';
import { API_CONFIG } from '../api/config';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleLogin = async (email: string, password: string) => {
      try {
        const response = await login(email, password, 'device-fingerprint');
        const { access_token } = response;
        
        // Получаем информацию о пользователе после успешного логина
        const userResponse = await axios.get(`${API_CONFIG.BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        
        // Используем функцию login из контекста авторизации
        authLogin(access_token, userResponse.data.id);
        navigate('/');
      } catch (err) {
        setError('Ошибка входа. Проверьте данные.');
      }
    };

  const handleRegister = async (nickname: string, email: string, password: string) => {
    try {
      await register(nickname, email, password);
      setIsLogin(true); 
    } catch (err) {
      setError('Ошибка регистрации. Возможно, email уже занят.');
    }
  };

  return (
    <div className="auth-container">
      {error && <div className="error-message">{error}</div>}
      {isLogin ? (
        <LoginForm 
          onLogin={handleLogin} 
          onSwitch={() => setIsLogin(false)} 
        />
      ) : (
        <RegisterForm 
          onRegister={handleRegister} 
          onSwitch={() => setIsLogin(true)} 
        />
      )}
    </div>
  );
};

export default AuthPage;