export interface User {
    id: number;
    email: string;
    is_active: boolean;
    is_superuser: boolean;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    is_superuser?: boolean;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
} 