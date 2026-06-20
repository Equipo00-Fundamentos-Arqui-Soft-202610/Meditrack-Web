import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Typography, Skeleton, Alert, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { patientService } from '../data/patientService';
import type { Patient } from '../data/patientTypes';

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
    queryFn: () => patientService.search({ searchTerm: debounced || undefined }),
    enabled: true,
  });

  const patients: Patient[] = query.data?.patients ?? [];

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
                <TableCell sx={{ fontWeight: 600 }}>N° Documento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Apellidos y Nombres</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow
                  key={patient.id}
                  hover
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{patient.documentNumber}</TableCell>
                  <TableCell>
                    {patient.lastName} {patient.motherLastName}, {patient.names}
                  </TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
