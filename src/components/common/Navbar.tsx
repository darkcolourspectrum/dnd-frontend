import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav>
      <button onClick={() => navigate('/')}>Главная</button>
      {token ? (
        <>
          <button onClick={() => navigate('/create-session')}>Создать игру</button>
          <button onClick={logout}>Выйти</button>
        </>
      ) : (
        <button onClick={() => navigate('/auth')}>Войти</button>
      )}
    </nav>
  );
};

export default Navbar;