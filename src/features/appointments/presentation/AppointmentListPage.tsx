import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { appointmentService } from '../data/appointmentService';
import type { Appointment } from '../data/appointmentTypes';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  scheduled: 'warning',
  completed: 'success',
  cancelled: 'error',
};

const TYPE_LABELS: Record<string, string> = {
  Consulta: 'Consulta',
  Control: 'Control',
  Emergencia: 'Emergencia',
};

export const AppointmentListPage = () => {
  const navigate = useNavigate();
  const [patientIdInput, setPatientIdInput] = useState('');
  const [patientId, setPatientId] = useState<number | null>(null);

  const appointmentsQuery = useQuery({
    queryKey: ['appointments', patientId],
    queryFn: () => appointmentService.getByPatientId(patientId!),
    enabled: patientId !== null,
  });

  const handleSearch = () => {
    const id = parseInt(patientIdInput, 10);
    if (!isNaN(id) && id > 0) {
      setPatientId(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const appointments: Appointment[] = appointmentsQuery.data ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Citas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/appointments/new')}
        >
          Nueva cita
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Buscar citas por ID de paciente</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              label="ID del paciente"
              value={patientIdInput}
              onChange={(e) => setPatientIdInput(e.target.value)}
              onKeyDown={handleKeyDown}
              type="number"
              size="small"
              sx={{ width: 200 }}
            />
            <Button variant="contained" onClick={handleSearch} disabled={!patientIdInput}>
              Buscar
            </Button>
          </Box>
        </CardContent>
      </Card>

      {patientId !== null && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Citas del paciente #{patientId}
            </Typography>

            {appointmentsQuery.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error al cargar las citas. Verifica el ID del paciente.
              </Alert>
            )}

            {appointmentsQuery.isLoading && (
              <Typography color="text.secondary">Cargando citas...</Typography>
            )}

            {!appointmentsQuery.isLoading && appointments.length === 0 && (
              <Alert severity="info">No se encontraron citas para este paciente.</Alert>
            )}

            {appointments.length > 0 && (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Ubicación</TableCell>
                      <TableCell>Notas</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Modificable</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.map((apt) => (
                      <TableRow key={apt.id} hover>
                        <TableCell>
                          {new Date(apt.scheduledAt).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>{TYPE_LABELS[apt.type] ?? apt.type}</TableCell>
                        <TableCell>{apt.location}</TableCell>
                        <TableCell>{apt.notes || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={apt.status}
                            color={STATUS_COLORS[apt.status] ?? 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{apt.canBeModified ? 'Sí' : 'No'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
