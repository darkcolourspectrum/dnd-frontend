import axios from 'axios';

const API_URL = 'https://rg55nfxi0i.loclx.io/';

export const createGameSession = async (maxPlayers: number, token: string) => {
  const response = await axios.post(
    `${API_URL}/gamesessions/`,
    { max_players: maxPlayers },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const joinGameSession = async (sessionId: string, characterId: number, token: string) => {
  const response = await axios.post(
    `${API_URL}/gamesessions/${sessionId}/join`,
    { character_id: characterId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Добавляем к существующим функциям в gameSessions.ts
export const getSessionDetails = async (sessionId: string, token: string) => {
  const response = await axios.get(`${API_URL}/gamesessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const startGameSession = async (sessionId: string, token: string) => {
  const response = await axios.post(
    `${API_URL}/gamesessions/${sessionId}/start`,
    {},
    { headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};