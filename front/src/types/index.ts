
export interface User {
  id: string;
  _id?: string;
  nome?: string;
  name?: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}

export interface Medication {
  id: string;
  _id?: string;
  name: string;
  dosage: string;
  unit: string;
  frequency: string;
  times: string[];
  stock: number;
  stockMax?: number;
  active: boolean;
  color?: string;
  category?: string;
  icon?: string;
  imageUrl?: string;
  prescribedBy?: string;
  startDate?: string;
  endDate?: string;
  reminderEnabled?: boolean;
  instructions?: string;
  sideEffects?: string;
}

export interface DoseLog {
  situacao: string;
  id: string;
  _id?: string;
  medicationId: string;
  scheduledTime: string;
  status:
    | 'taken'
    | 'skipped'
    | 'missed'
    | 'TOMADO'
    | 'PULADO'
    | 'PERDIDO'
    | string;
  date: string;
  takenAt?: string;
  notes?: string;
}

export interface TodayMedicationItem {
  medication: Medication;
  scheduledTime: string;
  log?: DoseLog;
}