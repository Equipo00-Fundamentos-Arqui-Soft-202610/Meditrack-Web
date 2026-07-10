import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert,
  Grid, Chip, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { patientService } from '../data/patientService';
import type { FollowUpMedication } from '../../prescriptions/data/followUpMedicationService';

export const MedicationEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const medicationId = Number(id);

  const med = (location.state as FollowUpMedication | null);

  const [dose, setDose] = useState(med?.dose ?? '');
  const [frequencyHours, setFrequencyHours] = useState(med?.frequencyHours ?? 8);
  const [startDate, setStartDate] = useState(med?.startDate?.split('T')[0] ?? '');
  const [endDate, setEndDate] = useState(med?.endDate?.split('T')[0] ?? '');
  const [stockCount, setStockCount] = useState(med?.stockCount ?? 0);
  const [stockAlertThreshold, setStockAlertThreshold] = useState(5);
  const [error, setError] = useState('');

  const updateMutation = useMutation({
    mutationFn: () =>
      patientService.updateMedication(medicationId, {
        dose,
        frequencyHours,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        stockCount,
        stockAlertThreshold,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-medications'] });
      navigate(-1);
    },
    onError: () => setError('Error al actualizar el medicamento.'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => patientService.cancelMedication(medicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-medications'] });
      navigate(-1);
    },
    onError: () => setError('Error al cancelar el medicamento.'),
  });

  if (isNaN(medicationId)) {
    return <Alert severity="error">ID de medicamento inválido.</Alert>;
  }

  if (!med) {
    return <Alert severity="error">No se encontraron datos del medicamento. Vuelve a la página del paciente.</Alert>;
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Volver
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <LocalHospitalIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4">Editar medicamento</Typography>
        {med.isActive ? (
          <Chip label="Activo" color="success" size="small" />
        ) : (
          <Chip label="Cancelado" color="error" size="small" />
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Información del medicamento</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nombre"
                value={med.name}
                fullWidth
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Dosis"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                fullWidth
                required
                placeholder="e.g. 500 mg"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Frecuencia (horas)"
                value={frequencyHours}
                onChange={(e) => setFrequencyHours(Number(e.target.value))}
                fullWidth
                required
                type="number"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Stock actual"
                value={stockCount}
                onChange={(e) => setStockCount(Number(e.target.value))}
                fullWidth
                type="number"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Fecha inicio"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Fecha fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Umbral de alerta"
                value={stockAlertThreshold}
                onChange={(e) => setStockAlertThreshold(Number(e.target.value))}
                fullWidth
                type="number"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dose schedules (read-only display) */}
      {med.schedules.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Horarios de toma</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {med.schedules
                .filter((s) => s.isActive)
                .map((schedule) => (
                  <Chip
                    key={schedule.id}
                    label={schedule.scheduledTime.substring(0, 5)}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))}
            </Box>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<CancelIcon />}
          onClick={() => cancelMutation.mutate()}
          disabled={cancelMutation.isPending || !med.isActive}
        >
          {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar medicamento'}
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending || !med.isActive}
        >
          {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </Box>
    </Box>
  );
};
