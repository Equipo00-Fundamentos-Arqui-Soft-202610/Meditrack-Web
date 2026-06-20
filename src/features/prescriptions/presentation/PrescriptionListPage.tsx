import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Typography, Skeleton, Alert, Chip, Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { prescriptionService } from '../data/prescriptionService';
import type { Prescription } from '../data/prescriptionTypes';

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  Activa: 'success',
  Completada: 'info',
  Cancelada: 'error',
  Vencida: 'warning',
};

export const PrescriptionListPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const query = useQuery({
    queryKey: ['prescriptions', statusFilter],
    queryFn: () => prescriptionService.getAll({ status: statusFilter || undefined }),
  });

  const prescriptions: Prescription[] = query.data ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Prescripciones</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/prescriptions/new')}>
          Nueva prescripción
        </Button>
      </Box>

      <TextField
        select
        label="Filtrar por estado"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        sx={{ minWidth: 200, mb: 3 }}
        slotProps={{ select: { native: true } }}
      >
        <option value="">Todos los estados</option>
        <option value="Activa">Activa</option>
        <option value="Completada">Completada</option>
        <option value="Cancelada">Cancelada</option>
        <option value="Vencida">Vencida</option>
      </TextField>

      {query.isLoading && (
        <Box>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={52} sx={{ mb: 1 }} />
          ))}
        </Box>
      )}

      {query.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar prescripciones. Verifica que el servicio esté corriendo.
        </Alert>
      )}

      {!query.isLoading && !query.isError && prescriptions.length === 0 && (
        <Alert severity="info">No se encontraron prescripciones.</Alert>
      )}

      {prescriptions.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Paciente</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Médico</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha emisión</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vencimiento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow
                  key={prescription.id}
                  hover
                  onClick={() => navigate(`/prescriptions/${prescription.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{prescription.patientName}</TableCell>
                  <TableCell>{prescription.doctorName}</TableCell>
                  <TableCell>{prescription.issueDate}</TableCell>
                  <TableCell>{prescription.expiryDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={prescription.status}
                      color={statusColor[prescription.status] ?? 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
