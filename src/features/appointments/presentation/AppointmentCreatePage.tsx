import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, Grid, Autocomplete, MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { appointmentService } from '../data/appointmentService';
import { patientService } from '../../patients/data/patientService';
import type { CreateAppointmentPayload } from '../data/appointmentTypes';
import type { PatientSearchResult } from '../../patients/data/patientTypes';

const APPOINTMENT_TYPES = ['Consulta', 'Control', 'Emergencia'];

export const AppointmentCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  const locationState = location.state as { patientId?: number; patientName?: string } | null;

  const [patient, setPatient] = useState<PatientSearchResult | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [type, setType] = useState('Consulta');
  const [scheduledAt, setScheduledAt] = useState('');
  const [locationField, setLocationField] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedPatientId && locationState?.patientName) {
      setPatient({
        patientId: Number(preselectedPatientId),
        fullName: locationState.patientName,
        dni: '',
        age: 0,
        status: 'Active',
      });
      setPatientSearch(locationState.patientName);
    }
  }, [preselectedPatientId, locationState]);

  const patientQuery = useQuery({
    queryKey: ['patients-search', patientSearch],
    queryFn: () => patientService.search({ searchTerm: patientSearch || undefined }),
    enabled: patientSearch.length > 0 && !patient,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => appointmentService.create(payload),
    onSuccess: () => {
      navigate('/appointments');
    },
    onError: () => setError('Error al crear la cita. Verifica los datos e intenta nuevamente.'),
  });

  const patientOptions: PatientSearchResult[] = patientQuery.data?.patients ?? [];

  const handleSubmit = () => {
    if (!patient) {
      setError('Debes seleccionar un paciente.');
      return;
    }
    if (!scheduledAt) {
      setError('Debes indicar la fecha y hora de la cita.');
      return;
    }
    if (!locationField.trim()) {
      setError('Debes indicar la ubicación.');
      return;
    }
    setError('');

    const isoDate = new Date(scheduledAt).toISOString();

    createMutation.mutate({
      patientId: patient.patientId,
      type,
      scheduledAt: isoDate,
      location: locationField,
      notes,
    });
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/appointments')}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>

      <Typography variant="h4" sx={{ mb: 3 }}>Nueva cita</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Paciente</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              {patient ? (
                <Alert severity="success">
                  Paciente seleccionado: <strong>{patient.fullName}</strong> (DNI: {patient.dni})
                </Alert>
              ) : (
                <Autocomplete
                  options={patientOptions}
                  getOptionLabel={(opt) => `${opt.fullName} - ${opt.dni}`}
                  value={patient}
                  onChange={(_, val) => setPatient(val)}
                  inputValue={patientSearch}
                  onInputChange={(_, val) => setPatientSearch(val)}
                  renderInput={(params) => (
                    <TextField {...params} label="Buscar paciente" required fullWidth />
                  )}
                  noOptionsText={patientSearch ? 'Paciente no encontrado' : 'Escribe para buscar'}
                  slotProps={{ popper: { sx: { zIndex: 1400 } } }}
                />
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Detalles de la cita</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Tipo de cita"
                value={type}
                onChange={(e) => setType(e.target.value)}
                fullWidth
              >
                {APPOINTMENT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Fecha y hora"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Ubicación"
                value={locationField}
                onChange={(e) => setLocationField(e.target.value)}
                fullWidth
                required
                placeholder="e.g. Consultorio 3, Piso 2"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notas"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Observaciones sobre la cita"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => navigate('/appointments')}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createMutation.isPending || !patient}
        >
          {createMutation.isPending ? 'Guardando...' : 'Crear cita'}
        </Button>
      </Box>
    </Box>
  );
};
