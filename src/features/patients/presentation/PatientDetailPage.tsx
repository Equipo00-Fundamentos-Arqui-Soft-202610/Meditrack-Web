import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Skeleton, Alert, Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { clinicalRecordService } from '../../clinical-records/data/clinicalRecordService';
import type { PatientSearchResult } from '../data/patientTypes';
import type { ClinicalRecord } from '../../clinical-records/data/clinicalRecordTypes';

export const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const patientId = Number(id);

  const patient = (location.state as PatientSearchResult | null);

  const recordsQuery = useQuery({
    queryKey: ['clinical-records', patientId],
    queryFn: () => clinicalRecordService.getAll({ patientId }),
    enabled: !isNaN(patientId),
  });

  if (isNaN(patientId)) {
    return <Alert severity="error">ID de paciente inválido.</Alert>;
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/patients')} sx={{ mb: 2 }}>
        Volver a pacientes
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {patient?.fullName ?? `Paciente #${patientId}`}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/prescriptions/new?patientId=${patientId}`, {
            state: { patientId, patientName: patient?.fullName },
          })}
        >
          Nueva receta
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Información general</Typography>
              <Grid container spacing={1}>
                {patient && [
                  { label: 'Nombre completo', value: patient.fullName },
                  { label: 'DNI', value: patient.dni },
                  { label: 'Edad', value: String(patient.age) },
                  { label: 'Estado', value: patient.status },
                ].map((row) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={row.label}>
                    <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                    <Typography variant="body1">{row.value}</Typography>
                  </Grid>
                ))}
                {!patient && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="info">
                      Datos del paciente no disponibles. ID: {patientId}.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Historial clínico</Typography>
              </Box>
              {recordsQuery.isLoading ? (
                <Skeleton variant="rounded" height={200} />
              ) : recordsQuery.isError ? (
                <Alert severity="error">Error al cargar el historial clínico.</Alert>
              ) : (
                <>
                  {(() => {
                    const records: ClinicalRecord[] = recordsQuery.data ?? [];
                    return records.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Diagnóstico</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Fuente</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {records.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>{record.recordDate?.split('T')[0]}</TableCell>
                                <TableCell>{record.diagnosis}</TableCell>
                                <TableCell>
                                  <Chip label={record.source} size="small" color="info" />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hay registros clínicos para este paciente.
                      </Typography>
                    );
                  })()}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
