import axios from 'axios';

const API_URL = 'https://rg55nfxi0i.loclx.io/';

export const rollDice = async (formula: string) => {
  const response = await axios.post(
    `${API_URL}/dice/roll`,
    { dice_formula: formula }
  );
  return response.data;
};