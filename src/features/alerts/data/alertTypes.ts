export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'open' | 'acknowledged';

export interface Alert {
  id: number;
  patientId: number;
  severity: AlertSeverity;
  status: AlertStatus;
  reason: string;
  triggeredAt: string;
  acknowledgedAt: string | null;
}
