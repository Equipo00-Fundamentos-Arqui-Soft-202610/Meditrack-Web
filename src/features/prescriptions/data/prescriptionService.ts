import { treatmentApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import type { Prescription, CreatePrescriptionPayload, MedicationCatalogItem } from './prescriptionTypes';

export const prescriptionService = {
  getAll: async (params?: { patientId?: number; status?: string }): Promise<Prescription[]> => {
    const { data } = await treatmentApi.get(ENDPOINTS.PRESCRIPTIONS.BASE, { params });
    return data;
  },

  getById: async (id: number): Promise<Prescription> => {
    const { data } = await treatmentApi.get(ENDPOINTS.PRESCRIPTIONS.BY_ID(id));
    return data;
  },

  create: async (payload: CreatePrescriptionPayload): Promise<Prescription> => {
    const { data } = await treatmentApi.post(ENDPOINTS.PRESCRIPTIONS.CREATE, payload);
    return data;
  },

  getMedicationCatalog: async (): Promise<MedicationCatalogItem[]> => {
    const { data } = await treatmentApi.get(ENDPOINTS.MEDICATION_CATALOG.BASE);
    return data;
  },

  searchMedicationCatalog: async (term: string): Promise<MedicationCatalogItem[]> => {
    const { data } = await treatmentApi.get(ENDPOINTS.MEDICATION_CATALOG.SEARCH, {
      params: { term },
    });
    return data;
  },
};
