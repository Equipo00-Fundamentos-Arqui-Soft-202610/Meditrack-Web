import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard, PublicGuard } from './shared/guards/AuthGuard';
import { DashboardLayout } from './shared/layouts/DashboardLayout';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicGuard />}>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/register" element={<div>Register Page</div>} />
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
