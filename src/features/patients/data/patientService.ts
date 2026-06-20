import { treatmentApi, followUpApi, appointmentApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import type {
  Patient,
  PatientSearchParams,
  PatientSearchResponse,
  AdherenceHistoryPoint,
  PatientAppointment,
} from './patientTypes';

export const patientService = {
  search: async (params: PatientSearchParams): Promise<PatientSearchResponse> => {
    const { data } = await treatmentApi.get(ENDPOINTS.PATIENTS.SEARCH, { params });
    return data;
  },

  getById: async (id: number): Promise<Patient> => {
    const { data } = await treatmentApi.get(`/patients/${id}`);
    return data;
  },

  getAdherenceHistory: async (
    patientId: number,
    from: string,
    to: string,
  ): Promise<AdherenceHistoryPoint[]> => {
    const { data } = await followUpApi.get(ENDPOINTS.ADHERENCE_HISTORY, {
      params: { patientId, from, to },
    });
    return data;
  },

  getAppointments: async (
    patientId: number,
    from: string,
    to: string,
  ): Promise<PatientAppointment[]> => {
    const { data } = await appointmentApi.get(
      ENDPOINTS.APPOINTMENTS.BY_PATIENT(patientId),
      { params: { from, to } },
    );
    return data;
  },
};
