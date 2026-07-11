import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  Alert, Autocomplete,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { clinicalRecordService } from '../data/clinicalRecordService';
import { patientService } from '../../patients/data/patientService';
import type { PatientSearchResult } from '../../patients/data/patientTypes';

export const ClinicalRecordCreatePage = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientSearchResult | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const patientQuery = useQuery({
    queryKey: ['patients-search', patientSearch],
    queryFn: () => patientService.search({ searchTerm: patientSearch || undefined }),
    enabled: patientSearch.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      clinicalRecordService.create({
        patientId: patient!.patientId,
        recordDate,
        diagnosis,
        notes,
      }),
    onSuccess: () => navigate('/clinical-records'),
    onError: () => setError('Error al crear el registro clínico. Verifica los datos e intenta nuevamente.'),
  });

  const patientOptions: PatientSearchResult[] = patientQuery.data?.patients ?? [];

  const handleSubmit = () => {
    if (!patient) { setError('Debes seleccionar un paciente.'); return; }
    if (!diagnosis.trim()) { setError('Debes ingresar un diagnóstico.'); return; }
    setError('');
    createMutation.mutate();
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/clinical-records')} sx={{ mb: 2 }}>
        Volver a historial clínico
      </Button>

      <Typography variant="h4" sx={{ mb: 3 }}>Crear registro clínico</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                options={patientOptions}
                getOptionLabel={(opt) => `${opt.fullName} - ${opt.dni}`}
                value={patient}
                onChange={(_, val) => setPatient(val)}
                inputValue={patientSearch}
                onInputChange={(_, val) => setPatientSearch(val)}
                renderInput={(params) => (
                  <TextField {...params} label="Paciente" required fullWidth />
                )}
                noOptionsText={patientSearch ? 'Paciente no encontrado' : 'Escribe para buscar'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Fecha del registro"
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Diagnóstico"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                fullWidth
                required
                multiline
                rows={3}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notas adicionales"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => navigate('/clinical-records')}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Creando...' : 'Crear registro'}
        </Button>
      </Box>
    </Box>
  );
};
