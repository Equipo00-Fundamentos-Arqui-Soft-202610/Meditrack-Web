export interface Appointment {
  id: number;
  patientId: number;
  type: string;
  scheduledAt: string;
  location: string;
  notes: string;
  status: string;
  canBeModified: boolean;
  createdAt: string;
  updatedAt: string;
  requirements: AppointmentRequirement[];
}

export interface AppointmentRequirement {
  id: number;
  description: string;
}

export interface CreateAppointmentPayload {
  patientId: number;
  type: string;
  scheduledAt: string;
  location: string;
  notes: string;
}
