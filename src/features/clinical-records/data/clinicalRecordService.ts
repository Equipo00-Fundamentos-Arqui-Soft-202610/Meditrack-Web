import { analysisApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import type { ClinicalRecord, ClinicalRecordCreatePayload, ClinicalRecordImportPayload } from './clinicalRecordTypes';

export const clinicalRecordService = {
  getAll: async (params?: { patientId?: number }): Promise<ClinicalRecord[]> => {
    try {
      const { data } = await analysisApi.get(ENDPOINTS.CLINICAL_RECORDS.BASE, { params });
      return Array.isArray(data) ? data : [];
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 404) return [];
      }
      throw err;
    }
  },

  getByPatient: async (patientId: number): Promise<ClinicalRecord[]> => {
    try {
      const { data } = await analysisApi.get(ENDPOINTS.CLINICAL_RECORDS.BY_PATIENT(patientId));
      return Array.isArray(data) ? data : [];
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 404) return [];
      }
      throw err;
    }
  },

  getById: async (id: number): Promise<ClinicalRecord> => {
    const { data } = await analysisApi.get(`${ENDPOINTS.CLINICAL_RECORDS.BASE}/${id}`);
    return data;
  },

  create: async (payload: ClinicalRecordCreatePayload): Promise<ClinicalRecord> => {
    const body = {
      patientId: payload.patientId,
      recordDate: payload.recordDate,
      diagnosis: payload.diagnosis,
      notes: payload.notes || null,
    };
    const { data } = await analysisApi.post(ENDPOINTS.CLINICAL_RECORDS.BASE, body);
    return data;
  },

  import: async (payload: ClinicalRecordImportPayload): Promise<void> => {
    const formData = new FormData();
    formData.append('patientId', payload.patientId.toString());
    formData.append('recordDate', payload.recordDate);
    formData.append('diagnosis', payload.diagnosis);
    if (payload.notes) formData.append('notes', payload.notes);
    formData.append('file', payload.file);
    await analysisApi.post(ENDPOINTS.CLINICAL_RECORDS.IMPORT, formData, {
      headers: { 'Content-Type': undefined },
    });
  },
};
