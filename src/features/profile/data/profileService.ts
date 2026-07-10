import { identityApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';
import { getTokenUserId } from '../../../core/utils/jwt';
import type { UserProfile } from '../../auth/data/authTypes';
import type { ProfileUpdatePayload } from './profileTypes';

const currentUserId = (): number => {
  const token = localStorage.getItem('access_token');
  const userId = token ? getTokenUserId(token) : null;
  if (userId === null) throw new Error('No hay una sesión activa.');
  return userId;
};

export const profileService = {
  get: async (): Promise<UserProfile> => {
    const { data } = await identityApi.get(ENDPOINTS.PROFILE.BY_ID(currentUserId()));
    return data;
  },

  update: async (payload: ProfileUpdatePayload): Promise<UserProfile> => {
    const { data } = await identityApi.put(ENDPOINTS.PROFILE.BY_ID(currentUserId()), payload);
    return data;
  },
};
