import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/Layout';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import Guests from './pages/Guests';
import Dashboard from './pages/Dashboard';
import Financial from './pages/Financial';
import Tariffs from './pages/Tariffs';

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="*" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="rooms" element={<Rooms />} />
                    <Route path="bookings" element={<Bookings />} />
                    <Route path="guests" element={<Guests />} />
                    <Route path="financial" element={<Financial />} />
                    <Route path="tariffs" element={<Tariffs />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
