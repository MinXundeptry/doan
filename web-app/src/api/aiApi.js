import client, { apiData } from './axiosClient';

export const sendChatMessage = async (payload) => apiData(await client.post('/ai/chat', payload));

export const analyzeFoodImage = async (image, options = {}) => {
  const form = new FormData();
  form.append('image', image);
  if (options.food_name) form.append('food_name', options.food_name);
  if (options.amount_gram) form.append('amount_gram', options.amount_gram);
  return apiData(await client.post('/ai/analyze-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }));
};