
import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';
import { secureStorage } from '../utils/secureStorage';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
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
  processPatientPayment: (patientId: string, amount: number, method: string) => Promise<void>;
  
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
  removeInvoice: (id: string) => Promise<void>;

  // Appointments
  addNewAppointment: (a: Appointment) => Promise<void>;
  updateAppointmentStatus: (id: string, status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled') => Promise<void>;
  
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
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // Track Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Setup Real-time Listeners
  useEffect(() => {
    // We only set up listeners if we are online AND authenticated.
    if (!isOnline || !firebaseUser) {
        setIsLoading(false);
        return;
    }

    // 1. Appointments (Queue) - Highest Priority
    const unsubAppointments = firebaseService.subscribe('appointments', (data) => {
        setAppointments(data);
        secureStorage.setItem(LOCAL_KEYS.APPOINTMENTS, data);
    }, 'date', 'desc');

    // 2. Patients
    const unsubPatients = firebaseService.subscribe('patients', (data) => {
        setPatients(data);
        secureStorage.setItem(LOCAL_KEYS.PATIENTS, data);
    }, 'name', 'asc');

    // 3. Invoices (Billing)
    const unsubInvoices = firebaseService.subscribe('invoices', (data) => {
        setInvoices(data);
        secureStorage.setItem(LOCAL_KEYS.INVOICES, data);
    }, 'date', 'desc');

    // 4. Inventory (POS)
    const unsubInventory = firebaseService.subscribe('inventory', (data) => {
        setInventory(data);
        secureStorage.setItem(LOCAL_KEYS.INVENTORY, data);
    }, 'name', 'asc');

    // 5. Clinical Services
    const unsubServices = firebaseService.subscribe('services', (data) => {
        setClinicalServices(data);
        secureStorage.setItem(LOCAL_KEYS.SERVICES, data);
    }, 'name', 'asc');

    // 6. Expenses
    const unsubExpenses = firebaseService.subscribe('expenses', (data) => {
        setExpenses(data);
        secureStorage.setItem(LOCAL_KEYS.EXPENSES, data);
    }, 'date', 'desc');

    // 7. Salaries
    const unsubSalaries = firebaseService.subscribe('salaries', (data) => {
        setSalaries(data);
        secureStorage.setItem(LOCAL_KEYS.SALARIES, data);
    }, 'date', 'desc');

    // 8. History
    const unsubHistory = firebaseService.subscribe('patient_history', (data) => {
        setPatientHistory(data);
        secureStorage.setItem(LOCAL_KEYS.HISTORY, data);
    }, 'date', 'desc');

    // 9. Prescriptions
    const unsubPrescriptions = firebaseService.subscribe('prescriptions', (data) => {
        setPrescriptions(data);
        secureStorage.setItem(LOCAL_KEYS.PRESCRIPTIONS, data);
    }, 'date', 'desc');

    // 10. Lab Results
    const unsubLabs = firebaseService.subscribe('lab_results', (data) => {
        setLabResults(data);
        secureStorage.setItem(LOCAL_KEYS.LABS, data);
    }, 'date', 'desc');

    // 11. Suppliers
    const unsubSuppliers = firebaseService.subscribe('suppliers', (data) => {
        setSuppliers(data);
        secureStorage.setItem(LOCAL_KEYS.SUPPLIERS, data);
    }, 'name', 'asc');

    // 12. Users
    const unsubUsers = firebaseService.subscribe('users', (data) => {
        setUsers(data);
        secureStorage.setItem(LOCAL_KEYS.USERS, data);
    }, 'name', 'asc');

    // 13. Logs (Limited to 100)
    const unsubLogs = firebaseService.subscribe('activity_logs', (data) => {
        setActivityLogs(data);
        secureStorage.setItem(LOCAL_KEYS.LOGS, data);
    }, 'timestamp', 'desc', 100);

    setIsLoading(false);

    // Cleanup listeners on unmount
    return () => {
        unsubAppointments();
        unsubPatients();
        unsubInvoices();
        unsubInventory();
        unsubServices();
        unsubExpenses();
        unsubSalaries();
        unsubHistory();
        unsubPrescriptions();
        unsubLabs();
        unsubSuppliers();
        unsubUsers();
        unsubLogs();
    };
  }, [isOnline, firebaseUser]);

  const logAction = (action: string, entity: string, details: string) => {
    // DO NOT await this. Fire and forget for instant UI feedback.
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
    firebaseService.insertLog(log);
  };

  const refreshData = async () => {
    // Fallback refresh logic if subscriptions fail or for manual refresh
    if (!isOnline) return;
    // Subscriptions handle everything automatically now, but we can trigger logs sync just in case
    try {
        const logs = await firebaseService.getLogs();
        if(logs) setActivityLogs(logs);
    } catch(e) {}
  };

  useEffect(() => {
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
    setPatients(prev => [p, ...prev.filter(i => i.id !== p.id)]);
    firebaseService.insertPatient(p);
    logAction('CREATE', 'PATIENT', `Registered patient: ${p.name}`);
  };

  const updatePat = async (id: string, p: Partial<Patient>) => {
    setPatients(prev => prev.map(item => item.id === id ? { ...item, ...p } : item));
    firebaseService.updatePatient(id, p);
    logAction('UPDATE', 'PATIENT', `Updated patient ID: ${id}`);
  };

  const deletePat = async (id: string) => {
    const p = patients.find(i => i.id === id);
    setPatients(prev => prev.filter(patient => patient.id !== id));
    firebaseService.deletePatient(id);
    logAction('DELETE', 'PATIENT', `Removed patient: ${p?.name || id}`);
  };

  const processPatientPayment = async (patientId: string, amount: number, method: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const currentBalance = patient.balance || 0;
    const newBalance = currentBalance - amount;

    await updatePat(patientId, { balance: newBalance });

    const paymentInv: Invoice = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      patientName: patient.name,
      date: new Date().toISOString().split('T')[0],
      amount: amount,
      discount: 0,
      totalPaid: amount,
      status: 'Paid',
      type: 'Dental',
      method: method,
      isRefund: false
    };

    addTransaction(paymentInv);
    logAction('PAYMENT', 'PATIENT', `Received payment of $${amount} from ${patient.name}. New Balance: $${newBalance}`);
  };

  const addNewHistory = async (h: PatientHistory) => {
    setPatientHistory(prev => [h, ...prev.filter(i => i.id !== h.id)]);
    firebaseService.insertHistory(h);
    logAction('CREATE', 'HISTORY', `Added clinical note for patient ID: ${h.patientId}`);
  };

  const addNewPrescription = async (p: Prescription) => {
    setPrescriptions(prev => [p, ...prev.filter(i => i.id !== p.id)]);
    firebaseService.insertPrescription(p);
    logAction('CREATE', 'PRESCRIPTION', `Issued prescription for patient ID: ${p.patientId}`);
  };
  
  const removePrescription = async (id: string) => {
    setPrescriptions(prev => prev.filter(p => p.id !== id));
    firebaseService.deletePrescription(id);
    logAction('DELETE', 'PRESCRIPTION', `Removed prescription ID: ${id}`);
  };

  const addNewLabResult = async (l: LabResult) => {
    setLabResults(prev => [l, ...prev.filter(i => i.id !== l.id)]);
    firebaseService.insertLabResult(l);
    logAction('CREATE', 'LAB_RESULT', `Added ${l.testName} for patient ID: ${l.patientId}`);
  };

  const addNewMedicine = async (m: Medicine) => {
    setInventory(prev => [m, ...prev.filter(i => i.id !== m.id)]);
    firebaseService.insertMedicine(m);
    logAction('CREATE', 'MEDICINE', `Added medicine: ${m.name}`);
  };

  const updateMed = async (id: string, m: Partial<Medicine>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...m } : item));
    firebaseService.updateMedicine(id, m);
    logAction('UPDATE', 'MEDICINE', `Updated stock/price for: ${id}`);
  };

  const deleteMed = async (id: string) => {
    const m = inventory.find(i => i.id === id);
    setInventory(prev => prev.filter(item => item.id !== id));
    firebaseService.deleteMedicine(id);
    logAction('DELETE', 'MEDICINE', `Removed medicine: ${m?.name || id}`);
  };

  const addNewService = async (s: ClinicalService) => {
    setClinicalServices(prev => [s, ...prev.filter(i => i.id !== s.id)]);
    firebaseService.insertService(s);
    logAction('CREATE', 'SERVICE', `Added clinical service: ${s.name}`);
  };

  const removeService = async (id: string) => {
    const s = clinicalServices.find(i => i.id === id);
    setClinicalServices(prev => prev.filter(i => i.id !== id));
    firebaseService.deleteService(id);
    logAction('DELETE', 'SERVICE', `Removed service: ${s?.name || id}`);
  };

  const addNewSupplier = async (s: Supplier) => {
    setSuppliers(prev => [s, ...prev.filter(i => i.id !== s.id)]);
    firebaseService.insertSupplier(s);
    logAction('CREATE', 'SUPPLIER', `Added vendor: ${s.name}`);
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    firebaseService.updateSupplier(id, updates);
    logAction('UPDATE', 'SUPPLIER', `Updated supplier details: ${id}`);
  };

  const addTransaction = async (inv: Invoice, items?: {id:string, quantity:number, currentStock: number}[]) => {
    const res = await firebaseService.createTransaction(inv, items);
    logAction('CREATE', 'INVOICE', `${inv.isRefund ? 'Refund' : 'Sale'} processed for: ${inv.patientName} ($${inv.amount})`);
    return res;
  };

  const updateInvoiceStatus = async (id: string, status: 'Paid' | 'Pending' | 'Partial' | 'Refunded', isRefund?: boolean) => {
    const updates: Partial<Invoice> = { status };
    if (isRefund !== undefined) updates.isRefund = isRefund;
    await firebaseService.updateInvoice(id, updates);
    logAction('UPDATE', 'INVOICE', `Changed status to ${status} for ID: ${id}`);
  };

  const removeInvoice = async (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    try {
      firebaseService.deleteInvoice(id);
      logAction('DELETE', 'INVOICE', `Removed invoice ID: ${id}`);
    } catch (e) {
      console.error("Failed to delete invoice:", e);
    }
  };

  const addNewAppointment = async (a: Appointment) => {
    setAppointments(prev => [a, ...prev.filter(i => i.id !== a.id)]);
    firebaseService.insertAppointment(a);
    logAction('CREATE', 'APPOINTMENT', `Scheduled visit for ${a.patientName} at ${a.time}`);
  };

  const updateAppointmentStatus = async (id: string, status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled') => {
    setAppointments(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    const currentApt = appointments.find(a => a.id === id);
    if(currentApt) {
        const updatedApt = { ...currentApt, status };
        firebaseService.insertAppointment(updatedApt); // Overwrites with new status, effectively update
    }
    logAction('UPDATE', 'QUEUE', `Moved appointment ${id} to ${status}`);
  };

  const addExpense = async (e: Expense) => {
    setExpenses(prev => [e, ...prev.filter(i => i.id !== e.id)]);
    firebaseService.insertExpense(e);
    logAction('CREATE', 'EXPENSE', `Recorded expense: ${e.description} ($${e.amount})`);
  };

  const addSalary = async (s: Salary) => {
    setSalaries(prev => [s, ...prev.filter(i => i.id !== s.id)]);
    firebaseService.insertSalary(s);
    logAction('CREATE', 'PAYROLL', `Paid salary to ${s.staffName} ($${s.amount})`);
  };

  const addNewUser = async (u: StaffUser) => {
    // Stage 1: Optimistic update for the list
    setUsers(prev => [u, ...prev.filter(i => i.id !== u.id)]);
    try {
        const confirmedUser = await firebaseService.createUserAccount(u);
        // Stage 2: Replace optimistic user with real user from Firebase (has correct UID)
        setUsers(prev => [confirmedUser, ...prev.filter(i => i.id !== u.id && i.id !== confirmedUser.id)]);
        logAction('CREATE', 'USER', `Created new staff account: ${confirmedUser.email}`);
        return { success: true };
    } catch (e: any) {
        console.error("Add User Failed:", e);
        // Rollback on failure for user creation since it involves Auth
        setUsers(prev => prev.filter(i => i.id !== u.id));
        return { success: false, error: e.message };
    }
  };

  const removeUser = async (id: string) => {
    const u = users.find(i => i.id === id);
    setUsers(prev => prev.filter(user => user.id !== id));
    firebaseService.deleteUser(id);
    logAction('DELETE', 'USER', `Deactivated account: ${u?.email || id}`);
  };

  const updateUserProfile = async (id: string, data: Partial<StaffUser>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    const res = await firebaseService.updateUser(id, data);
    logAction('UPDATE', 'PROFILE', `Updated settings for: ${id}`);
    return res;
  };

  return (
    <DataContext.Provider value={{
      patients, inventory, clinicalServices, appointments, invoices, expenses, salaries, users, patientHistory, prescriptions, suppliers, labResults, activityLogs,
      refreshData, addNewPatient, updatePat, deletePat, processPatientPayment, addNewHistory, addNewPrescription, removePrescription, addNewLabResult, addNewMedicine, updateMed, deleteMed, 
      addNewService, removeService, addNewSupplier, updateSupplier, addTransaction, updateInvoiceStatus, removeInvoice, addNewAppointment, updateAppointmentStatus, addExpense, addSalary,
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
