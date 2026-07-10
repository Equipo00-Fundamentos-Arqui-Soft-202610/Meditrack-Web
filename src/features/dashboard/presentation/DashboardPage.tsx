import { useQuery } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography, Skeleton, Alert,
} from '@mui/material';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { dashboardService } from '../data/dashboardService';
import type { AdherenceByPatient, ComplianceByMedication, AppointmentByType } from '../data/dashboardService';

const COLORS = ['#1565C0', '#26A69A', '#FB8C00', '#E53935', '#7B1FA2', '#00897B'];
const LOW_COMPLIANCE_THRESHOLD = 70;

export const DashboardPage = () => {
  const adherenceQuery = useQuery({
    queryKey: ['all-adherence'],
    queryFn: () => dashboardService.getAllAdherence(),
  });

  const complianceQuery = useQuery({
    queryKey: ['compliance-by-medication'],
    queryFn: () => dashboardService.getComplianceByMedication(),
  });

  const appointmentQuery = useQuery({
    queryKey: ['appointments-by-type'],
    queryFn: () => dashboardService.getAppointmentsByType(),
  });

  const alertQuery = useQuery({
    queryKey: ['pending-alerts'],
    queryFn: () => dashboardService.getPendingAlertsCount(),
  });

  const loading = adherenceQuery.isLoading || complianceQuery.isLoading || appointmentQuery.isLoading;
  const hasError = adherenceQuery.isError || complianceQuery.isError || appointmentQuery.isError;

  const adherenceData: AdherenceByPatient[] = adherenceQuery.data ?? [];
  const complianceData: ComplianceByMedication[] = complianceQuery.data ?? [];
  const appointmentData: AppointmentByType[] = appointmentQuery.data ?? [];
  const alertCount = alertQuery.data ?? 0;

  const avgAdherence = adherenceData.length > 0
    ? Math.round(adherenceData.reduce((sum, p) => sum + p.rate, 0) / adherenceData.length)
    : null;

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>Dashboard</Typography>
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rounded" height={140} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>Dashboard</Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se pudieron cargar algunos datos del dashboard. Verifica que los microservicios estén corriendo.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Dashboard</Typography>
      {renderSummaryCards(avgAdherence, alertCount)}
      {renderCharts(adherenceData, complianceData, appointmentData)}
    </Box>
  );
};

const renderSummaryCards = (avgAdherence: number | null, alertCount: number) => {
  const cards = [
    { label: 'Adherencia promedio', value: avgAdherence !== null ? `${avgAdherence} %` : '— %', icon: <TrendingUpIcon />, color: '#26A69A' },
    { label: 'Alertas activas', value: String(alertCount), icon: <WarningAmberIcon />, color: '#E53935' },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${card.color}15`, color: card.color }}>
                {card.icon}
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{card.value}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const renderCharts = (
  adherenceData: AdherenceByPatient[],
  complianceData: ComplianceByMedication[],
  appointmentData: AppointmentByType[],
) => (
  <Grid container spacing={3}>
    {/* US16: Tendencia de adherencia por paciente */}
    <Grid size={{ xs: 12, md: 8 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Tendencia de adherencia por paciente</Typography>
          {adherenceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={adherenceData.map(a => ({ name: `Paciente ${a.patientId}`, rate: a.rate }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Adherencia']} />
                <Bar dataKey="rate" name="Adherencia %" radius={[4, 4, 0, 0]}>
                  {adherenceData.map((a, i) => (
                    <Cell key={i} fill={a.rate >= 70 ? '#26A69A' : '#E53935'} />
                  ))}
                  <LabelList dataKey="rate" position="top" formatter={(v) => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Sin datos disponibles para mostrar tendencias
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>

    {/* US18: Citas por tipo */}
    <Grid size={{ xs: 12, md: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Citas por tipo</Typography>
          {appointmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={appointmentData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={90} label>
                  {appointmentData.map((_: unknown, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No hay datos de citas disponibles
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>

    {/* US17: Cumplimiento por receta */}
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Cumplimiento por receta</Typography>
          {complianceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="medicationName" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Cumplimiento']} />
                <Bar dataKey="complianceRate" name="Tasa de cumplimiento %" radius={[4, 4, 0, 0]}>
                  {complianceData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.complianceRate < LOW_COMPLIANCE_THRESHOLD ? '#E53935' : '#26A69A'}
                    />
                  ))}
                  <LabelList dataKey="complianceRate" position="top" formatter={(v) => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Sin datos disponibles
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);
