import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('nutrition_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 423) {
      localStorage.removeItem('nutrition_token');
      localStorage.removeItem('nutrition_user');
      window.dispatchEvent(new Event('nutrition:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export const apiData = (response) => response.data?.data ?? response.data;
export const apiErrorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.detail || error.message || 'Đã có lỗi xảy ra.';

export default client;