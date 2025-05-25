import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    requireSuperuser?: boolean;
}

export function ProtectedRoute({ children, requireSuperuser = false }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireSuperuser && !user?.is_superuser) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
} 