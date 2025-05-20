import axios from "axios";

const API_URL = "https://rg55nfxi0i.loclx.io/";

export const login = async (email: string, password: string, fingerprint: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
    fingerprint: "device-fingerprint" 
  });
  return response.data;
};

export const register = async (nickname: string, email: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/register`, {
    nickname,
    email,
    password,
    fingerprint: "device-fingerprint"
  });
  return response.data;
};