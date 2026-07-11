export interface Patient {
  id: number;
  names: string;
  lastName: string;
  motherLastName: string;
  documentNumber: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
}

export interface PatientSearchResult {
  patientId: number;
  fullName: string;
  email: string;
  dni: string | null;
  age: number | null;
}

export interface PatientSearchParams {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

export interface PatientSearchResponse {
  patients: PatientSearchResult[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdherenceHistoryPoint {
  date: string;
  percentage: number;
  medicationName: string;
}

export interface PatientAppointment {
  id: number;
  date: string;
  type: string;
  status: string;
  reason: string;
}

export interface TreatmentMedication {
  id: number;
  prescriptionId: number;
  catalogId: number;
  officialName: string;
  category: string;
  dose: string;
  frequencyHours: number;
  startDate: string;
  endDate: string | null;
  stockCount: number;
  stockAlertThreshold: number;
  isActive: boolean;
  scheduledTimes: string[];
}
