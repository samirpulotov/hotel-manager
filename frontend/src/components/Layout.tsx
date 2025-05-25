import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import Rooms from '../pages/Rooms';
import Bookings from '../pages/Bookings';
import Guests from '../pages/Guests';
import Dashboard from '../pages/Dashboard';
import Financial from '../pages/Financial';
import Tariffs from '../pages/Tariffs';
import { Dashboard as DashboardIcon, Hotel as HotelIcon, People as PeopleIcon, EventNote as EventNoteIcon, AttachMoney as AttachMoneyIcon, CalendarMonth as CalendarMonthIcon, PriceChange as PriceChangeIcon } from '@mui/icons-material';

const queryClient = new QueryClient();

const menuItems = [
  { text: 'Дашборд', icon: <DashboardIcon />, path: '/' },
  { text: 'Номера', icon: <HotelIcon />, path: '/rooms' },
  { text: 'Бронирования', icon: <CalendarMonthIcon />, path: '/bookings' },
  { text: 'Гости', icon: <PeopleIcon />, path: '/guests' },
  { text: 'Финансы', icon: <AttachMoneyIcon />, path: '/financial' },
  { text: 'Тарифы', icon: <PriceChangeIcon />, path: '/tariffs' },
];

export function Layout() {
    const { logout } = useAuth();

    return (
        <QueryClientProvider client={queryClient}>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Postnicken
                        </Typography>
                        {menuItems.map((item) => (
                            <Button color="inherit" key={item.path} component={Link} to={item.path}>
                                {item.text}
                            </Button>
                        ))}
                        <Button color="inherit" onClick={logout}>
                            Выйти
                        </Button>
                    </Toolbar>
                </AppBar>
                <Container sx={{ mt: 4 }}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/rooms" element={<Rooms />} />
                        <Route path="/bookings" element={<Bookings />} />
                        <Route path="/guests" element={<Guests />} />
                        <Route path="/financial" element={<Financial />} />
                        <Route path="/tariffs" element={<Tariffs />} />
                    </Routes>
                </Container>
            </Box>
        </QueryClientProvider>
    );
} 