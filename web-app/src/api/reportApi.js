import client, { apiData } from './axiosClient';

export const getWeeklyReport = async (endDate) =>
  apiData(await client.get('/reports/weekly', { params: { end_date: endDate } }));
