export interface MedicationCatalogItem {
  id: number;
  name: string;
  concentration: string;
  pharmaceuticalForm: string;
  unit: string;
}

export interface Medication {
  id: number;
  medicationCatalogId: number;
  medicationName: string;
  concentration: string;
  pharmaceuticalForm: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

export interface Prescription {
  id: number;
  patientId: number;
  patientName: string;
  doctorName: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  notes: string;
  medications: Medication[];
}

export interface CreatePrescriptionPayload {
  patientId: number;
  issueDate: string;
  expiryDate: string;
  notes: string;
  medications: {
    medicationCatalogId: number;
    dosage: string;
    frequency: string;
    duration: string;
    notes: string;
  }[];
}
