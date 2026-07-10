import { appointmentApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import type { Appointment, CreateAppointmentPayload } from './appointmentTypes';

export const appointmentService = {
  async getByPatientId(patientId: number): Promise<Appointment[]> {
    try {
      const { data } = await appointmentApi.get(
        ENDPOINTS.APPOINTMENTS.BY_PATIENT(patientId),
      );
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async create(payload: CreateAppointmentPayload): Promise<Appointment> {
    const { data } = await appointmentApi.post(ENDPOINTS.APPOINTMENTS.BASE, payload);
    return data;
  },
};
