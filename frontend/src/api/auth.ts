import axios from 'axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create a separate axios instance for refresh token requests
const refreshAxios = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include token
refreshAxios.interceptors.request.use(
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

// Create the main axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Track if a refresh is in progress
let isRefreshing = false;
// Store subscribers for failed requests
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

// Process the queue of failed requests
const processQueue = (error: any = null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// Add request interceptor to include token
api.interceptors.request.use(
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

// Add response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is not 401 or the request has already been retried, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // If a refresh is already in progress, queue this request
        if (isRefreshing) {
            try {
                const token = await new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                });
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            } catch (err) {
                return Promise.reject(err);
            }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            console.log('Attempting to refresh token...');
            const response = await refreshAxios.post('/auth/refresh');
            const newToken = response.data.access_token;
            console.log('Token refresh successful');
            
            localStorage.setItem('token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            processQueue(null, newToken);
            return api(originalRequest);
        } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            processQueue(refreshError, null);
            localStorage.removeItem('token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export const authApi = {
    login: async (credentials: LoginCredentials) => {
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        
        const response = await api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    register: async (credentials: RegisterCredentials) => {
        const response = await api.post('/auth/register', credentials);
        return response.data;
    },

    getCurrentUser: async (token?: string): Promise<User> => {
        console.log('Getting current user with token:', token);
        const response = await api.get('/users/me', {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        console.log('Current user response:', response.data);
        return response.data;
    },

    refreshToken: async () => {
        console.log('Calling refresh token endpoint...');
        const response = await refreshAxios.post('/auth/refresh');
        console.log('Refresh token response:', response.data);
        return response.data;
    },
}; 