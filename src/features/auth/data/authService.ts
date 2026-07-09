import type { LoginRequest, RegisterRequest, AuthResponse } from './authTypes';
import { identityApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await identityApi.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await identityApi.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },
};
