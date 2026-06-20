import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard, PublicGuard } from './shared/guards/AuthGuard';
import { DashboardLayout } from './shared/layouts/DashboardLayout';
import { LoginPage } from './features/auth/presentation/LoginPage';
import { RegisterPage } from './features/auth/presentation/RegisterPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicGuard />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<AuthGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/patients" element={<div>Patients</div>} />
            <Route path="/prescriptions" element={<div>Prescriptions</div>} />
            <Route path="/clinical-records" element={<div>Clinical Records</div>} />
            <Route path="/alerts" element={<div>Alerts</div>} />
            <Route path="/profile" element={<div>Profile</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
