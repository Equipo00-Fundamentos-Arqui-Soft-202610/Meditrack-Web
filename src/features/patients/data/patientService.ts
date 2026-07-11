import { treatmentApi, followUpApi, appointmentApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import type {
  PatientSearchResult,
  PatientSearchParams,
  PatientSearchResponse,
  AdherenceHistoryPoint,
  PatientAppointment,
  TreatmentMedication,
} from './patientTypes';

export interface UpdateMedicationPayload {
  dose: string;
  frequencyHours: number;
  startDate: string;
  endDate?: string;
  stockCount: number;
  stockAlertThreshold: number;
}

export const patientService = {
  search: async (params: PatientSearchParams): Promise<PatientSearchResponse> => {
    const term = params.searchTerm?.trim() ?? '';
    if (!term) return { patients: [], totalCount: 0, page: 1, pageSize: 50 };

    const parts = term.split(' - ').filter(p => p.trim().length > 0);
    const queries = parts.length > 1 ? parts : [term];

    try {
      const results = await Promise.all(
        queries.map(q =>
          treatmentApi
            .get(ENDPOINTS.PATIENTS.SEARCH, { params: { query: q } })
            .then(res => ((Array.isArray(res.data) ? res.data : []) as PatientSearchResult[]))
            .catch(() => [] as PatientSearchResult[]),
        ),
      );

      const seen = new Set<number>();
      const patients: PatientSearchResult[] = [];
      for (const result of results) {
        for (const p of result) {
          if (!seen.has(p.patientId)) {
            seen.add(p.patientId);
            patients.push(p);
          }
        }
      }

      return { patients, totalCount: patients.length, page: 1, pageSize: 50 };
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 404) return { patients: [], totalCount: 0, page: 1, pageSize: 50 };
      }
      throw err;
    }
  },

  getAdherenceHistory: async (
    patientId: number,
  ): Promise<AdherenceHistoryPoint[]> => {
    try {
      const { data } = await followUpApi.get(ENDPOINTS.ADHERENCE_HISTORY, {
        params: { patientId },
      });
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  getAppointments: async (
    patientId: number,
  ): Promise<PatientAppointment[]> => {
    try {
      const { data } = await appointmentApi.get(
        ENDPOINTS.APPOINTMENTS.BY_PATIENT(patientId),
      );
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  updateMedication: async (medicationId: number, payload: UpdateMedicationPayload) => {
    const { data } = await treatmentApi.put(`${ENDPOINTS.MEDICATIONS.BASE}/${medicationId}`, payload);
    return data;
  },

  cancelMedication: async (medicationId: number) => {
    const { data } = await treatmentApi.patch(`${ENDPOINTS.MEDICATIONS.BASE}/${medicationId}/cancel`);
    return data;
  },

  getMedicationsByPatient: async (patientId: number): Promise<TreatmentMedication[]> => {
    try {
      const { data } = await treatmentApi.get(ENDPOINTS.MEDICATIONS.BY_PATIENT(patientId));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};
