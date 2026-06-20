import { treatmentApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import type { ClinicalRecord, ClinicalRecordImportPayload } from './clinicalRecordTypes';

export const clinicalRecordService = {
  getAll: async (params?: { patientId?: number; recordType?: string }): Promise<ClinicalRecord[]> => {
    const { data } = await treatmentApi.get(ENDPOINTS.CLINICAL_RECORDS.BASE, { params });
    return data;
  },

  getByPatient: async (patientId: number): Promise<ClinicalRecord[]> => {
    const { data } = await treatmentApi.get(ENDPOINTS.CLINICAL_RECORDS.BY_PATIENT(patientId));
    return data;
  },

  getById: async (id: number): Promise<ClinicalRecord> => {
    const { data } = await treatmentApi.get(`${ENDPOINTS.CLINICAL_RECORDS.BASE}/${id}`);
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
    await treatmentApi.post(ENDPOINTS.CLINICAL_RECORDS.IMPORT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
