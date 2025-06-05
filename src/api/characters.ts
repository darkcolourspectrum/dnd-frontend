import axios from 'axios';
import { API_CONFIG } from './config';


export const getCharacters = async (token: string) => {
  const response = await axios.get(`${API_CONFIG.BASE_URL}/characters/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};


export const createCharacter = async (characterData: {
  name: string;
  race: string;
  class_: string;
  strength: number;
  dexterity: number;
  intelligence: number;
}, token: string) => {
  const response = await axios.post(`${API_CONFIG.BASE_URL}/characters/`, characterData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};