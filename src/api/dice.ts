import axios from 'axios';
import { API_CONFIG } from './config';


export const rollDice = async (formula: string) => {
  const response = await axios.post(
    `${API_CONFIG.BASE_URL}/dice/roll`,
    { dice_formula: formula }
  );
  return response.data;
};