
import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';
import { 
  Patient, Medicine, Appointment, Invoice, Expense, Salary, 
  StaffUser, ClinicalService, PatientHistory, Prescription, Supplier, LabResult
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [clinicalServices, setClinicalServices] = useState<ClinicalService[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [patientHistory, setPatientHistory] = useState<PatientHistory[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    try {
      const [p, m, srv, a, i, e, s, u, rx_list, sup_list, lab_list] = await Promise.all([
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
        firebaseService.getLabResults()
      ]);

      if (p) setPatients(p);
      if (m) setInventory(m);
      if (srv) setClinicalServices(srv);
      if (a) setAppointments(a);
      if (i) setInvoices(i);
      if (e) setExpenses(e);
      if (s) setSalaries(s);
      if (u) setUsers(u);
      if (rx_list) setPrescriptions(rx_list);
      if (sup_list) setSuppliers(sup_list);
      if (lab_list) setLabResults(lab_list);

      const h = JSON.parse(localStorage.getItem('dhool_local_history') || '[]');
      setPatientHistory(h);
    } catch (error) {
      console.error("Context Refresh Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addNewPatient = async (p: Patient) => {
    await firebaseService.insertPatient(p);
    setPatients(prev => [...prev, p]);
  };

  const updatePat = async (id: string, p: Partial<Patient>) => {
    await firebaseService.updatePatient(id, p);
    setPatients(prev => prev.map(item => item.id === id ? { ...item, ...p } : item));
  };
  const deletePat = async (id: string) => {
    await firebaseService.deletePatient(id);
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  const addNewHistory = async (h: PatientHistory) => {
    await firebaseService.insertHistory(h);
    setPatientHistory(prev => [h, ...prev]);
    const history = [h, ...patientHistory];
    localStorage.setItem('dhool_local_history', JSON.stringify(history));
  };

  const addNewPrescription = async (p: Prescription) => {
    await firebaseService.insertPrescription(p);
    setPrescriptions(prev => [p, ...prev]);
  };
  
  const removePrescription = async (id: string) => {
    await firebaseService.deletePrescription(id);
    setPrescriptions(prev => prev.filter(p => p.id !== id));
  };

  const addNewLabResult = async (l: LabResult) => {
    await firebaseService.insertLabResult(l);
    setLabResults(prev => [l, ...prev]);
  };

  const addNewMedicine = async (m: Medicine) => {
    await firebaseService.insertMedicine(m);
    setInventory(prev => [...prev, m]);
  };
  const updateMed = async (id: string, m: Partial<Medicine>) => {
    await firebaseService.updateMedicine(id, m);
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...m } : item));
  };
  const deleteMed = async (id: string) => {
    await firebaseService.deleteMedicine(id);
    setInventory(prev => prev.filter(m => m.id !== id));
  };

  const addNewService = async (s: ClinicalService) => {
    await firebaseService.insertService(s);
    setClinicalServices(prev => [...prev, s]);
  };

  const removeService = async (id: string) => {
    await firebaseService.deleteService(id);
    setClinicalServices(prev => prev.filter(s => s.id !== id));
  };

  const addNewSupplier = async (s: Supplier) => {
    await firebaseService.insertSupplier(s);
    setSuppliers(prev => [...prev, s]);
  };
  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    await firebaseService.updateSupplier(id, updates);
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addTransaction = async (inv: Invoice, items?: {id:string, quantity:number, currentStock: number}[]) => {
    const success = await firebaseService.createTransaction(inv, items);
    if (success) {
      setInvoices(prev => [inv, ...prev]);
      if (items) {
        const itemMap = new Map(items.map(i => [i.id, i.quantity]));
        setInventory(prev => prev.map(prod => {
          const qty = itemMap.get(prod.id);
          if (qty) return { ...prod, stock: Math.max(0, prod.stock - qty) };
          return prod;
        }));
      }
    }
    return success;
  };

  const addNewAppointment = async (a: Appointment) => {
    await firebaseService.insertAppointment(a);
    setAppointments(prev => [a, ...prev]);
  };

  const addExpense = async (e: Expense) => {
    await firebaseService.insertExpense(e);
    setExpenses(prev => [e, ...prev]);
  };

  const addSalary = async (s: Salary) => {
    await firebaseService.insertSalary(s);
    setSalaries(prev => [s, ...prev]);
  };

  const addNewUser = async (u: StaffUser) => {
    const res = await firebaseService.insertUser(u);
    if (res) setUsers(prev => [...prev, u]);
    return { success: !!res };
  };
  const removeUser = async (id: string) => {
    await firebaseService.deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };
  const updateUserProfile = async (id: string, data: Partial<StaffUser>) => {
    const res = await firebaseService.updateUser(id, data);
    if (res) setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    return res;
  };

  return (
    <DataContext.Provider value={{
      patients, inventory, clinicalServices, appointments, invoices, expenses, salaries, users, patientHistory, prescriptions, suppliers, labResults,
      refreshData, addNewPatient, updatePat, deletePat, addNewHistory, addNewPrescription, removePrescription, addNewLabResult, addNewMedicine, updateMed, deleteMed, 
      addNewService, removeService, addNewSupplier, updateSupplier, addTransaction, addNewAppointment, addExpense, addSalary,
      addNewUser, removeUser, updateUserProfile, isLoading
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
