export const API_BASE_URLS = {
  IDENTITY_SERVICE: import.meta.env.VITE_IDENTITY_API ?? 'http://localhost:5000/identity/api/v1',
  TREATMENT_SERVICE: import.meta.env.VITE_TREATMENT_API ?? 'http://localhost:5000/treatment/api/v1',
  APPOINTMENT_SERVICE: import.meta.env.VITE_APPOINTMENT_API ?? 'http://localhost:5000/appointments/api/v1',
  FOLLOW_UP_SERVICE: import.meta.env.VITE_FOLLOWUP_API ?? 'http://localhost:5000/followup/api/v1',
  ANALYSIS_SERVICE: import.meta.env.VITE_ANALYSIS_API ?? 'http://localhost:5000/analysis/api/v1',
  REMINDER_SERVICE: import.meta.env.VITE_REMINDER_API ?? 'http://localhost:5000/reminders',
} as const;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/authentication/sign-in',
    REGISTER: '/authentication/sign-up',
  },
  PATIENTS: {
    SEARCH: '/patients/search',
  },
  PRESCRIPTIONS: {
    BASE: '/prescriptions',
    CREATE: '/prescriptions',
  },
  MEDICATIONS: {
    BASE: '/medications',
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
    BASE: '/appointments',
    BY_PATIENT: (patientId: number) => `/appointments?patientId=${patientId}`,
  },
  COMPLIANCE: {
    BASE: '/compliance',
    BY_PATIENT: (patientId: number) => `/compliance?patientId=${patientId}`,
  },
  REMINDERS: {
    BY_PATIENT: (patientId: number) => `/patients/${patientId}`,
  },
  ADHERENCE_HISTORY: '/medications/adherence-history',
  STOCK_LOW: '/stock/low',
  PROFILE: {
    // El Identity Service no tiene un endpoint "yo" -- hay que pasar el id del
    // usuario autenticado (se obtiene del propio JWT en el cliente).
    BY_ID: (userId: number) => `/users/${userId}`,
  },
} as const;
