import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  Alert, Autocomplete,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { clinicalRecordService } from '../data/clinicalRecordService';
import { patientService } from '../../patients/data/patientService';
import type { Patient } from '../../patients/data/patientTypes';

export const ClinicalRecordImportPage = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [recordType, setRecordType] = useState('');
  const [description, setDescription] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');

  const patientQuery = useQuery({
    queryKey: ['patients-search', patientSearch],
    queryFn: () => patientService.search({ searchTerm: patientSearch || undefined }),
    enabled: patientSearch.length > 0,
  });

  const importMutation = useMutation({
    mutationFn: () =>
      clinicalRecordService.import({
        patientId: patient!.id,
        recordType,
        description,
        recordDate,
        notes,
        files: files.length > 0 ? files : undefined,
      }),
    onSuccess: () => navigate('/clinical-records'),
    onError: () => setError('Error al importar el registro clínico. Verifica los datos e intenta nuevamente.'),
  });

  const patientOptions: Patient[] = patientQuery.data?.patients ?? [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = () => {
    if (!patient) { setError('Debes seleccionar un paciente.'); return; }
    if (!recordType) { setError('Debes seleccionar un tipo de registro.'); return; }
    if (!description.trim()) { setError('Debes ingresar una descripción.'); return; }
    setError('');
    importMutation.mutate();
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/clinical-records')} sx={{ mb: 2 }}>
        Volver a historial clínico
      </Button>

      <Typography variant="h4" sx={{ mb: 3 }}>Importar registro clínico</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
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
                select
                label="Tipo de registro"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                fullWidth
                required
                slotProps={{ select: { native: true } }}
              >
                <option value="">Seleccionar...</option>
                <option value="Análisis">Análisis</option>
                <option value="Diagnóstico">Diagnóstico</option>
                <option value="Receta">Receta</option>
                <option value="Informe">Informe</option>
                <option value="Otro">Otro</option>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                label="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notas adicionales"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
              >
                {files.length > 0 ? `${files.length} archivo(s) seleccionado(s)` : 'Adjuntar archivos'}
                <input type="file" hidden multiple onChange={handleFileChange} />
              </Button>
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
          disabled={importMutation.isPending}
        >
          {importMutation.isPending ? 'Importando...' : 'Importar registro'}
        </Button>
      </Box>
    </Box>
  );
};
