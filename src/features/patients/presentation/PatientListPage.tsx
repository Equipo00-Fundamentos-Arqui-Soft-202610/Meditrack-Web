import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Typography, Skeleton, Alert, InputAdornment, Button,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { patientService } from '../data/patientService';
import type { PatientSearchResult } from '../data/patientTypes';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export const PatientListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 400);

  const query = useQuery({
    queryKey: ['patients', debounced],
    queryFn: () => patientService.search({ searchTerm: debounced }),
    enabled: debounced.length > 0,
  });

  const patients: PatientSearchResult[] = query.data?.patients ?? [];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Pacientes</Typography>

      <TextField
        fullWidth
        placeholder="Buscar por nombre o número de documento..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      {query.isLoading && (
        <Box>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={52} sx={{ mb: 1 }} />
          ))}
        </Box>
      )}

      {query.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al buscar pacientes. Verifica que el servicio esté corriendo.
        </Alert>
      )}

      {!query.isLoading && !query.isError && patients.length === 0 && (
        <Alert severity="info">
          {debounced
            ? 'No se encontraron pacientes con ese criterio de búsqueda.'
            : 'Ingresa un nombre o número de documento para buscar pacientes.'}
        </Alert>
      )}

      {patients.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nombre completo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>DNI</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Edad</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.patientId} hover>
                  <TableCell>{patient.fullName}</TableCell>
                  <TableCell>{patient.dni}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>
                    <Chip
                      label={patient.status}
                      color={patient.status === 'Active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/patients/${patient.patientId}`, { state: patient })}
                    >
                      Ver más
                    </Button>
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
