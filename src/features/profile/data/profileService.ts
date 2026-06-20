import { treatmentApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import type { UserProfile } from '../../auth/data/authTypes';
import type { ProfileUpdatePayload } from './profileTypes';

export const profileService = {
  get: async (): Promise<UserProfile> => {
    const { data } = await treatmentApi.get(ENDPOINTS.PROFILE.BASE);
    return data;
  },

  update: async (payload: ProfileUpdatePayload): Promise<UserProfile> => {
    const { data } = await treatmentApi.put(ENDPOINTS.PROFILE.UPDATE, payload);
    return data;
  },
};
