import axios from "axios";
import { API_CONFIG } from './config';


export const login = async (email: string, password: string, fingerprint: string) => {
  const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/login`, {
    email,
    password,
    fingerprint
  });
  
  // После успешного логина также нужно получить информацию о пользователе
  const userResponse = await axios.get(`${API_CONFIG.BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${response.data.access_token}` }
  });
  
  return {
    ...response.data,
    userId: userResponse.data.id
  };
};

export const register = async (nickname: string, email: string, password: string) => {
  const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/register`, {
    nickname,
    email,
    password,
    fingerprint: "device-fingerprint"
  });
  return response.data;
};