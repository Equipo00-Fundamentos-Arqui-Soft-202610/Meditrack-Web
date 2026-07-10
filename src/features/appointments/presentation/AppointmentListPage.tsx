import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Typography, Skeleton, Alert, Button, InputAdornment, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import { patientService } from '../../patients/data/patientService';
import { appointmentService } from '../data/appointmentService';
import type { PatientSearchResult } from '../../patients/data/patientTypes';
import type { Appointment } from '../data/appointmentTypes';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  scheduled: 'warning',
  completed: 'success',
  cancelled: 'error',
};

const TYPE_LABELS: Record<string, string> = {
  Consulta: 'Consulta',
  Control: 'Control',
  Emergencia: 'Emergencia',
};

export const AppointmentListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);

  const searchQuery = useQuery({
    queryKey: ['patients-appointment-search', debouncedSearch],
    queryFn: () => patientService.search({ searchTerm: debouncedSearch }),
    enabled: debouncedSearch.length > 0 && !selectedPatient,
  });

  const appointmentsQuery = useQuery({
    queryKey: ['appointments', selectedPatient?.patientId],
    queryFn: () => appointmentService.getByPatientId(selectedPatient!.patientId),
    enabled: selectedPatient !== null,
  });

  const patients: PatientSearchResult[] = searchQuery.data?.patients ?? [];
  const appointments: Appointment[] = appointmentsQuery.data ?? [];

  const handleSearch = useCallback(() => {
    const val = searchTerm.trim();
    if (val.length > 0) setDebouncedSearch(val);
  }, [searchTerm]);

  const handleSelectPatient = (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setDebouncedSearch('');
    setSearchTerm('');
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Citas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/appointments/new')}
        >
          Nueva cita
        </Button>
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

      {!searchQuery.isLoading && !searchQuery.isError && !debouncedSearch && !selectedPatient && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Ingresa el <strong>nombre</strong> o <strong>numero de documento (DNI)</strong> de un paciente para ver sus citas.
        </Alert>
      )}

      {!selectedPatient && patients.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nombre completo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>DNI</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Edad</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Accion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.patientId} hover>
                  <TableCell>{p.fullName}</TableCell>
                  <TableCell>{p.dni}</TableCell>
                  <TableCell>{p.age}</TableCell>
                  <TableCell>
                    <Chip
                      label={p.status === 'Active' ? 'Activo' : p.status === 'Inactive' ? 'Inactivo' : p.status}
                      color={p.status === 'Active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CalendarMonthIcon />}
                      onClick={() => handleSelectPatient(p)}
                    >
                      Ver citas
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedPatient && (
        <Box>
          <Paper variant="outlined" sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Citas de: {selectedPatient.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                DNI: {selectedPatient.dni} | Edad: {selectedPatient.age} anios
              </Typography>
            </Box>
            <Button variant="outlined" size="small" onClick={handleClearPatient}>
              Cambiar paciente
            </Button>
          </Paper>

          {appointmentsQuery.isLoading && (
            <Box>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 1 }} />
              ))}
            </Box>
          )}

          {appointmentsQuery.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error al cargar las citas. Verifica que el servicio este corriendo.
            </Alert>
          )}

          {!appointmentsQuery.isLoading && !appointmentsQuery.isError && appointments.length === 0 && (
            <Alert severity="info">
              No se encontraron citas para este paciente.
            </Alert>
          )}

          {appointments.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ubicacion</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Notas</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Modificable</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((apt) => (
                    <TableRow key={apt.id} hover>
                      <TableCell>
                        {new Date(apt.scheduledAt).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>{TYPE_LABELS[apt.type] ?? apt.type}</TableCell>
                      <TableCell>{apt.location}</TableCell>
                      <TableCell>{apt.notes || '--'}</TableCell>
                      <TableCell>
                        <Chip
                          label={apt.status}
                          color={STATUS_COLORS[apt.status] ?? 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{apt.canBeModified ? 'Si' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
};
