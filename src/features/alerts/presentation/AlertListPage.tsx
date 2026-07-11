import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Typography, Skeleton, Alert as MuiAlert, Chip, Button,
  FormControl, InputLabel, Select, MenuItem, Stack,
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import { alertService } from '../data/alertService';
import { patientService } from '../../patients/data/patientService';
import type { Alert, AlertSeverity, AlertStatus } from '../data/alertTypes';

const severityColor: Record<AlertSeverity, 'info' | 'warning' | 'error'> = {
  info: 'info',
  warning: 'warning',
  critical: 'error',
};

const severityLabel: Record<AlertSeverity, string> = {
  info: 'Informativa',
  warning: 'Advertencia',
  critical: 'Crítica',
};

const statusLabel: Record<AlertStatus, string> = {
  open: 'Revisar',
  acknowledged: 'Revisada',
};

const legacyTranslations: Record<string, string> = {
  'Adherence rate dropped': 'La adherencia del paciente ha caído',
  'threshold': 'umbral mínimo',
  'Stock low': 'Stock bajo',
  'Stock is low': 'Stock bajo',
};

function translateReason(reason: string): string {
  if (/[áéíóúñ]/.test(reason)) return reason;
  let translated = reason;
  for (const [en, es] of Object.entries(legacyTranslations)) {
    translated = translated.replace(new RegExp(en, 'gi'), es);
  }
  return translated;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Ahora mismo';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `Hace ${diffHrs}h`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
      + ', ' + d.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export const AlertListPage = () => {
  const queryClient = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');

  const query = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertService.getAll(),
  });

  const patientsQuery = useQuery({
    queryKey: ['patients-all'],
    queryFn: () => patientService.fetchAll(),
  });

  const patientDniMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of patientsQuery.data ?? []) {
      if (p.dni) map.set(p.patientId, p.dni);
    }
    return map;
  }, [patientsQuery.data]);

  const acknowledgeMutation = useMutation({
    mutationFn: (id: number) => alertService.acknowledge(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const alerts: Alert[] = query.data ?? [];

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      return true;
    });
  }, [alerts, severityFilter, statusFilter]);

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
        <>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Severidad</InputLabel>
              <Select
                value={severityFilter}
                label="Severidad"
                onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | 'all')}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="critical">Crítica</MenuItem>
                <MenuItem value="warning">Advertencia</MenuItem>
                <MenuItem value="info">Informativa</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value as AlertStatus | 'all')}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="open">Revisar</MenuItem>
                <MenuItem value="acknowledged">Revisada</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Paciente</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Severidad</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Motivo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id} sx={{ opacity: alert.status === 'acknowledged' ? 0.5 : 1 }}>
                    <TableCell>{patientDniMap.get(alert.patientId) ?? `ID: ${alert.patientId}`}</TableCell>
                    <TableCell>
                      <Chip
                        label={severityLabel[alert.severity] ?? alert.severity}
                        color={severityColor[alert.severity] ?? 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{translateReason(alert.reason)}</TableCell>
                    <TableCell>{formatDate(alert.triggeredAt)}</TableCell>
                    <TableCell>
                      {alert.status === 'acknowledged' ? (
                        <Chip label={statusLabel[alert.status]} color="success" size="small" />
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
                {filteredAlerts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No hay alertas con los filtros seleccionados.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};
