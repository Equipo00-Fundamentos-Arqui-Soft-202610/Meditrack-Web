export const API_BASE_URLS = {
  TREATMENT_SERVICE: import.meta.env.VITE_TREATMENT_API ?? 'http://localhost:5000/api/v1',
  APPOINTMENT_SERVICE: import.meta.env.VITE_APPOINTMENT_API ?? 'http://localhost:5268/api/v1',
  FOLLOW_UP_SERVICE: import.meta.env.VITE_FOLLOWUP_API ?? 'http://localhost:5267/api/v1',
  ANALYSIS_SERVICE: import.meta.env.VITE_ANALYSIS_API ?? 'http://localhost:5001/api/v1',
} as const;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  PATIENTS: {
    SEARCH: '/patients/search',
  },
  PRESCRIPTIONS: {
    BASE: '/prescriptions',
    CREATE: '/prescriptions',
    BY_ID: (id: number) => `/prescriptions/${id}`,
    SEARCH: '/prescriptions/search',
    BY_PATIENT: (patientId: number) => `/prescriptions?patientId=${patientId}`,
  },
  MEDICATIONS: {
    BASE: '/medications',
    BY_PRESCRIPTION: (id: number) => `/medications?prescriptionId=${id}`,
    BY_PATIENT: (patientId: number) => `/medications?patientId=${patientId}`,
  },
  MEDICATION_CATALOG: {
    BASE: '/medication-catalog',
    SEARCH: '/medication-catalog/search',
  },
  CLINICAL_RECORDS: {
    BASE: '/clinical-records',
    IMPORT: '/clinical-records/import',
    BY_PATIENT: (patientId: number) => `/clinical-records?patientId=${patientId}`,
  },
  ALERTS: {
    BASE: '/alerts',
    ACKNOWLEDGE: (id: number) => `/alerts/${id}/acknowledge`,
  },
  DASHBOARDS: {
    ADHERENCE_TREND: '/dashboards/adherence-trend',
  },
  STATISTICS: {
    COMPLIANCE: '/statistics/compliance',
    APPOINTMENTS: '/statistics/appointments',
  },
  APPOINTMENTS: {
    BY_PATIENT: (patientId: number) => `/appointments?patientId=${patientId}`,
  },
  ADHERENCE_HISTORY: '/medications/adherence-history',
  STOCK_LOW: '/stock/low',
  PROFILE: {
    BASE: '/profile',
    UPDATE: '/profile',
  },
} as const;
