
export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email?: string;
  lastVisit: string;
  medicalHistory: string[];
  condition?: string;
  balance?: number;
}

export interface PatientHistory {
  id: string;
  patientId: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  doctorName: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  result: string;
  date: string;
  doctorName: string;
  status: 'Normal' | 'Abnormal' | 'Critical';
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorName: string;
  date: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctor: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  reason: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  totalDebt: number;
  status: 'Active' | 'Inactive';
}

export interface Medicine {
  id: string;
  name: string;
  stock: number;
  price: number;
  costPrice?: number;
  expiryDate: string;
  category: string;
  image?: string;
  supplierId?: string;
}

export interface Product extends Medicine {}

export interface ClinicalService {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Invoice {
  id: string;
  patientName: string;
  date: string;
  amount: number;
  discount: number;
  totalPaid: number;
  status: 'Paid' | 'Pending' | 'Partial' | 'Refunded';
  type: 'Dental' | 'Pharmacy';
  method: string;
  isRefund?: boolean;
}

export interface Expense {
  id: string;
  description: string;
  category: 'Utilities' | 'Equipment' | 'Rent' | 'Procurement' | 'Salaries' | 'Other';
  amount: number;
  date: string;
}

export interface Salary {
  id: string;
  staffName: string;
  role: string;
  amount: number;
  month: string;
  date: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  details: string;
  timestamp: string;
}

export type Role = 'Admin' | 'Doctor' | 'Staff' | 'Accountant';

export interface StaffUser {
  id: string;
  name: string;
  role: Role;
  email: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
  password?: string;
}

export type ViewType = 
  | 'dashboard' 
  | 'patients' 
  | 'appointments' 
  | 'pharmacy' 
  | 'pos'
  | 'services'
  | 'invoices' 
  | 'expenses' 
  | 'salaries' 
  | 'users' 
  | 'reports'
  | 'treasury'
  | 'suppliers'
  | 'settings';
