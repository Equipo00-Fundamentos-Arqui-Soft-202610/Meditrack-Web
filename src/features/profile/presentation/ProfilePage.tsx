import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button, Alert,
} from '@mui/material';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { profileService } from '../data/profileService';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [institucion, setInstitucion] = useState(user?.institucion ?? '');
  const [success, setSuccess] = useState('');

  const updateMutation = useMutation({
    mutationFn: () => profileService.update({ nombre, email, institucion: institucion || undefined }),
    onSuccess: () => setSuccess('Perfil actualizado correctamente.'),
    onError: () => setSuccess(''),
  });

  const handleSubmit = () => {
    setSuccess('');
    updateMutation.mutate();
  };

  if (!user) return null;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Mi perfil</Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Información de la cuenta</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Nombre completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Institución"
                    value={institucion}
                    onChange={(e) => setInstitucion(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Rol"
                    value={user.rol === 'TechnicalStaff' || user.rol === 'Doctor' ? 'Personal Técnico' : 'Paciente'}
                    fullWidth
                    slotProps={{ input: { readOnly: true } }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button variant="outlined" color="error" onClick={logout}>
                  Cerrar sesión
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Resumen de actividad</Typography>
              <Typography variant="body2" color="text.secondary">
                Aquí podrás ver tu actividad reciente en el sistema.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
