import { analysisApi, followUpApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import type { AdherenceTrendPoint, ComplianceStatistic, AppointmentStatistic } from './dashboardTypes';

export const dashboardService = {
  getAdherenceTrend: async (patientId: number, from: string, to: string): Promise<AdherenceTrendPoint[]> => {
    const { data } = await analysisApi.get(ENDPOINTS.DASHBOARDS.ADHERENCE_TREND, {
      params: { patientId, from, to },
    });
    return data.metrics ?? data;
  },

  getComplianceStatistics: async (category: string, from: string, to: string): Promise<ComplianceStatistic[]> => {
    const { data } = await analysisApi.get(ENDPOINTS.STATISTICS.COMPLIANCE, {
      params: { category, from, to },
    });
    return data;
  },

  getAppointmentStatistics: async (from: string, to: string): Promise<AppointmentStatistic[]> => {
    const { data } = await analysisApi.get(ENDPOINTS.STATISTICS.APPOINTMENTS, {
      params: { from, to },
    });
    return data;
  },

  getLowStockMedications: async (patientId: number) => {
    const { data } = await followUpApi.get(ENDPOINTS.STOCK_LOW, {
      params: { patientId },
    });
    return data;
  },
};
