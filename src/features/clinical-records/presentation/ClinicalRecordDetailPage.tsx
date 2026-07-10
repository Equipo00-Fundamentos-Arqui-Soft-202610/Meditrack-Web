import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Paper, Skeleton, Alert, Button, Divider, Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { clinicalRecordService } from '../data/clinicalRecordService';
import type { PatientSearchResult } from '../../patients/data/patientTypes';
import type { ClinicalRecord } from '../data/clinicalRecordTypes';

const SOURCE_LABELS: Record<string, string> = {
  manual: 'Registro manual',
  dataset: 'Importacion masiva',
  imported: 'Importado',
};

export const ClinicalRecordDetailPage = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const pid = Number(patientId);
  const patient = (location.state as { patient?: PatientSearchResult } | null)?.patient;

  const recordsQuery = useQuery({
    queryKey: ['clinical-records', pid],
    queryFn: () => clinicalRecordService.getAll({ patientId: pid }),
    enabled: !isNaN(pid) && pid > 0,
  });

  if (isNaN(pid) || pid <= 0) {
    return <Alert severity="error">ID de paciente invalido.</Alert>;
  }

  const records: ClinicalRecord[] = recordsQuery.data ?? [];

  const formatDate = (iso: string) => {
    if (!iso) return '--';
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateTime = (iso: string) => {
    if (!iso) return '--';
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/clinical-records')} sx={{ mb: 2 }}>
        Volver a historial clinico
      </Button>

      {/* Formal document container */}
      <Paper
        variant="outlined"
        sx={{
          maxWidth: 900,
          mx: 'auto',
          p: 0,
          border: '2px solid',
          borderColor: 'primary.light',
          overflow: 'hidden',
        }}
      >
        {/* Document header */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 4,
            py: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <LocalHospitalIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              MediTrack
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.85 }}>
              Historial Clinico del Paciente
            </Typography>
          </Box>
        </Box>

        {/* Patient identification block */}
        <Box sx={{ px: 4, py: 3, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
            Datos del paciente
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, mt: 1, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Nombre completo</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {patient?.fullName ?? `Paciente #${pid}`}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">DNI</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {patient?.dni ?? '--'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Edad</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {patient?.age ? `${patient.age} anios` : '--'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Estado</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Activo
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">ID Paciente</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {pid}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Clinical records section */}
        <Box sx={{ px: 4, py: 3 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
            Registros clinicos
          </Typography>

          {recordsQuery.isLoading && (
            <Box sx={{ mt: 2 }}>
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} variant="rounded" height={120} sx={{ mb: 2 }} />
              ))}
            </Box>
          )}

          {recordsQuery.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Error al cargar el historial clinico. Verifica que el servicio este corriendo.
            </Alert>
          )}

          {!recordsQuery.isLoading && !recordsQuery.isError && records.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No se encontraron registros clinicos para este paciente.
            </Alert>
          )}

          {records.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {records.map((record, index) => (
                <Box key={record.id}>
                  {index > 0 && <Divider sx={{ my: 3 }} />}

                  {/* Record entry */}
                  <Box sx={{ position: 'relative' }}>
                    {/* Date badge */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Chip
                        label={formatDate(record.recordDate)}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        label={SOURCE_LABELS[record.source] ?? record.source}
                        size="small"
                        color={record.source === 'manual' ? 'info' : 'success'}
                      />
                    </Box>

                    {/* Diagnosis */}
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        bgcolor: 'white',
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                      }}
                    >
                      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                        Diagnostico
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5, lineHeight: 1.6 }}>
                        {record.diagnosis || 'Sin diagnostico registrado'}
                      </Typography>

                      {record.notes && (
                        <>
                          <Divider sx={{ my: 1.5 }} />
                          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                            Observaciones
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {record.notes}
                          </Typography>
                        </>
                      )}
                    </Paper>

                    {/* Record metadata */}
                    <Box sx={{ display: 'flex', gap: 3, mt: 1.5, px: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Registro #{record.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Creado: {formatDateTime(record.createdAt)}
                      </Typography>
                      {record.importBatchId && (
                        <Typography variant="caption" color="text.secondary">
                          Lote: {record.importBatchId}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Document footer */}
        <Box
          sx={{
            px: 4,
            py: 2,
            bgcolor: 'grey.50',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Documento generado por MediTrack -- Portal de Personal Tecnico
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {records.length} registro(s) encontrado(s)
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
