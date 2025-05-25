import { Link, Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';

const queryClient = new QueryClient();

export function Layout() {
    const { logout } = useAuth();

    return (
        <QueryClientProvider client={queryClient}>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Hotel Manager
                        </Typography>
                        <Button color="inherit" component={Link} to="/">
                            Dashboard
                        </Button>
                        <Button color="inherit" component={Link} to="/rooms">
                            Rooms
                        </Button>
                        <Button color="inherit" component={Link} to="/bookings">
                            Bookings
                        </Button>
                        <Button color="inherit" component={Link} to="/guests">
                            Guests
                        </Button>
                        <Button color="inherit" onClick={logout}>
                            Logout
                        </Button>
                    </Toolbar>
                </AppBar>
                <Container sx={{ mt: 4 }}>
                    <Outlet />
                </Container>
            </Box>
        </QueryClientProvider>
    );
} 