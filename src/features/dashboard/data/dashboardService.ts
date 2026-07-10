import { analysisApi, followUpApi, appointmentApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';

export interface AdherenceByPatient {
  patientId: number;
  category: string;
  totalScheduled: number;
  totalCompliant: number;
  totalMissed: number;
  rate: number;
  lastUpdatedAt: string;
}

export interface ComplianceByMedication {
  medicationName: string;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  complianceRate: number;
}

export interface AppointmentByType {
  type: string;
  count: number;
}

export const dashboardService = {
  getAllAdherence: async (): Promise<AdherenceByPatient[]> => {
    try {
      const { data } = await analysisApi.get(ENDPOINTS.DASHBOARDS.ALL_ADHERENCE);
      return data.metrics ?? [];
    } catch {
      return [];
    }
  },

  getComplianceByMedication: async (): Promise<ComplianceByMedication[]> => {
    try {
      const { data } = await followUpApi.get(ENDPOINTS.STATISTICS.COMPLIANCE_BY_MEDICATION);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  getAppointmentsByType: async (): Promise<AppointmentByType[]> => {
    try {
      const { data } = await appointmentApi.get(ENDPOINTS.STATISTICS.APPOINTMENTS_BY_TYPE);
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
