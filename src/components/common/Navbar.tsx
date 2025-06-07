import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navbarStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '15px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const logoStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    cursor: 'pointer',
    userSelect: 'none'
  };

  const navButtonStyle = (active: boolean): React.CSSProperties => ({
    background: active 
      ? 'linear-gradient(45deg, #4facfe, #00f2fe)' 
      : 'rgba(255, 255, 255, 0.1)',
    border: active ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    color: active ? 'white' : 'rgba(255, 255, 255, 0.9)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: active ? '600' : '500',
    padding: '10px 20px',
    marginLeft: '10px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(5px)'
  });

  const logoutButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    padding: '10px 20px',
    marginLeft: '10px',
    transition: 'all 0.3s ease'
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={navbarStyle}>
      <div style={containerStyle}>
        {/* Логотип */}
        <div 
          style={logoStyle}
          onClick={() => handleNavClick('/')}
        >
          DnD Multiplayer
        </div>

        {/* Навигационные кнопки */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {token ? (
            <>
              <button
                style={navButtonStyle(isActive('/'))}
                onClick={() => handleNavClick('/')}
                onMouseEnter={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                Главная
              </button>
              
              <button
                style={navButtonStyle(isActive('/characters'))}
                onClick={() => handleNavClick('/characters')}
                onMouseEnter={(e) => {
                  if (!isActive('/characters')) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/characters')) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                Персонажи
              </button>
              
              <button
                style={navButtonStyle(isActive('/browse-sessions'))}
                onClick={() => handleNavClick('/browse-sessions')}
                onMouseEnter={(e) => {
                  if (!isActive('/browse-sessions')) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/browse-sessions')) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                Найти игру
              </button>
              
              <button
                style={navButtonStyle(isActive('/create-session'))}
                onClick={() => handleNavClick('/create-session')}
                onMouseEnter={(e) => {
                  if (!isActive('/create-session')) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/create-session')) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                Создать игру
              </button>
              
              <button
                style={navButtonStyle(isActive('/manage-sessions'))}
                onClick={() => handleNavClick('/manage-sessions')}
                onMouseEnter={(e) => {
                  if (!isActive('/manage-sessions')) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/manage-sessions')) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                Управление
              </button>
              
              <button
                style={logoutButtonStyle}
                onClick={handleLogout}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(45deg, #ee5a52, #ff6b6b)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a52)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Выйти
              </button>
            </>
          ) : (
            <button
              style={navButtonStyle(isActive('/auth'))}
              onClick={() => handleNavClick('/auth')}
              onMouseEnter={(e) => {
                if (!isActive('/auth')) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/auth')) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              Войти
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;