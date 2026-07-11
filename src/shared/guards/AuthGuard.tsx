import { Navigate, Outlet } from 'react-router-dom';
import { getTokenUserRole, isTokenExpired } from '../../core/utils/jwt';

export const AuthGuard = () => {
  const token = localStorage.getItem('access_token');

  if (!token) return <Navigate to="/login" replace />;

  if (isTokenExpired(token)) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    return <Navigate to="/login" replace />;
  }

  const role = getTokenUserRole(token);
  if (role !== 'TechnicalStaff') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const PublicGuard = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return <Outlet />;

  if (isTokenExpired(token)) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    return <Outlet />;
  }

  return <Navigate to="/dashboard" replace />;
};
