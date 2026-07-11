import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Link } from '@mui/material';
import { useAuth } from '../../../shared/contexts/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ maxWidth: 440, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ textAlign: 'center' }} color="primary" gutterBottom>
            MediTrack
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', mb: 3 }} color="text.secondary">
            Portal de Personal Técnico
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField label="Correo electrónico" type="email" fullWidth required value={email}
              onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
            <TextField label="Contraseña" type="password" fullWidth required value={password}
              onChange={(e) => setPassword(e.target.value)} sx={{ mb: 3 }} />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            ¿No tienes cuenta?{' '}
            <Link component={RouterLink} to="/register">Regístrate aquí</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
