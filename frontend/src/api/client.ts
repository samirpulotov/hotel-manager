import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://185.185.70.103';
console.log('Client API_URL:', API_URL);

const client = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token in all requests
client.interceptors.request.use(
  (config) => {
    console.log('Client making request to:', `${config.baseURL}${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client; 