import { analysisApi, followUpApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';

export const dashboardService = {
  getAdherenceTrend: async (patientId: number, from: string, to: string) => {
    const { data } = await analysisApi.get(ENDPOINTS.DASHBOARDS.ADHERENCE_TREND, {
      params: { patientId, from, to },
    });
    const points = data.points ?? data.metrics ?? data;
    if (!Array.isArray(points)) return [];
    return points.map((p: { rate: number; lastUpdatedAt: string; category?: string }) => ({
      date: p.lastUpdatedAt?.split('T')[0] ?? '',
      percentage: p.rate,
    }));
  },

  getComplianceStatistics: async (category: string, from: string, to: string) => {
    try {
      const { data } = await analysisApi.get(ENDPOINTS.STATISTICS.COMPLIANCE, {
        params: { category, from, to },
      });
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  getPendingAlertsCount: async (): Promise<number> => {
    try {
      const { data } = await analysisApi.get(ENDPOINTS.ALERTS.BASE, {
        params: { status: 'open' },
      });
      return Array.isArray(data) ? data.length : 0;
    } catch {
      return 0;
    }
  },

  getAppointmentStatistics: async (from: string, to: string) => {
    try {
      const { data } = await analysisApi.get(ENDPOINTS.STATISTICS.APPOINTMENTS, {
        params: { from, to },
      });
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  getLowStockMedications: async (patientId: number) => {
    try {
      const { data } = await followUpApi.get(ENDPOINTS.STOCK_LOW, {
        params: { patientId },
      });
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};
