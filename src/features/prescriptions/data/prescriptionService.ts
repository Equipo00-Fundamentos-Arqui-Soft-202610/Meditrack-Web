import { treatmentApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import type { Prescription, CreatePrescriptionPayload, MedicationCatalogItem } from './prescriptionTypes';

export const prescriptionService = {
  getAll: async (params?: { patientId?: number; status?: string }): Promise<Prescription[]> => {
    try {
      const { data } = await treatmentApi.get(ENDPOINTS.PRESCRIPTIONS.BASE, { params });
      return Array.isArray(data) ? data : [];
    } catch (err: unknown) {
      if (
        err && typeof err === 'object' && 'response' in err
      ) {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 404 || status === 405) return [];
      }
      throw err;
    }
  },

  create: async (payload: CreatePrescriptionPayload): Promise<void> => {
    await treatmentApi.post(ENDPOINTS.PRESCRIPTIONS.CREATE, payload);
  },

  getMedicationCatalog: async (): Promise<MedicationCatalogItem[]> => {
    try {
      const { data } = await treatmentApi.get(ENDPOINTS.MEDICATION_CATALOG.BASE);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  searchMedicationCatalog: async (term: string): Promise<MedicationCatalogItem[]> => {
    try {
      const { data } = await treatmentApi.get(ENDPOINTS.MEDICATION_CATALOG.SEARCH, {
        params: { query: term },
      });
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};
