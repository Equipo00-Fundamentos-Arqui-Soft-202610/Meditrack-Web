import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard, PublicGuard } from './shared/guards/AuthGuard';
import { DashboardLayout } from './shared/layouts/DashboardLayout';
import { LoginPage } from './features/auth/presentation/LoginPage';
import { RegisterPage } from './features/auth/presentation/RegisterPage';
import { DashboardPage } from './features/dashboard/presentation/DashboardPage';
import { PatientListPage } from './features/patients/presentation/PatientListPage';
import { PatientDetailPage } from './features/patients/presentation/PatientDetailPage';
import { PrescriptionListPage } from './features/prescriptions/presentation/PrescriptionListPage';
import { PrescriptionCreatePage } from './features/prescriptions/presentation/PrescriptionCreatePage';

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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientListPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/prescriptions" element={<PrescriptionListPage />} />
            <Route path="/prescriptions/new" element={<PrescriptionCreatePage />} />
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
