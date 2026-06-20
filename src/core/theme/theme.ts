import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    primary: { main: '#1565C0' },
    secondary: { main: '#26A69A' },
    error: { main: '#E53935' },
    warning: { main: '#FB8C00' },
    success: { main: '#43A047' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { styleOverrides: { root: { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
  },
});
