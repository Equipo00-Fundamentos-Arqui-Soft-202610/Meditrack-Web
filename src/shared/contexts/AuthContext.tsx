import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserProfile, LoginRequest, RegisterRequest } from '../../features/auth/data/authTypes';
import { authService } from '../../features/auth/data/authService';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const AUTH_KEY = 'auth_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authService.login(data);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem(AUTH_KEY, JSON.stringify(response.usuario));
    setUser(response.usuario);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authService.register(data);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem(AUTH_KEY, JSON.stringify(response.usuario));
    setUser(response.usuario);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
