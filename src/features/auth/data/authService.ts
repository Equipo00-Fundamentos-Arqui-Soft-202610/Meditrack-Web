import axios from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse } from './authTypes';
import { API_BASE_URLS } from '../../../core/constants/api';

const authClient = axios.create({
  baseURL: API_BASE_URLS.TREATMENT_SERVICE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await authClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await authClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
};
