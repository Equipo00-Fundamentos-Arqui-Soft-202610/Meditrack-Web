export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'stock_low' | 'adherence_decline' | 'missed_dose' | 'appointment_reminder' | 'other';

export interface Alert {
  id: number;
  patientId: number;
  patientName: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  isAcknowledged: boolean;
  createdAt: string;
}
