import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth';
import LoginForm from '../components/common/LoginForm';
import RegisterForm from '../components/common/RegisterForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    try {
      const { access_token } = await login(email, password, 'device-fingerprint');
      localStorage.setItem('token', access_token);
      navigate('/');
    } catch (err) {
      setError('Ошибка входа. Проверьте данные.');
    }
  };

  const handleRegister = async (nickname: string, email: string, password: string) => {
    try {
      await register(nickname, email, password);
      setIsLogin(true); // Переключаем на форму входа после успешной регистрации
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