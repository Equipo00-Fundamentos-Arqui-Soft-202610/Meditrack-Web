export interface ClinicalRecord {
  id: number;
  patientId: number;
  recordDate: string;
  diagnosis: string;
  notes: string;
  source: string;
  importBatchId: string | null;
  createdAt: string;
}

export interface ClinicalRecordCreatePayload {
  patientId: number;
  recordDate: string;
  diagnosis: string;
  notes?: string;
}

export interface ClinicalRecordImportPayload {
  patientId: number;
  recordDate: string;
  diagnosis: string;
  notes: string;
  file: File;
}
