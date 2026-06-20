import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import type { CreatePrescriptionPayload, MedicationCatalogItem } from '../data/prescriptionTypes';
import type { Patient } from '../../patients/data/patientTypes';

interface MedicationEntry {
  medicationCatalogId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

const emptyEntry = (): MedicationEntry => ({
  medicationCatalogId: 0,
  medicationName: '',
  dosage: '',
  frequency: '',
  duration: '',
  notes: '',
});

export const PrescriptionCreatePage = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState<MedicationEntry[]>([emptyEntry()]);
  const [error, setError] = useState('');

  const catalogQuery = useQuery({
    queryKey: ['medication-catalog'],
    queryFn: () => prescriptionService.getMedicationCatalog(),
  });

  const patientQuery = useQuery({
    queryKey: ['patients-search', patientSearch],
    queryFn: () => patientService.search({ searchTerm: patientSearch || undefined }),
    enabled: patientSearch.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePrescriptionPayload) => prescriptionService.create(payload),
    onSuccess: () => navigate('/prescriptions'),
    onError: () => setError('Error al crear la prescripción. Verifica los datos e intenta nuevamente.'),
  });

  const catalog: MedicationCatalogItem[] = catalogQuery.data ?? [];
  const patientOptions: Patient[] = patientQuery.data?.patients ?? [];

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

  const handleCatalogSelect = (index: number, item: MedicationCatalogItem | null) => {
    if (item) {
      setMedications((prev) =>
        prev.map((med, i) =>
          i === index
            ? {
                ...med,
                medicationCatalogId: item.id,
                medicationName: `${item.name} ${item.concentration} - ${item.pharmaceuticalForm}`,
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
    if (!expiryDate) {
      setError('Debes indicar la fecha de vencimiento.');
      return;
    }
    const validMeds = medications.filter((m) => m.medicationCatalogId > 0);
    if (validMeds.length === 0) {
      setError('Debes agregar al menos un medicamento.');
      return;
    }
    setError('');
    createMutation.mutate({
      patientId: patient.id,
      issueDate,
      expiryDate,
      notes,
      medications: validMeds.map((m) => ({
        medicationCatalogId: m.medicationCatalogId,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        notes: m.notes,
      })),
    });
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/prescriptions')} sx={{ mb: 2 }}>
        Volver a prescripciones
      </Button>

      <Typography variant="h4" sx={{ mb: 3 }}>Nueva prescripción</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Datos generales</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={patientOptions}
                getOptionLabel={(opt) => `${opt.names} ${opt.lastName} - ${opt.documentNumber}`}
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Fecha de emisión"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Fecha de vencimiento"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notas"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={2}
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
                position: 'relative',
              }}
            >
              <IconButton
                size="small"
                onClick={() => handleRemoveMedication(index)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                disabled={medications.length === 1}
              >
                <DeleteIcon />
              </IconButton>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Autocomplete
                    options={catalog}
                    getOptionLabel={(opt) => `${opt.name} ${opt.concentration} - ${opt.pharmaceuticalForm}`}
                    onChange={(_, val) => handleCatalogSelect(index, val)}
                    renderInput={(params) => (
                      <TextField {...params} label="Medicamento" required fullWidth />
                    )}
                    noOptionsText="No se encontraron medicamentos"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Dosis"
                    value={med.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    fullWidth
                    placeholder="e.g. 500 mg"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Frecuencia"
                    value={med.frequency}
                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    fullWidth
                    placeholder="e.g. Cada 8 horas"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Duración"
                    value={med.duration}
                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    fullWidth
                    placeholder="e.g. 7 días"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Notas"
                    value={med.notes}
                    onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                    fullWidth
                    placeholder="Indicaciones adicionales"
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => navigate('/prescriptions')}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Guardando...' : 'Guardar prescripción'}
        </Button>
      </Box>
    </Box>
  );
};
