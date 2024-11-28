import axios from 'axios';

const api = axios.create({
  baseURL: 'https://trackmaster-avw68.ondigitalocean.app/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      console.log('No autorizado, redirigiendo al login...');
    }
    return Promise.reject(error);
  }
);

export default api;
