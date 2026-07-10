import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  Alert, IconButton, Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { prescriptionService } from '../data/prescriptionService';
import { patientService } from '../../patients/data/patientService';
import { useAuth } from '../../../shared/contexts/AuthContext';
import type { CreatePrescriptionPayload, MedicationCatalogItem } from '../data/prescriptionTypes';
import type { PatientSearchResult } from '../../patients/data/patientTypes';

interface MedicationEntry {
  catalogId: number;
  catalogName: string;
  dose: string;
  frequencyHours: number;
  startDate: string;
  endDate: string;
  stockCount: number;
  stockAlertThreshold: number;
  schedules: string[];
}

const emptyEntry = (): MedicationEntry => ({
  catalogId: 0,
  catalogName: '',
  dose: '',
  frequencyHours: 8,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  stockCount: 30,
  stockAlertThreshold: 5,
  schedules: ['08:00'],
});

export const PrescriptionCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  const locationState = location.state as { patientId?: number; patientName?: string } | null;
  const { userId } = useAuth();

  const [patient, setPatient] = useState<PatientSearchResult | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState<MedicationEntry[]>([emptyEntry()]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedPatientId && locationState?.patientName) {
      setPatient({
        patientId: Number(preselectedPatientId),
        fullName: locationState.patientName,
        email: '',
        dni: null,
        age: null,
      });
      setPatientSearch(locationState.patientName);
    }
  }, [preselectedPatientId, locationState]);

  const catalogQuery = useQuery({
    queryKey: ['medication-catalog'],
    queryFn: () => prescriptionService.getMedicationCatalog(),
  });

  const patientQuery = useQuery({
    queryKey: ['patients-search', patientSearch],
    queryFn: () => patientService.search({ searchTerm: patientSearch || undefined }),
    enabled: patientSearch.length > 0 && !patient,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePrescriptionPayload) => prescriptionService.create(payload),
    onSuccess: () => {
      if (patient) {
        navigate(`/patients/${patient.patientId}`, { state: patient });
      } else {
        navigate('/patients');
      }
    },
    onError: () => setError('Error al crear la prescripción. Verifica los datos e intenta nuevamente.'),
  });

  const catalog: MedicationCatalogItem[] = catalogQuery.data ?? [];
  const patientOptions: PatientSearchResult[] = patientQuery.data?.patients ?? [];

  const handleAddMedication = () => {
    setMedications((prev) => [...prev, emptyEntry()]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index: number, field: keyof MedicationEntry, value: string | number) => {
    setMedications((prev) =>
      prev.map((med, i) =>
        i === index ? { ...med, [field]: value } : med,
      ),
    );
  };

  const handleAddSchedule = (medIndex: number) => {
    setMedications((prev) =>
      prev.map((med, i) =>
        i === medIndex ? { ...med, schedules: [...med.schedules, '12:00'] } : med,
      ),
    );
  };

  const handleRemoveSchedule = (medIndex: number, schedIndex: number) => {
    setMedications((prev) =>
      prev.map((med, i) =>
        i === medIndex
          ? { ...med, schedules: med.schedules.filter((_, j) => j !== schedIndex) }
          : med,
      ),
    );
  };

  const handleScheduleChange = (medIndex: number, schedIndex: number, value: string) => {
    setMedications((prev) =>
      prev.map((med, i) =>
        i === medIndex
          ? {
              ...med,
              schedules: med.schedules.map((s, j) => (j === schedIndex ? value : s)),
            }
          : med,
      ),
    );
  };

  const handleCatalogSelect = (index: number, item: MedicationCatalogItem | null) => {
    if (item) {
      setMedications((prev) =>
        prev.map((med, i) =>
          i === index
            ? {
                ...med,
                catalogId: item.id,
                catalogName: `${item.officialName} (${item.category})`,
              }
            : med,
        ),
      );
    }
  };

  const handleSubmit = () => {
    if (!patient) {
      setError('Debes seleccionar un paciente.');
      return;
    }
    if (userId == null) {
      setError('No se pudo identificar al usuario técnico.');
      return;
    }
    const validMeds = medications.filter((m) => m.catalogId > 0);
    if (validMeds.length === 0) {
      setError('Debes agregar al menos un medicamento del catálogo.');
      return;
    }
    setError('');

    const payload: CreatePrescriptionPayload = {
      patientId: patient.patientId,
      technicalStaffId: userId,
      notes,
      medications: validMeds.map((m) => ({
        catalogId: m.catalogId,
        dose: m.dose,
        frequencyHours: m.frequencyHours,
        startDate: m.startDate || new Date().toISOString(),
        endDate: m.endDate || undefined,
        stockCount: m.stockCount,
        stockAlertThreshold: m.stockAlertThreshold,
        doseSchedules: m.schedules.map((s) => ({ scheduledTime: `${s}:00` })),
      })),
    };
    createMutation.mutate(payload);
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => patient ? navigate(`/patients/${patient.patientId}`, { state: patient }) : navigate('/patients')}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>

      <Typography variant="h4" sx={{ mb: 3 }}>Nueva prescripción</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Paciente</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              {patient ? (
                <Alert severity="success" sx={{ mb: 1 }}>
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
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notas generales"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Notas sobre la prescripción"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Medicamentos</Typography>
            <Button startIcon={<AddIcon />} onClick={handleAddMedication}>
              Agregar
            </Button>
          </Box>

          {medications.map((med, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                mb: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Medicamento #{index + 1}</Typography>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveMedication(index)}
                  disabled={medications.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Autocomplete
                    options={catalog}
                    getOptionLabel={(opt) => `${opt.officialName} (${opt.category})`}
                    onChange={(_, val) => handleCatalogSelect(index, val)}
                    renderInput={(params) => (
                      <TextField {...params} label="Medicamento del catálogo" required fullWidth />
                    )}
                    noOptionsText="No se encontraron medicamentos"
                    slotProps={{ popper: { sx: { zIndex: 1400 } } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Dosis"
                    value={med.dose}
                    onChange={(e) => handleMedicationChange(index, 'dose', e.target.value)}
                    fullWidth
                    placeholder="e.g. 500 mg"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Frecuencia (horas)"
                    value={med.frequencyHours}
                    onChange={(e) => handleMedicationChange(index, 'frequencyHours', Number(e.target.value))}
                    fullWidth
                    type="number"
                    placeholder="e.g. 8"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Fecha inicio"
                    type="date"
                    value={med.startDate}
                    onChange={(e) => handleMedicationChange(index, 'startDate', e.target.value)}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Fecha fin"
                    type="date"
                    value={med.endDate}
                    onChange={(e) => handleMedicationChange(index, 'endDate', e.target.value)}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Stock inicial"
                    value={med.stockCount}
                    onChange={(e) => handleMedicationChange(index, 'stockCount', Number(e.target.value))}
                    fullWidth
                    type="number"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">Horarios de toma</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={() => handleAddSchedule(index)}>
                      Agregar horario
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    {med.schedules.map((sched, sIdx) => (
                      <Box key={sIdx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TextField
                          type="time"
                          size="small"
                          value={sched}
                          onChange={(e) => handleScheduleChange(index, sIdx, e.target.value)}
                          slotProps={{ inputLabel: { shrink: true } }}
                          sx={{ width: 130 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveSchedule(index, sIdx)}
                          disabled={med.schedules.length <= 1}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={() => patient ? navigate(`/patients/${patient.patientId}`, { state: patient }) : navigate('/patients')}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createMutation.isPending || !patient}
        >
          {createMutation.isPending ? 'Guardando...' : 'Guardar prescripción'}
        </Button>
      </Box>
    </Box>
  );
};
