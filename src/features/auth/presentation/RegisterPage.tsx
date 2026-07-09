import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Link, MenuItem } from '@mui/material';
import { useAuth } from '../../../shared/contexts/AuthContext';
import type { UserRole } from '../data/authTypes';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState<UserRole>('TechnicalStaff');
  const [institucion, setInstitucion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await register({ nombre, email, password, rol, institucion: rol === 'TechnicalStaff' ? institucion : undefined });
      navigate('/dashboard');
    } catch {
      setError('Error al registrar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ textAlign: 'center' }} color="primary" gutterBottom>
            MediTrack
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', mb: 3 }} color="text.secondary">
            Crear cuenta de Personal Técnico
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField label="Nombre completo" fullWidth required value={nombre}
              onChange={(e) => setNombre(e.target.value)} sx={{ mb: 2 }} />
            <TextField label="Correo electrónico" type="email" fullWidth required value={email}
              onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
            <TextField label="Contraseña" type="password" fullWidth required value={password}
              onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />
            <TextField label="Confirmar contraseña" type="password" fullWidth required value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} sx={{ mb: 2 }} />

            <TextField select label="Rol" fullWidth required value={rol}
              onChange={(e) => setRol(e.target.value as UserRole)} sx={{ mb: 2 }}>
              <MenuItem value="TechnicalStaff">Personal Técnico</MenuItem>
              <MenuItem value="paciente">Paciente</MenuItem>
            </TextField>

            {rol === 'TechnicalStaff' && (
              <TextField label="Institución / Centro de salud" fullWidth required value={institucion}
                onChange={(e) => setInstitucion(e.target.value)} sx={{ mb: 2 }} />
            )}

            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            ¿Ya tienes cuenta?{' '}
            <Link component={RouterLink} to="/login">Inicia sesión</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
