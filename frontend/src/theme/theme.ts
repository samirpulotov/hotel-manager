import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f7f9fb',
      paper: '#fff',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
});

export default theme; 