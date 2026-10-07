import client, { apiData } from './axiosClient';

export const getDailyActivities = async (date) =>
  apiData(await client.get('/activities/daily', { params: { date } }));
export const createActivity = async (payload) =>
  apiData(await client.post('/activities', payload));
export const deleteActivity = async (id) =>
  apiData(await client.delete(`/activities/${id}`));
