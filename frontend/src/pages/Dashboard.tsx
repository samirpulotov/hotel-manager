import { Paper, Typography, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  totalBookings: number;
  activeGuests: number;
}

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/dashboard/stats');
      return response.data;
    },
  });

  const StatCard = ({ title, value }: { title: string; value: number | undefined }) => (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: 140,
        bgcolor: 'primary.light',
        color: 'primary.contrastText',
      }}
    >
      <Typography component="h2" variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography component="p" variant="h4">
        {isLoading ? '...' : value}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Панель управления
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        <StatCard title="Всего номеров" value={stats?.totalRooms} />
        <StatCard title="Занятые номера" value={stats?.occupiedRooms} />
        <StatCard title="Бронирования" value={stats?.totalBookings} />
        <StatCard title="Активные гости" value={stats?.activeGuests} />
      </Box>
    </Box>
  );
};

export default Dashboard; 