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

export interface ClinicalRecordImportPayload {
  patientId: number;
  recordDate: string;
  diagnosis: string;
  notes: string;
  file: File;
}
