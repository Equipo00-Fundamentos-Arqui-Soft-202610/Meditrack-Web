import type { LoginRequest, RegisterRequest, AuthResponse } from './authTypes';
import { identityApi } from '../../../core/api/apiClient';
import { ENDPOINTS } from '../../../core/constants/api';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await identityApi.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, data, {
      headers: { 'X-Client-Type': 'web' },
    });
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // El Identity Service no tiene dónde guardar "institucion" todavía (IAM-RF2
    // pendiente) -- no se envía, solo se manda lo que el backend puede persistir.
    const { fullName, email, password, role } = data;
    const response = await identityApi.post<AuthResponse>(
      ENDPOINTS.AUTH.REGISTER, { fullName, email, password, role });
    return response.data;
  },
};
