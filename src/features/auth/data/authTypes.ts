export type UserRole = 'paciente' | 'patient' | 'TechnicalStaff' | 'Doctor' | 'Admin';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  institucion?: string;
}

export interface AuthResponse {
  accessToken: string;
  usuario: UserProfile;
}

export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
  institucion?: string;
}
