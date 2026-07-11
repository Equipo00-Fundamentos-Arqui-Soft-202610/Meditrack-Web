import { analysisApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import type { ClinicalRecord, ClinicalRecordImportPayload } from './clinicalRecordTypes';

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

  import: async (payload: ClinicalRecordImportPayload): Promise<void> => {
    const formData = new FormData();
    formData.append('patientId', String(payload.patientId));
    formData.append('recordType', payload.recordType);
    formData.append('description', payload.description);
    formData.append('recordDate', payload.recordDate);
    formData.append('notes', payload.notes);
    if (payload.files) {
      payload.files.forEach((file) => formData.append('files', file));
    }
    await analysisApi.post(ENDPOINTS.CLINICAL_RECORDS.IMPORT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
