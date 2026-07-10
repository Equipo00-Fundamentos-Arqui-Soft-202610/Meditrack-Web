import { followUpApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';

export interface FollowUpMedication {
  id: number;
  patientId: number;
  name: string;
  dose: string;
  frequencyHours: number;
  startDate: string;
  endDate: string | null;
  stockCount: number;
  isActive: boolean;
  schedules: {
    id: number;
    scheduledTime: string;
    isActive: boolean;
  }[];
}

export const followUpMedicationService = {
  async getByPatientId(patientId: number): Promise<FollowUpMedication[]> {
    try {
      const { data } = await followUpApi.get(ENDPOINTS.MEDICATIONS.BY_PATIENT(patientId));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};
