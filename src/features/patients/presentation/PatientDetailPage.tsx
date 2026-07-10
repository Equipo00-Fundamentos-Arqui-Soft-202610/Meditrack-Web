import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Skeleton, Alert, Button,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { clinicalRecordService } from '../../clinical-records/data/clinicalRecordService';
import { followUpMedicationService } from '../../prescriptions/data/followUpMedicationService';
import type { PatientSearchResult } from '../data/patientTypes';
import type { ClinicalRecord } from '../../clinical-records/data/clinicalRecordTypes';
import type { FollowUpMedication } from '../../prescriptions/data/followUpMedicationService';

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

  const medicationsQuery = useQuery({
    queryKey: ['followup-medications', patientId],
    queryFn: () => followUpMedicationService.getByPatientId(patientId),
    enabled: !isNaN(patientId),
  });

  if (isNaN(patientId)) {
    return <Alert severity="error">ID de paciente inválido.</Alert>;
  }

  const records: ClinicalRecord[] = recordsQuery.data ?? [];
  const medications: FollowUpMedication[] = medicationsQuery.data ?? [];
  const activeMedications = medications.filter((m) => m.isActive);

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

      {/* Patient info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Información del paciente</Typography>
          <Grid container spacing={2}>
            {patient && [
              { label: 'Nombre completo', value: patient.fullName },
              { label: 'DNI', value: patient.dni },
              { label: 'Edad', value: String(patient.age) },
              { label: 'Estado', value: patient.status },
            ].map((row) => (
              <Grid size={{ xs: 12, sm: 3 }} key={row.label}>
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

      {/* Prescriptions styled as medical document */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Recetas médicas</Typography>
          </Box>

          {medicationsQuery.isLoading ? (
            <Skeleton variant="rounded" height={200} />
          ) : medicationsQuery.isError ? (
            <Alert severity="error">Error al cargar las recetas.</Alert>
          ) : activeMedications.length === 0 ? (
            <Alert severity="info">
              No hay recetas activas para este paciente. Puede crear una nueva con el botón superior.
            </Alert>
          ) : (
            <Box>
              {activeMedications.map((med, index) => (
                <Paper
                  key={med.id}
                  variant="outlined"
                  sx={{
                    p: 3,
                    mb: index < activeMedications.length - 1 ? 2 : 0,
                    border: '2px solid',
                    borderColor: 'primary.light',
                    bgcolor: 'grey.50',
                  }}
                >
                  {/* Prescription header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalHospitalIcon color="primary" sx={{ fontSize: 32 }} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} color="primary">
                          MediTrack — Receta Médica
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Receta #{med.id}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label="Activa" color="success" size="small" />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Patient & doctor info row */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Paciente</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {patient?.fullName ?? `Paciente #${patientId}`}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 3 }}>
                      <Typography variant="caption" color="text.secondary">DNI</Typography>
                      <Typography variant="body2">{patient?.dni ?? '—'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 3 }}>
                      <Typography variant="caption" color="text.secondary">Fecha inicio</Typography>
                      <Typography variant="body2">
                        {med.startDate?.split('T')[0] ?? '—'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Medication details */}
                  <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Medicamento
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary">Nombre</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{med.name}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary">Dosis</Typography>
                        <Typography variant="body2">{med.dose}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary">Frecuencia</Typography>
                        <Typography variant="body2">Cada {med.frequencyHours} horas</Typography>
                      </Grid>
                      {med.endDate && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" color="text.secondary">Fecha fin</Typography>
                          <Typography variant="body2">{med.endDate.split('T')[0]}</Typography>
                        </Grid>
                      )}
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary">Stock</Typography>
                        <Typography variant="body2">
                          {med.stockCount} unidades
                          {med.stockCount <= 5 && (
                            <Chip label="Bajo" color="warning" size="small" sx={{ ml: 1 }} />
                          )}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Dose schedules */}
                    {med.schedules.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">Horarios de toma</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                          {med.schedules
                            .filter((s) => s.isActive)
                            .map((schedule) => (
                              <Chip
                                key={schedule.id}
                                label={schedule.scheduledTime.substring(0, 5)}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Clinical records */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Historial clínico</Typography>
          {recordsQuery.isLoading ? (
            <Skeleton variant="rounded" height={200} />
          ) : recordsQuery.isError ? (
            <Alert severity="error">Error al cargar el historial clínico.</Alert>
          ) : records.length === 0 ? (
            <Alert severity="info">No hay registros clínicos para este paciente.</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Diagnóstico</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Notas</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Fuente</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.recordDate?.split('T')[0]}</TableCell>
                      <TableCell>{record.diagnosis}</TableCell>
                      <TableCell>
                        {record.notes ? (
                          <Typography variant="body2" color="text.secondary">
                            {record.notes.length > 80 ? `${record.notes.substring(0, 80)}...` : record.notes}
                          </Typography>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip label={record.source} size="small" color="info" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
