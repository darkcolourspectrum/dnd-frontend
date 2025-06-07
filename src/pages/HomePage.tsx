import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="card card-large">
          <h1>🎲 DnD Multiplayer</h1>
          <p style={{ 
            textAlign: 'center', 
            fontSize: '1.2rem', 
            marginBottom: '40px',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            Добро пожаловать в мир приключений! Создавайте персонажей, 
            начинайте игровые сессии и отправляйтесь в незабываемые путешествия 
            с друзьями.
          </p>
          
          {token ? (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '30px', color: '#a8edea' }}>
                Что хотите сделать?
              </h3>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '15px',
                alignItems: 'center',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                <button 
                  className="btn btn-primary btn-large"
                  onClick={() => navigate("/characters")}
                  style={{ width: '100%' }}
                >
                  Создать персонажа
                </button>
                
                <button 
                  className="btn btn-success btn-large"
                  onClick={() => navigate("/create-session")}
                  style={{ width: '100%' }}
                >
                  Создать игру
                </button>

                <button 
                  className="btn btn-primary btn-large"
                  onClick={() => navigate("/browse-sessions")}
                  style={{ width: '100%' }}
                >
                  Найти игру
                </button>
                
                <button 
                  className="btn btn-primary btn-large"
                  onClick={() => navigate("/manage-sessions")}
                  style={{ width: '100%' }}
                >
                  Управление сессиями
                </button>
                
                <div style={{ 
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                  paddingTop: '20px',
                  marginTop: '20px',
                  width: '100%'
                }}>
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '15px'
                  }}>
                    Хотите выйти из аккаунта?
                  </p>
                  <button 
                    className="btn btn-secondary"
                    onClick={logout}
                    style={{ width: '200px' }}
                  >
                    Выйти
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '30px', color: '#fed6e3' }}>
                Для начала игры необходимо войти в систему
              </h3>
              
              <button 
                className="btn btn-primary btn-large"
                onClick={() => navigate("/auth")}
              >
                Войти в систему
              </button>
              
              <p style={{ 
                marginTop: '20px',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                Нет аккаунта? Не беспокойтесь - вы сможете зарегистрироваться 
                на следующей странице!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;