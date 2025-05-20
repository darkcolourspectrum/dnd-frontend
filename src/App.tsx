import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import GamePage from './pages/GamePage';
import CreateSessionPage from './pages/CreateSessionPage';
import CreateCharacterPage from './pages/CreateCharacterPage';
import SessionLobby from './components/SessionLobby/SessionLobby';
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
            <Route path="/game/:sessionId" element={<GamePage />} />
            <Route path="/session/:sessionId/lobby" element={<SessionLobby />} />
            <Route path="/create-session" element={<CreateSessionPage />} />
            <Route path="/create-character" element={<CreateCharacterPage />} />  
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </AuthProvider>
  );
};

export default App;