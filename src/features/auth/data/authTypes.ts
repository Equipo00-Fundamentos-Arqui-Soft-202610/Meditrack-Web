export type UserRole = 'Patient' | 'TechnicalStaff';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  // NOTA: el Identity Service todavía no tiene dónde guardar la institución
  // (IAM-RF2 pendiente) -- no se envía al backend, solo queda en el formulario.
  institucion?: string;
}

// Coincide con AuthenticatedUserResource del Identity Service (respuesta plana,
// sin objeto anidado "usuario").
export interface AuthResponse {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  token: string;
}

export type UserProfile = Omit<AuthResponse, 'token'>;
