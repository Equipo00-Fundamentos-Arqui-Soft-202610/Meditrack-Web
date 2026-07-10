import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Typography, Skeleton, Alert, Chip, Button, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import { clinicalRecordService } from '../data/clinicalRecordService';
import type { ClinicalRecord } from '../data/clinicalRecordTypes';

const sourceColor: Record<string, 'info' | 'success' | 'warning' | 'primary'> = {
  'manual': 'info',
  'imported': 'success',
  'system': 'primary',
};

export const ClinicalRecordListPage = () => {
  const navigate = useNavigate();
  const [patientIdInput, setPatientIdInput] = useState('');
  const [activePatientId, setActivePatientId] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ['clinical-records', activePatientId],
    queryFn: () => clinicalRecordService.getAll({ patientId: activePatientId! }),
    enabled: activePatientId !== null && activePatientId > 0,
  });

  const records: ClinicalRecord[] = query.data ?? [];

  const handleSearch = () => {
    const num = Number(patientIdInput);
    if (!isNaN(num) && num > 0) {
      setActivePatientId(num);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Historial clínico</Typography>
        <Button
          variant="outlined"
          startIcon={<PeopleIcon />}
          onClick={() => navigate('/patients')}
        >
          Buscar paciente
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Ingresa el <strong>ID interno del paciente</strong> (patientId) para consultar su historial.
        Si no lo conoces, busca al paciente en la sección <strong>Pacientes</strong>.
      </Alert>

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          label="Patient ID"
          value={patientIdInput}
          onChange={(e) => setPatientIdInput(e.target.value)}
          type="number"
          sx={{ minWidth: 200 }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button variant="contained" onClick={handleSearch} disabled={!patientIdInput}>
          Buscar
        </Button>
      </Box>

      {query.isLoading && (
        <Box>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={52} sx={{ mb: 1 }} />
          ))}
        </Box>
      )}

      {query.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar registros clínicos. Verifica que el servicio esté corriendo.
        </Alert>
      )}

      {!query.isLoading && !query.isError && activePatientId !== null && records.length === 0 && (
        <Alert severity="info">
          No se encontraron registros clínicos para el paciente {activePatientId}.
        </Alert>
      )}

      {records.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Diagnóstico</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fuente</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Notas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.recordDate?.split('T')[0]}</TableCell>
                  <TableCell>{record.diagnosis}</TableCell>
                  <TableCell>
                    <Chip
                      label={record.source}
                      color={sourceColor[record.source] ?? 'info'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{record.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
