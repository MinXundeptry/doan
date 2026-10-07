import client, { apiData } from './axiosClient';

export const getFoods = async (params = {}) => apiData(await client.get('/foods', { params }));
export const createFood = async (payload) => apiData(await client.post('/foods', payload));
export const updateFood = async (id, payload) => apiData(await client.put(`/foods/${id}`, payload));
export const deleteFood = async (id) => apiData(await client.delete(`/foods/${id}`));
