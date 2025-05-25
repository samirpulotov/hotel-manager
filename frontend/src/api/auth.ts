import axios, { AxiosError } from 'axios';
import type { LoginCredentials, RegisterCredentials, User } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
console.log('API_URL from env:', import.meta.env.VITE_API_URL);
console.log('Using API_URL:', API_URL);

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

// Add request interceptor to log all requests
api.interceptors.request.use(
    (config) => {
        const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
        console.log('Making request to:', fullUrl);
        console.log('Request config:', {
            method: config.method,
            headers: config.headers,
            data: config.data
        });
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
        console.log('Making login request to:', `${API_URL}/auth/login`);
        console.log('With credentials:', credentials);
        const params = new URLSearchParams();
        params.append('username', credentials.username);
        params.append('password', credentials.password);
        
        try {
            const response = await api.post('/auth/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            console.log('Login response:', response.data);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Login error:', error);
                console.error('Error details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    config: {
                        url: error.config?.url,
                        method: error.config?.method,
                        headers: error.config?.headers,
                        data: error.config?.data
                    }
                });
            }
            throw error;
        }
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