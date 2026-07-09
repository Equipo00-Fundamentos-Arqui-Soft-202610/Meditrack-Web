import { analysisApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import type { Alert } from './alertTypes';

export const alertService = {
  getAll: async (params?: { patientId?: number; acknowledged?: boolean; severity?: string }): Promise<Alert[]> => {
    const { data } = await analysisApi.get(ENDPOINTS.ALERTS.BASE, { params });
    return data;
  },

  acknowledge: async (id: number): Promise<void> => {
    await analysisApi.patch(ENDPOINTS.ALERTS.ACKNOWLEDGE(id));
  },
};
