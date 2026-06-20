export type UserRole = 'paciente' | 'personal_tecnico';

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
  access_token: string;
  usuario: UserProfile;
}

export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
  institucion?: string;
}
