export interface ClinicalRecord {
  id: number;
  patientId: number;
  patientName: string;
  recordType: string;
  description: string;
  recordDate: string;
  fileUrl: string;
  notes: string;
  createdAt: string;
}

export interface ClinicalRecordImportPayload {
  patientId: number;
  recordType: string;
  description: string;
  recordDate: string;
  notes: string;
  files?: File[];
}
