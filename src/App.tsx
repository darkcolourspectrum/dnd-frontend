import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import GamePage from './pages/GamePage';
import CreateSessionPage from './pages/CreateSessionPage';
import CreateCharacterPage from './pages/CreateCharacterPage';
import SessionLobbyPage from './pages/SessionLobbyPage';
import Navbar from './components/common/Navbar';

const App = () => {
  return (
    <AuthProvider>
      <GameProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/characters" element={<CreateCharacterPage />} />  
            <Route path="/create-session" element={<CreateSessionPage />} />
            <Route path="/lobby/:sessionId" element={<SessionLobbyPage />} />
            <Route path="/game/:sessionId" element={<GamePage />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </AuthProvider>
  );
};

export default App;