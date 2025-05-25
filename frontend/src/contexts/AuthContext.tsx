import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginCredentials, RegisterCredentials, AuthState } from '../types/auth';
import { authApi } from '../api/auth';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;
// Warning time in milliseconds (1 minute before timeout)
const WARNING_TIME = 60 * 1000;
// Token refresh interval in milliseconds (25 minutes)
const TOKEN_REFRESH_INTERVAL = 25 * 60 * 1000;

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(() => {
        const token = localStorage.getItem('token');
        return {
            user: null,
            token,
            isAuthenticated: !!token,
        };
    });
    const [showWarning, setShowWarning] = useState(false);
    const navigate = useNavigate();

    // Function to refresh the token
    const refreshToken = useCallback(async () => {
        try {
            console.log('Refreshing token...');
            const response = await authApi.refreshToken();
            console.log('Token refresh response:', response);
            const newToken = response.access_token;
            localStorage.setItem('token', newToken);
            setState(prev => ({
                ...prev,
                token: newToken,
                isAuthenticated: true,
            }));
            return newToken;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            logout();
            return null;
        }
    }, []);

    // Function to reset the session timer
    const resetSessionTimer = useCallback(() => {
        // Clear any existing timers
        if (window.sessionTimer) {
            clearTimeout(window.sessionTimer);
        }
        if (window.warningTimer) {
            clearTimeout(window.warningTimer);
        }
        if (window.refreshTimer) {
            clearTimeout(window.refreshTimer);
        }

        // Set new timers if user is authenticated
        if (state.isAuthenticated) {
            // Set warning timer
            window.warningTimer = setTimeout(() => {
                setShowWarning(true);
            }, SESSION_TIMEOUT - WARNING_TIME);

            // Set logout timer
            window.sessionTimer = setTimeout(() => {
                logout();
            }, SESSION_TIMEOUT);

            // Set token refresh timer
            window.refreshTimer = setTimeout(() => {
                refreshToken();
            }, TOKEN_REFRESH_INTERVAL);
        }
    }, [state.isAuthenticated, refreshToken]);

    // Function to handle user activity
    const handleUserActivity = useCallback(() => {
        if (state.isAuthenticated) {
            resetSessionTimer();
        }
    }, [state.isAuthenticated, resetSessionTimer]);

    // Add event listeners for user activity
    useEffect(() => {
        if (state.isAuthenticated) {
            const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
            events.forEach(event => {
                window.addEventListener(event, handleUserActivity);
            });

            // Initial timer setup
            resetSessionTimer();

            return () => {
                events.forEach(event => {
                    window.removeEventListener(event, handleUserActivity);
                });
                if (window.sessionTimer) {
                    clearTimeout(window.sessionTimer);
                }
                if (window.warningTimer) {
                    clearTimeout(window.warningTimer);
                }
                if (window.refreshTimer) {
                    clearTimeout(window.refreshTimer);
                }
            };
        }
    }, [state.isAuthenticated, handleUserActivity, resetSessionTimer]);

    // Initialize authentication state
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    console.log('Initializing auth with token...');
                    // First try to refresh the token
                    const newToken = await refreshToken();
                    if (!newToken) {
                        throw new Error('Failed to refresh token');
                    }
                    
                    // Then get the user data with the new token
                    console.log('Getting current user...');
                    const user = await authApi.getCurrentUser(newToken);
                    console.log('Current user:', user);
                    setState({
                        user,
                        token: newToken,
                        isAuthenticated: true,
                    });
                } catch (error) {
                    console.error('Failed to initialize auth:', error);
                    localStorage.removeItem('token');
                    setState({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                    });
                }
            }
        };

        initializeAuth();
    }, [refreshToken]);

    const login = async (credentials: LoginCredentials) => {
        console.log('Starting login process...');
        const response = await authApi.login(credentials);
        console.log('Login response:', response);
        localStorage.setItem('token', response.access_token);
        console.log('Token stored in localStorage');
        const user = await authApi.getCurrentUser(response.access_token);
        console.log('Current user data:', user);
        setState({
            user,
            token: response.access_token,
            isAuthenticated: true,
        });
        console.log('Auth state updated, navigating to home...');
        navigate('/');
    };

    const register = async (credentials: RegisterCredentials) => {
        await authApi.register(credentials);
        await login({ username: credentials.email, password: credentials.password });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setState({
            user: null,
            token: null,
            isAuthenticated: false,
        });
        setShowWarning(false);
        navigate('/login');
    };

    const handleStayLoggedIn = () => {
        setShowWarning(false);
        resetSessionTimer();
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout }}>
            {children}
            <Dialog open={showWarning} onClose={handleStayLoggedIn}>
                <DialogTitle>Session Timeout Warning</DialogTitle>
                <DialogContent>
                    <Typography>
                        Your session will expire in 1 minute. Would you like to stay logged in?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={logout} color="error">
                        Logout
                    </Button>
                    <Button onClick={handleStayLoggedIn} color="primary" autoFocus>
                        Stay Logged In
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Add TypeScript declarations for the window object
declare global {
    interface Window {
        sessionTimer?: number;
        warningTimer?: number;
        refreshTimer?: number;
    }
} 