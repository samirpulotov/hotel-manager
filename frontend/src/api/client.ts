import axios from 'axios';

const client = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token in all requests
client.interceptors.request.use(
  (config) => {
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