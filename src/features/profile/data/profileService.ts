import { identityApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import type { UserProfile } from '../../auth/data/authTypes';
import type { ProfileUpdatePayload } from './profileTypes';

export const profileService = {
  get: async (): Promise<UserProfile> => {
    const { data } = await identityApi.get(ENDPOINTS.PROFILE.BASE);
    return data;
  },

  update: async (payload: ProfileUpdatePayload): Promise<UserProfile> => {
    const { data } = await identityApi.put(ENDPOINTS.PROFILE.UPDATE, payload);
    return data;
  },
};
