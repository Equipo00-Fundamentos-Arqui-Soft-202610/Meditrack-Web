import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Typography, Skeleton, Alert as MuiAlert, Chip, Button,
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import { alertService } from '../data/alertService';
import type { Alert, AlertSeverity } from '../data/alertTypes';

const severityColor: Record<AlertSeverity, 'info' | 'warning' | 'error'> = {
  low: 'info',
  medium: 'warning',
  high: 'error',
  critical: 'error',
};

export const AlertListPage = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertService.getAll(),
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: number) => alertService.acknowledge(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const alerts: Alert[] = query.data ?? [];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Alertas</Typography>

      {query.isLoading && (
        <Box>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={52} sx={{ mb: 1 }} />
          ))}
        </Box>
      )}

      {query.isError && (
        <MuiAlert severity="error" sx={{ mb: 2 }}>
          Error al cargar alertas. Verifica que el servicio esté corriendo.
        </MuiAlert>
      )}

      {!query.isLoading && !query.isError && alerts.length === 0 && (
        <MuiAlert severity="info">No hay alertas registradas.</MuiAlert>
      )}

      {alerts.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Paciente</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Severidad</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Mensaje</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id} sx={{ opacity: alert.isAcknowledged ? 0.5 : 1 }}>
                  <TableCell>{alert.patientName}</TableCell>
                  <TableCell>
                    <Chip
                      label={alert.alertType.replace('_', ' ')}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={alert.severity}
                      color={severityColor[alert.severity as AlertSeverity]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{alert.message}</TableCell>
                  <TableCell>{alert.createdAt}</TableCell>
                  <TableCell>
                    {alert.isAcknowledged ? (
                      <Chip label="Revisada" color="success" size="small" />
                    ) : (
                      <Button
                        size="small"
                        startIcon={<DoneIcon />}
                        onClick={() => acknowledgeMutation.mutate(alert.id)}
                        disabled={acknowledgeMutation.isPending}
                      >
                        Revisar
                      </Button>
                    )}
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
