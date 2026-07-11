import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Typography, Skeleton, Alert, Button, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import { patientService } from '../../patients/data/patientService';
import type { PatientSearchResult } from '../../patients/data/patientTypes';

export const ClinicalRecordListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const searchQuery = useQuery({
    queryKey: ['patients-clinical-search', debouncedSearch],
    queryFn: () => patientService.search({ searchTerm: debouncedSearch }),
    enabled: debouncedSearch.length > 0,
  });

  const patients: PatientSearchResult[] = searchQuery.data?.patients ?? [];

  const handleSearch = useCallback(() => {
    const val = searchTerm.trim();
    if (val.length > 0) setDebouncedSearch(val);
  }, [searchTerm]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Historial clinico</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/clinical-records/new')}
          >
            Crear registro
          </Button>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/clinical-records/import')}
          >
            Importar CSV
          </Button>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
          Buscar paciente por nombre o documento
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            placeholder="Ej: 12345678 o Juan Perez"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flex: 1 }}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button variant="contained" onClick={handleSearch} disabled={!searchTerm.trim()}>
            Buscar
          </Button>
        </Box>
      </Paper>

      {searchQuery.isLoading && (
        <Box>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 1 }} />
          ))}
        </Box>
      )}

      {searchQuery.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al buscar pacientes. Verifica que el servicio este corriendo.
        </Alert>
      )}

      {!searchQuery.isLoading && !searchQuery.isError && debouncedSearch && patients.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No se encontraron pacientes con el termino "<strong>{debouncedSearch}</strong>".
        </Alert>
      )}

      {!searchQuery.isLoading && !searchQuery.isError && !debouncedSearch && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Ingresa el <strong>nombre</strong> o <strong>numero de documento (DNI)</strong> de un paciente para consultar su historial clinico.
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
                <TableCell sx={{ fontWeight: 600 }} align="right">Accion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.patientId} hover>
                  <TableCell>{p.fullName}</TableCell>
                  <TableCell>{p.dni ?? '—'}</TableCell>
                  <TableCell>{p.age ?? '—'}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/clinical-records/patient/${p.patientId}`, {
                        state: { patient: p },
                      })}
                    >
                      Ver historial clinico
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
