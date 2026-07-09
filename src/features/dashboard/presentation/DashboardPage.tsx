import { useQuery } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Skeleton, Alert,
} from '@mui/material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { dashboardService } from '../data/dashboardService';
import { useAuth } from '../../../shared/contexts/AuthContext';

const PIE_COLORS = ['#1565C0', '#26A69A', '#FB8C00', '#E53935', '#7B1FA2', '#00897B'];

const today = new Date();
const from = new Date(today.getTime() - 30 * 86400000).toISOString().split('T')[0];
const to = today.toISOString().split('T')[0];

export const DashboardPage = () => {
  const { userId } = useAuth();

  const trendQuery = useQuery({
    queryKey: ['adherence-trend', userId, from, to],
    queryFn: () => dashboardService.getAdherenceTrend(userId!, from, to),
    enabled: userId !== null,
  });

  const complianceQuery = useQuery({
    queryKey: ['compliance-stats', from, to],
    queryFn: () => dashboardService.getComplianceStatistics('all', from, to),
  });

  const appointmentQuery = useQuery({
    queryKey: ['appointment-stats', from, to],
    queryFn: () => dashboardService.getAppointmentStatistics(from, to),
  });

  const stockQuery = useQuery({
    queryKey: ['low-stock', userId],
    queryFn: () => dashboardService.getLowStockMedications(userId!),
    enabled: userId !== null,
  });

  const loading = trendQuery.isLoading || complianceQuery.isLoading || appointmentQuery.isLoading;
  const hasError = trendQuery.isError || complianceQuery.isError || appointmentQuery.isError;

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
        {renderCharts(trendQuery.data, complianceQuery.data, appointmentQuery.data, stockQuery.data)}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Dashboard</Typography>
      {renderSummaryCards(stockQuery.data)}
      {renderCharts(trendQuery.data, complianceQuery.data, appointmentQuery.data, stockQuery.data)}
    </Box>
  );
};

const renderSummaryCards = (stockData: unknown) => {
  const stockCount = Array.isArray(stockData) ? stockData.length : 0;

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[
        { label: 'Pacientes activos', value: '—', icon: <PeopleIcon />, color: '#1565C0' },
        { label: 'Adherencia promedio', value: '— %', icon: <TrendingUpIcon />, color: '#26A69A' },
        { label: 'Alertas pendientes', value: '—', icon: <WarningAmberIcon />, color: '#FB8C00' },
        { label: 'Stock bajo', value: String(stockCount), icon: <CalendarTodayIcon />, color: '#E53935' },
      ].map((card) => (
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
  trendData: unknown,
  complianceData: unknown,
  appointmentData: unknown,
  stockData: unknown,
) => (
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, md: 8 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Tendencia de adherencia</Typography>
          {Array.isArray(trendData) && trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#1565C0" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">Sin datos disponibles</Typography>
          )}
        </CardContent>
      </Card>
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Citas por tipo</Typography>
          {Array.isArray(appointmentData) && appointmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={appointmentData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={90} label>
                  {appointmentData.map((_: unknown, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">Sin datos disponibles</Typography>
          )}
        </CardContent>
      </Card>
    </Grid>

    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Cumplimiento por receta</Typography>
          {Array.isArray(complianceData) && complianceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="medicationName" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="complianceRate" fill="#26A69A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">Sin datos disponibles</Typography>
          )}
        </CardContent>
      </Card>
    </Grid>

    {Array.isArray(stockData) && stockData.length > 0 && (
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Medicamentos con stock bajo</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Medicamento</TableCell>
                    <TableCell>Stock actual</TableCell>
                    <TableCell>Umbral</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stockData.map((item: { medicationName: string; stockCount: number; stockAlertThreshold: number }) => (
                    <TableRow key={item.medicationName}>
                      <TableCell>{item.medicationName}</TableCell>
                      <TableCell>{item.stockCount}</TableCell>
                      <TableCell>{item.stockAlertThreshold}</TableCell>
                      <TableCell><Chip label="Stock bajo" color="warning" size="small" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    )}
  </Grid>
);
