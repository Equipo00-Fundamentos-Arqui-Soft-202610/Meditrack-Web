import { followUpApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import type { Alert } from './alertTypes';

export const alertService = {
  getAll: async (params?: { acknowledged?: boolean; severity?: string }): Promise<Alert[]> => {
    const { data } = await followUpApi.get(ENDPOINTS.ALERTS.BASE, { params });
    return data;
  },

  acknowledge: async (id: number): Promise<void> => {
    await followUpApi.put(ENDPOINTS.ALERTS.ACKNOWLEDGE(id));
  },
};
