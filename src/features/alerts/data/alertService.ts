import { analysisApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import type { Alert } from './alertTypes';

export const alertService = {
  getAll: async (params?: { status?: string }): Promise<Alert[]> => {
    try {
      const { data } = await analysisApi.get(ENDPOINTS.ALERTS.BASE, { params });
      return Array.isArray(data) ? data : [];
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 404) return [];
      }
      throw err;
    }
  },

  acknowledge: async (id: number): Promise<void> => {
    await analysisApi.patch(ENDPOINTS.ALERTS.ACKNOWLEDGE(id));
  },
};
