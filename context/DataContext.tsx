
import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';
import { secureStorage } from '../utils/secureStorage';
import { 
  Patient, Medicine, Appointment, Invoice, Expense, Salary, 
  StaffUser, ClinicalService, PatientHistory, Prescription, Supplier, LabResult, ActivityLog
} from '../types';

interface DataContextType {
  patients: Patient[];
  inventory: Medicine[];
  clinicalServices: ClinicalService[];
  appointments: Appointment[];
  invoices: Invoice[];
  expenses: Expense[];
  salaries: Salary[];
  users: StaffUser[];
  patientHistory: PatientHistory[];
  prescriptions: Prescription[];
  suppliers: Supplier[];
  labResults: LabResult[];
  activityLogs: ActivityLog[];
  refreshData: () => Promise<void>;
  
  // Patient Actions
  addNewPatient: (p: Patient) => Promise<void>;
  updatePat: (id: string, p: Partial<Patient>) => Promise<void>;
  deletePat: (id: string) => Promise<void>;
  
  // History
  addNewHistory: (h: PatientHistory) => Promise<void>;
  
  // Prescriptions
  addNewPrescription: (p: Prescription) => Promise<void>;
  removePrescription: (id: string) => Promise<void>;
  
  // Labs
  addNewLabResult: (l: LabResult) => Promise<void>;
  
  // Inventory
  addNewMedicine: (m: Medicine) => Promise<void>;
  updateMed: (id: string, m: Partial<Medicine>) => Promise<void>;
  deleteMed: (id: string) => Promise<void>;
  
  // Services
  addNewService: (s: ClinicalService) => Promise<void>;
  removeService: (id: string) => Promise<void>;
  
  // Suppliers
  addNewSupplier: (s: Supplier) => Promise<void>;
  updateSupplier: (id: string, s: Partial<Supplier>) => Promise<void>;
  
  // Sales
  addTransaction: (inv: Invoice, items?: {id:string, quantity:number, currentStock: number}[]) => Promise<boolean>;
  updateInvoiceStatus: (id: string, status: 'Paid' | 'Pending' | 'Partial' | 'Refunded', isRefund?: boolean) => Promise<void>;

  // Appointments
  addNewAppointment: (a: Appointment) => Promise<void>;
  
  // Finance
  addExpense: (e: Expense) => Promise<void>;
  addSalary: (s: Salary) => Promise<void>;
  
  // User Management
  addNewUser: (u: StaffUser) => Promise<{success: boolean, error?: string}>;
  removeUser: (id: string) => Promise<void>;
  updateUserProfile: (id: string, data: Partial<StaffUser>) => Promise<StaffUser | null>;
  
  isLoading: boolean;
  isOnline: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_KEYS = {
  PATIENTS: 'dhool_local_patients',
  INVENTORY: 'dhool_local_inventory',
  SERVICES: 'dhool_local_services',
  APPOINTMENTS: 'dhool_local_appointments',
  INVOICES: 'dhool_local_invoices',
  EXPENSES: 'dhool_local_expenses',
  SALARIES: 'dhool_local_salaries',
  USERS: 'dhool_local_users',
  HISTORY: 'dhool_local_history',
  PRESCRIPTIONS: 'dhool_local_prescriptions',
  SUPPLIERS: 'dhool_local_suppliers',
  LABS: 'dhool_local_labs',
  LOGS: 'dhool_local_logs'
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(() => secureStorage.getItem(LOCAL_KEYS.PATIENTS) || []);
  const [inventory, setInventory] = useState<Medicine[]>(() => secureStorage.getItem(LOCAL_KEYS.INVENTORY) || []);
  const [clinicalServices, setClinicalServices] = useState<ClinicalService[]>(() => secureStorage.getItem(LOCAL_KEYS.SERVICES) || []);
  const [appointments, setAppointments] = useState<Appointment[]>(() => secureStorage.getItem(LOCAL_KEYS.APPOINTMENTS) || []);
  const [invoices, setInvoices] = useState<Invoice[]>(() => secureStorage.getItem(LOCAL_KEYS.INVOICES) || []);
  const [expenses, setExpenses] = useState<Expense[]>(() => secureStorage.getItem(LOCAL_KEYS.EXPENSES) || []);
  const [salaries, setSalaries] = useState<Salary[]>(() => secureStorage.getItem(LOCAL_KEYS.SALARIES) || []);
  const [users, setUsers] = useState<StaffUser[]>(() => secureStorage.getItem(LOCAL_KEYS.USERS) || []);
  const [patientHistory, setPatientHistory] = useState<PatientHistory[]>(() => secureStorage.getItem(LOCAL_KEYS.HISTORY) || []);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => secureStorage.getItem(LOCAL_KEYS.PRESCRIPTIONS) || []);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => secureStorage.getItem(LOCAL_KEYS.SUPPLIERS) || []);
  const [labResults, setLabResults] = useState<LabResult[]>(() => secureStorage.getItem(LOCAL_KEYS.LABS) || []);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => secureStorage.getItem(LOCAL_KEYS.LOGS) || []);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const logAction = async (action: string, entity: string, details: string) => {
    const user = secureStorage.getItem('dhool_user');
    const log: ActivityLog = {
        id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
        userId: user?.id || 'system',
        userName: user?.name || 'System Auto',
        action,
        entity,
        details,
        timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => {
        const updated = [log, ...prev].slice(0, 100);
        secureStorage.setItem(LOCAL_KEYS.LOGS, updated);
        return updated;
    });
    await firebaseService.insertLog(log);
  };

  const refreshData = async () => {
    try {
      const [p, m, srv, a, i, e, s, u, rx_list, sup_list, lab_list, logs_list] = await Promise.all([
        firebaseService.getPatients(),
        firebaseService.getInventory(),
        firebaseService.getServices(),
        firebaseService.getAppointments(),
        firebaseService.getInvoices(),
        firebaseService.getExpenses(),
        firebaseService.getSalaries(),
        firebaseService.getUsers(),
        firebaseService.getPrescriptions(),
        firebaseService.getSuppliers(),
        firebaseService.getLabResults(),
        firebaseService.getLogs()
      ]);

      if (p) { setPatients(p); secureStorage.setItem(LOCAL_KEYS.PATIENTS, p); }
      if (m) { setInventory(m); secureStorage.setItem(LOCAL_KEYS.INVENTORY, m); }
      if (srv) { setClinicalServices(srv); secureStorage.setItem(LOCAL_KEYS.SERVICES, srv); }
      if (a) { setAppointments(a); secureStorage.setItem(LOCAL_KEYS.APPOINTMENTS, a); }
      if (i) { setInvoices(i); secureStorage.setItem(LOCAL_KEYS.INVOICES, i); }
      if (e) { setExpenses(e); secureStorage.setItem(LOCAL_KEYS.EXPENSES, e); }
      if (s) { setSalaries(s); secureStorage.setItem(LOCAL_KEYS.SALARIES, s); }
      if (u) { setUsers(u); secureStorage.setItem(LOCAL_KEYS.USERS, u); }
      if (rx_list) { setPrescriptions(rx_list); secureStorage.setItem(LOCAL_KEYS.PRESCRIPTIONS, rx_list); }
      if (sup_list) { setSuppliers(sup_list); secureStorage.setItem(LOCAL_KEYS.SUPPLIERS, sup_list); }
      if (lab_list) { setLabResults(lab_list); secureStorage.setItem(LOCAL_KEYS.LABS, lab_list); }
      if (logs_list) { setActivityLogs(logs_list); secureStorage.setItem(LOCAL_KEYS.LOGS, logs_list); }

    } catch (error) {
      console.warn("Background sync failed. Using encrypted local data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addNewPatient = async (p: Patient) => {
    setPatients(prev => {
      const updated = [p, ...prev];
      secureStorage.setItem(LOCAL_KEYS.PATIENTS, updated);
      return updated;
    });
    await firebaseService.insertPatient(p);
    await logAction('CREATE', 'PATIENT', `Registered patient: ${p.name}`);
  };

  const updatePat = async (id: string, p: Partial<Patient>) => {
    setPatients(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...p } : item);
      secureStorage.setItem(LOCAL_KEYS.PATIENTS, updated);
      return updated;
    });
    await firebaseService.updatePatient(id, p);
    await logAction('UPDATE', 'PATIENT', `Updated patient ID: ${id}`);
  };

  const deletePat = async (id: string) => {
    const p = patients.find(i => i.id === id);
    setPatients(prev => {
      const updated = prev.filter(p => p.id !== id);
      secureStorage.setItem(LOCAL_KEYS.PATIENTS, updated);
      return updated;
    });
    await firebaseService.deletePatient(id);
    await logAction('DELETE', 'PATIENT', `Removed patient: ${p?.name || id}`);
  };

  const addNewHistory = async (h: PatientHistory) => {
    setPatientHistory(prev => {
      const updated = [h, ...prev];
      secureStorage.setItem(LOCAL_KEYS.HISTORY, updated);
      return updated;
    });
    await firebaseService.insertHistory(h);
    await logAction('CREATE', 'HISTORY', `Added clinical note for patient ID: ${h.patientId}`);
  };

  const addNewPrescription = async (p: Prescription) => {
    setPrescriptions(prev => {
      const updated = [p, ...prev];
      secureStorage.setItem(LOCAL_KEYS.PRESCRIPTIONS, updated);
      return updated;
    });
    await firebaseService.insertPrescription(p);
    await logAction('CREATE', 'PRESCRIPTION', `Issued prescription for patient ID: ${p.patientId}`);
  };
  
  const removePrescription = async (id: string) => {
    setPrescriptions(prev => {
      const updated = prev.filter(p => p.id !== id);
      secureStorage.setItem(LOCAL_KEYS.PRESCRIPTIONS, updated);
      return updated;
    });
    await firebaseService.deletePrescription(id);
    await logAction('DELETE', 'PRESCRIPTION', `Removed prescription ID: ${id}`);
  };

  const addNewLabResult = async (l: LabResult) => {
    setLabResults(prev => {
      const updated = [l, ...prev];
      secureStorage.setItem(LOCAL_KEYS.LABS, updated);
      return updated;
    });
    await firebaseService.insertLabResult(l);
    await logAction('CREATE', 'LAB_RESULT', `Added ${l.testName} for patient ID: ${l.patientId}`);
  };

  const addNewMedicine = async (m: Medicine) => {
    setInventory(prev => {
      const updated = [m, ...prev];
      secureStorage.setItem(LOCAL_KEYS.INVENTORY, updated);
      return updated;
    });
    await firebaseService.insertMedicine(m);
    await logAction('CREATE', 'MEDICINE', `Added medicine: ${m.name}`);
  };

  const updateMed = async (id: string, m: Partial<Medicine>) => {
    setInventory(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...m } : item);
      secureStorage.setItem(LOCAL_KEYS.INVENTORY, updated);
      return updated;
    });
    await firebaseService.updateMedicine(id, m);
    await logAction('UPDATE', 'MEDICINE', `Updated stock/price for: ${id}`);
  };

  const deleteMed = async (id: string) => {
    const m = inventory.find(i => i.id === id);
    setInventory(prev => {
      const updated = prev.filter(m => m.id !== id);
      secureStorage.setItem(LOCAL_KEYS.INVENTORY, updated);
      return updated;
    });
    await firebaseService.deleteMedicine(id);
    await logAction('DELETE', 'MEDICINE', `Removed medicine: ${m?.name || id}`);
  };

  const addNewService = async (s: ClinicalService) => {
    setClinicalServices(prev => {
      const updated = [s, ...prev];
      secureStorage.setItem(LOCAL_KEYS.SERVICES, updated);
      return updated;
    });
    await firebaseService.insertService(s);
    await logAction('CREATE', 'SERVICE', `Added clinical service: ${s.name}`);
  };

  const removeService = async (id: string) => {
    const s = clinicalServices.find(i => i.id === id);
    setClinicalServices(prev => {
      const updated = prev.filter(s => s.id !== id);
      secureStorage.setItem(LOCAL_KEYS.SERVICES, updated);
      return updated;
    });
    await firebaseService.deleteService(id);
    await logAction('DELETE', 'SERVICE', `Removed service: ${s?.name || id}`);
  };

  const addNewSupplier = async (s: Supplier) => {
    setSuppliers(prev => {
      const updated = [s, ...prev];
      secureStorage.setItem(LOCAL_KEYS.SUPPLIERS, updated);
      return updated;
    });
    await firebaseService.insertSupplier(s);
    await logAction('CREATE', 'SUPPLIER', `Added vendor: ${s.name}`);
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      secureStorage.setItem(LOCAL_KEYS.SUPPLIERS, updated);
      return updated;
    });
    await firebaseService.updateSupplier(id, updates);
    await logAction('UPDATE', 'SUPPLIER', `Updated supplier details: ${id}`);
  };

  const addTransaction = async (inv: Invoice, items?: {id:string, quantity:number, currentStock: number}[]) => {
    setInvoices(prev => {
      const updated = [inv, ...prev];
      secureStorage.setItem(LOCAL_KEYS.INVOICES, updated);
      return updated;
    });

    if (items && items.length > 0) {
      setInventory(prev => {
        const itemMap = new Map(items.map(i => [i.id, i.quantity]));
        const updated = prev.map(prod => {
          const qty = itemMap.get(prod.id);
          if (qty) return { ...prod, stock: Math.max(0, prod.stock - qty) };
          return prod;
        });
        secureStorage.setItem(LOCAL_KEYS.INVENTORY, updated);
        return updated;
      });
    }

    const res = await firebaseService.createTransaction(inv, items);
    await logAction('CREATE', 'INVOICE', `${inv.isRefund ? 'Refund' : 'Sale'} processed for: ${inv.patientName} ($${inv.amount})`);
    return res;
  };

  const updateInvoiceStatus = async (id: string, status: 'Paid' | 'Pending' | 'Partial' | 'Refunded', isRefund?: boolean) => {
    const updates: Partial<Invoice> = { status };
    if (isRefund !== undefined) updates.isRefund = isRefund;

    setInvoices(prev => {
      const updated = prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv);
      secureStorage.setItem(LOCAL_KEYS.INVOICES, updated);
      return updated;
    });
    
    await firebaseService.updateInvoice(id, updates);
    await logAction('UPDATE', 'INVOICE', `Changed status to ${status} for ID: ${id}`);
  };

  const addNewAppointment = async (a: Appointment) => {
    setAppointments(prev => {
      const updated = [a, ...prev];
      secureStorage.setItem(LOCAL_KEYS.APPOINTMENTS, updated);
      return updated;
    });
    await firebaseService.insertAppointment(a);
    await logAction('CREATE', 'APPOINTMENT', `Scheduled visit for ${a.patientName} at ${a.time}`);
  };

  const addExpense = async (e: Expense) => {
    setExpenses(prev => {
      const updated = [e, ...prev];
      secureStorage.setItem(LOCAL_KEYS.EXPENSES, updated);
      return updated;
    });
    await firebaseService.insertExpense(e);
    await logAction('CREATE', 'EXPENSE', `Recorded expense: ${e.description} ($${e.amount})`);
  };

  const addSalary = async (s: Salary) => {
    setSalaries(prev => {
      const updated = [s, ...prev];
      secureStorage.setItem(LOCAL_KEYS.SALARIES, updated);
      return updated;
    });
    await firebaseService.insertSalary(s);
    await logAction('CREATE', 'PAYROLL', `Paid salary to ${s.staffName} ($${s.amount})`);
  };

  const addNewUser = async (u: StaffUser) => {
    const res = await firebaseService.insertUser(u);
    if (res) {
      setUsers(prev => {
        const updated = [u, ...prev];
        secureStorage.setItem(LOCAL_KEYS.USERS, updated);
        return updated;
      });
    }
    await logAction('CREATE', 'USER', `Created new staff account: ${u.email}`);
    return { success: !!res };
  };

  const removeUser = async (id: string) => {
    const u = users.find(i => i.id === id);
    setUsers(prev => {
      const updated = prev.filter(u => u.id !== id);
      secureStorage.setItem(LOCAL_KEYS.USERS, updated);
      return updated;
    });
    await firebaseService.deleteUser(id);
    await logAction('DELETE', 'USER', `Deactivated account: ${u?.email || id}`);
  };

  const updateUserProfile = async (id: string, data: Partial<StaffUser>) => {
    const res = await firebaseService.updateUser(id, data);
    if (res) {
      setUsers(prev => {
        const updated = prev.map(u => u.id === id ? { ...u, ...data } : u);
        secureStorage.setItem(LOCAL_KEYS.USERS, updated);
        return updated;
      });
    }
    await logAction('UPDATE', 'PROFILE', `Updated settings for: ${id}`);
    return res;
  };

  return (
    <DataContext.Provider value={{
      patients, inventory, clinicalServices, appointments, invoices, expenses, salaries, users, patientHistory, prescriptions, suppliers, labResults, activityLogs,
      refreshData, addNewPatient, updatePat, deletePat, addNewHistory, addNewPrescription, removePrescription, addNewLabResult, addNewMedicine, updateMed, deleteMed, 
      addNewService, removeService, addNewSupplier, updateSupplier, addTransaction, updateInvoiceStatus, addNewAppointment, addExpense, addSalary,
      addNewUser, removeUser, updateUserProfile, isLoading, isOnline
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
