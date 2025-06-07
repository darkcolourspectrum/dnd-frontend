import axios from 'axios';
import { API_CONFIG } from './config';
import type { GameSession, SessionPlayer } from '../types/gameTypes';

interface CreateSessionParams {
  maxPlayers: number;
  token: string;
}

interface JoinSessionParams {
  sessionId: string;
  characterId: number;
  token: string;
}

export const createGameSession = async ({
  maxPlayers,
  token
}: CreateSessionParams): Promise<GameSession> => {
  const response = await axios.post(
    `${API_CONFIG.BASE_URL}/gamesessions/`,
    { max_players: maxPlayers },  // Исправлено на snake_case
    { 
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      } 
    }
  );
  return response.data;
};

export const getAvailableSessions = async (token: string): Promise<GameSession[]> => {
  try {
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}/gamesessions?status=waiting`,
      { 
        headers: { 
          Authorization: `Bearer ${token}` 
        } 
      }
    );
    return response.data || [];
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
};

export const getSessionById = async (
  sessionId: string, 
  token: string
): Promise<GameSession | null> => {
  try {
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}/gamesessions/${sessionId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error loading session ${sessionId}:`, error);
    return null;
  }
};

export const joinSession = async ({
  sessionId,
  characterId,
  token
}: JoinSessionParams): Promise<SessionPlayer> => {
  try {
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/gamesessions/${sessionId}/join`,
      { character_id: characterId },
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Join session error:', error);
    throw new Error('Failed to join session');
  }
};

export const updateReadyStatus = async (
  sessionId: string,
  isReady: boolean,
  token: string
): Promise<SessionPlayer> => {
  try {
    const response = await axios.patch(
      `${API_CONFIG.BASE_URL}/gamesessions/${sessionId}/ready`,
      { is_ready: isReady },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating ready status:', error);
    throw new Error('Failed to update status');
  }
};

export const startSession = async (
  sessionId: string,
  token: string
): Promise<GameSession> => {
  try {
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/gamesessions/${sessionId}/start`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Session start error:', error);
    throw new Error('Failed to start session');
  }
};

export const getSessionPlayers = async (sessionId: string, token: string): Promise<SessionPlayer[]> => {
  try {
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}/gamesessions/${sessionId}/players`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching session players:', error);
    return [];
  }
};

export const toggleReadyStatus = async (sessionId: string, token: string): Promise<SessionPlayer> => {
  try {
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/gamesessions/${sessionId}/ready`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling ready status:', error);
    throw new Error('Failed to toggle ready status');
  }
};

export const deleteSession = async (sessionId: string, token: string): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(
      `${API_CONFIG.BASE_URL}/gamesessions/${sessionId}`,
      { 
        headers: { 
          Authorization: `Bearer ${token}` 
        } 
      }
    );
    return response.data;
  } catch (error) {
    console.error('Delete session error:', error);
    throw new Error('Failed to delete session');
  }
};

export const getMyOwnedSessions = async (token: string): Promise<GameSession[]> => {
  try {
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}/gamesessions/my-sessions`,
      { 
        headers: { 
          Authorization: `Bearer ${token}` 
        } 
      }
    );
    return response.data || [];
  } catch (error) {
    console.error('Error fetching my sessions:', error);
    return [];
  }
};