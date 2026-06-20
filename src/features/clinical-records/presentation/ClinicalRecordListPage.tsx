import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Typography, Skeleton, Alert, Chip, Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { clinicalRecordService } from '../data/clinicalRecordService';
import type { ClinicalRecord } from '../data/clinicalRecordTypes';

const recordTypeColor: Record<string, 'info' | 'success' | 'warning' | 'error' | 'primary'> = {
  'Análisis': 'info',
  'Diagnóstico': 'primary',
  'Receta': 'success',
  'Informe': 'warning',
};

export const ClinicalRecordListPage = () => {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');

  const query = useQuery({
    queryKey: ['clinical-records', typeFilter, patientFilter],
    queryFn: () =>
      clinicalRecordService.getAll({
        recordType: typeFilter || undefined,
        patientId: patientFilter ? Number(patientFilter) : undefined,
      }),
  });

  const records: ClinicalRecord[] = query.data ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Historial clínico</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/clinical-records/import')}>
          Importar registro
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          select
          label="Tipo de registro"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 200 }}
          slotProps={{ select: { native: true } }}
        >
          <option value="">Todos</option>
          <option value="Análisis">Análisis</option>
          <option value="Diagnóstico">Diagnóstico</option>
          <option value="Receta">Receta</option>
          <option value="Informe">Informe</option>
          <option value="Otro">Otro</option>
        </TextField>
        <TextField
          label="ID de paciente"
          value={patientFilter}
          onChange={(e) => setPatientFilter(e.target.value)}
          type="number"
          sx={{ minWidth: 200 }}
        />
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

      {!query.isLoading && !query.isError && records.length === 0 && (
        <Alert severity="info">No se encontraron registros clínicos.</Alert>
      )}

      {records.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Paciente</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Notas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.patientName}</TableCell>
                  <TableCell>
                    <Chip
                      label={record.recordType}
                      color={recordTypeColor[record.recordType] ?? 'info'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{record.description}</TableCell>
                  <TableCell>{record.recordDate}</TableCell>
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
