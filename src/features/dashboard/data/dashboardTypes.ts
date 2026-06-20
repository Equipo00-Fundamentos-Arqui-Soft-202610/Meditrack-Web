export interface AdherenceTrendPoint {
  date: string;
  percentage: number;
}

export interface ComplianceStatistic {
  prescriptionId: number;
  medicationName: string;
  complianceRate: number;
  totalDoses: number;
  takenDoses: number;
}

export interface AppointmentStatistic {
  type: string;
  count: number;
  percentage: number;
}

export interface DashboardData {
  adherenceTrend: AdherenceTrendPoint[];
  complianceStats: ComplianceStatistic[];
  appointmentStats: AppointmentStatistic[];
}
