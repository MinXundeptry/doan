import client, { apiData } from './axiosClient';

export const login = async (payload) => apiData(await client.post('/auth/login', payload));
export const register = async (payload) => apiData(await client.post('/auth/register', payload));
export const getProfile = async () => apiData(await client.get('/user/profile'));
export const updateProfile = async (payload) => apiData(await client.put('/user/profile', payload));