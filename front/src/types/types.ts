
export interface User {
  id: string;
  _id?: string;
  name: string;
  nome?: string;
  email: string;
  createdAt?: string;
  avatar?: string;
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
  id: string;
  _id?: string;
  medicationId: string;
  scheduledTime: string;
  status: string;
  situacao?: string;
  date: string;
  notes?: string;
}

export interface TodayMedicationItem {
  medication: Medication;
  scheduledTime: string;
  log?: DoseLog;
}