import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Skeleton, Alert, Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { patientService } from '../data/patientService';

const today = new Date();
const from = new Date(today.getTime() - 30 * 86400000).toISOString().split('T')[0];
const to = today.toISOString().split('T')[0];

export const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = Number(id);

  const patientQuery = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientService.getById(patientId),
    enabled: !isNaN(patientId),
  });

  const adherenceQuery = useQuery({
    queryKey: ['adherence-history', patientId, from, to],
    queryFn: () => patientService.getAdherenceHistory(patientId, from, to),
    enabled: !isNaN(patientId),
  });

  const appointmentsQuery = useQuery({
    queryKey: ['patient-appointments', patientId, from, to],
    queryFn: () => patientService.getAppointments(patientId, from, to),
    enabled: !isNaN(patientId),
  });

  const loading = patientQuery.isLoading;
  const error = patientQuery.isError;

  if (isNaN(patientId)) {
    return <Alert severity="error">ID de paciente inválido.</Alert>;
  }

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={300} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/patients')} sx={{ mb: 2 }}>
          Volver
        </Button>
        <Alert severity="error">
          Error al cargar la información del paciente. Verifica que el servicio esté corriendo.
        </Alert>
      </Box>
    );
  }

  const patient = patientQuery.data;
  if (!patient) return null;

  const adherenceData = Array.isArray(adherenceQuery.data) ? adherenceQuery.data : [];
  const appointments = Array.isArray(appointmentsQuery.data) ? appointmentsQuery.data : [];

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/patients')} sx={{ mb: 2 }}>
        Volver a pacientes
      </Button>

      <Typography variant="h4" sx={{ mb: 3 }}>
        {patient.names} {patient.lastName} {patient.motherLastName}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Información general</Typography>
              <Grid container spacing={1}>
                {[
                  { label: 'N° Documento', value: patient.documentNumber },
                  { label: 'Fecha de nacimiento', value: patient.dateOfBirth },
                  { label: 'Género', value: patient.gender },
                  { label: 'Teléfono', value: patient.phone },
                  { label: 'Email', value: patient.email },
                  { label: 'Dirección', value: patient.address },
                ].map((row) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={row.label}>
                    <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                    <Typography variant="body1">{row.value}</Typography>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Adherencia (últimos 30 días)</Typography>
              {adherenceQuery.isLoading ? (
                <Skeleton variant="rounded" height={200} />
              ) : adherenceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={adherenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="percentage" stroke="#1565C0" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sin datos de adherencia disponibles.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Citas registradas</Typography>
          {appointmentsQuery.isLoading ? (
            <Skeleton variant="rounded" height={200} />
          ) : appointments.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Motivo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((appt) => (
                    <TableRow key={appt.id}>
                      <TableCell>{appt.date}</TableCell>
                      <TableCell>{appt.type}</TableCell>
                      <TableCell>{appt.reason}</TableCell>
                      <TableCell>
                        <Chip
                          label={appt.status}
                          color={appt.status === 'Confirmada' ? 'success' : appt.status === 'Cancelada' ? 'error' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No se encontraron citas en los últimos 30 días.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
