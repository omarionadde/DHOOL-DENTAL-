
import { db, auth } from '../lib/firebase';
import { 
  collection, getDocs, updateDoc, deleteDoc, doc, 
  query, orderBy, limit, setDoc, getDoc 
} from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, updatePassword } from "firebase/auth";
import { Patient, Medicine, Appointment, Invoice, PatientHistory, StaffUser, ClinicalService, Expense, Salary, Prescription, Supplier, LabResult } from '../types';

const KEYS = {
  USERS: 'dhool_local_users',
  PATIENTS: 'dhool_local_patients',
  INVENTORY: 'dhool_local_inventory',
  SERVICES: 'dhool_local_services',
  APPOINTMENTS: 'dhool_local_appointments',
  INVOICES: 'dhool_local_invoices',
  EXPENSES: 'dhool_local_expenses',
  SALARIES: 'dhool_local_salaries',
  HISTORY: 'dhool_local_history',
  PRESCRIPTIONS: 'dhool_local_prescriptions',
  SUPPLIERS: 'dhool_local_suppliers',
  LABS: 'dhool_local_labs'
};

// CRITICAL FIX: Check if API Key is placeholder or missing
const isConfigInvalid = !auth.app.options.apiKey || auth.app.options.apiKey.includes("YOUR_API_KEY");
let isDbOffline = isConfigInvalid;

if (isDbOffline) {
    console.warn("%c DHOOL SYSTEM: OFFLINE MODE ACTIVE (Invalid/Missing API Key) ", "background: #f43f5e; color: white; font-weight: bold; padding: 4px; border-radius: 4px;");
}

// Helper to handle offline login separately
const handleOfflineLogin = (email: string, password: string) => {
    const localUsers: StaffUser[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    
    // Default Admin for Offline Mode if no users exist or specific fallback requested
    if (email === 'admin@dhool.com' && password === 'admin123') {
        const defaultAdmin: StaffUser = {
            id: 'offline_admin',
            email: 'admin@dhool.com',
            name: 'System Admin (Offline)',
            role: 'Admin',
            status: 'Active',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=DhoolAdmin`
        };
        // Ensure this admin exists in local storage
        if (!localUsers.find(u => u.email === defaultAdmin.email)) {
            localStorage.setItem(KEYS.USERS, JSON.stringify([...localUsers, defaultAdmin]));
        }
        return defaultAdmin;
    }

    return localUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && (u.password === password || !u.password)) || null;
};

const handleRequest = async <T>(
  operation: () => Promise<T>,
  localKey: string,
  action: 'get' | 'insert' | 'update' | 'delete',
  payload?: any
): Promise<T | any> => {
  if (isDbOffline) {
    return handleLocalFallback(localKey, action, payload);
  }

  try {
    const data = await operation();
    // Background sync to local storage
    try {
        const currentLocal = JSON.parse(localStorage.getItem(localKey) || '[]');
        if (action === 'get' && Array.isArray(data)) {
           localStorage.setItem(localKey, JSON.stringify(data));
        } else if (action === 'insert') {
           const filtered = currentLocal.filter((i:any) => i.id !== payload.id);
           localStorage.setItem(localKey, JSON.stringify([data, ...filtered]));
        } else if (action === 'update' && payload?.id) {
           const updated = currentLocal.map((i:any) => i.id === payload.id ? {...i, ...payload.updates} : i);
           localStorage.setItem(localKey, JSON.stringify(updated));
        } else if (action === 'delete') {
           const updated = currentLocal.filter((i:any) => i.id !== payload);
           localStorage.setItem(localKey, JSON.stringify(updated));
        }
    } catch (syncError) { /* ignore */ }
    return data;
  } catch (error: any) {
    console.error(`Firebase operation failed for ${localKey}:`, error);
    // If permission denied or network error, switch to offline mode for this session
    if (error.code === 'unavailable' || error.code === 'permission-denied' || error.message?.includes('offline') || error.code === 'auth/api-key-not-valid') {
        isDbOffline = true;
    }
    return handleLocalFallback(localKey, action, payload);
  }
};

const handleLocalFallback = (localKey: string, action: string, payload: any) => {
    let localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    
    if (action === 'get') return localData;
    
    if (action === 'insert') {
      const newItem = Array.isArray(payload) ? payload[0] : payload;
      if (!newItem.id) newItem.id = Date.now().toString();
      const filtered = localData.filter((i:any) => i.id !== newItem.id);
      localStorage.setItem(localKey, JSON.stringify([newItem, ...filtered]));
      return newItem;
    }
    
    if (action === 'update') {
      const updatedList = localData.map((item: any) => item.id === payload.id ? { ...item, ...payload.updates } : item);
      localStorage.setItem(localKey, JSON.stringify(updatedList));
      return payload.updates;
    }
    
    if (action === 'delete') {
      const updatedList = localData.filter((item: any) => item.id !== payload);
      localStorage.setItem(localKey, JSON.stringify(updatedList));
      return null;
    }
};

export const firebaseService = {
  login: async (email: string, password?: string) => {
    if (!password) return null;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. If we already know DB is offline/invalid, skip straight to local
    if (isDbOffline) {
        return handleOfflineLogin(normalizedEmail, password);
    }

    try {
      // 2. Try Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 3. Get User Profile
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = { ...userDoc.data(), id: uid } as StaffUser;
        handleLocalFallback(KEYS.USERS, 'insert', userData);
        return userData;
      } 
      
      // Auto-create profile if missing (First Run logic)
      const newUserProfile: StaffUser = {
          id: uid,
          email: normalizedEmail,
          name: 'Admin User',
          role: 'Admin',
          status: 'Active',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`
      };
      await setDoc(doc(db, "users", uid), newUserProfile);
      handleLocalFallback(KEYS.USERS, 'insert', newUserProfile);
      return newUserProfile;

    } catch (error: any) {
      console.error("Login Error:", error.code);
      
      // CRITICAL: Catch Invalid API Key and switch to Offline Mode
      if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/argument-error' || error.code === 'auth/network-request-failed') {
          console.warn("Invalid Config Detected. Switching to Offline Mode.");
          isDbOffline = true;
          return handleOfflineLogin(normalizedEmail, password);
      }
      return null;
    }
  },

  logout: async () => { try { await signOut(auth); } catch(e) {} },

  // --- USERS ---
  getUsers: async () => handleRequest(async () => {
    const q = query(collection(db, "users"), orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as StaffUser[];
  }, KEYS.USERS, 'get'),

  insertUser: async (user: StaffUser) => handleRequest(async () => {
    await setDoc(doc(db, "users", user.id), user);
    return user;
  }, KEYS.USERS, 'insert', user),

  updateUser: async (id: string, updates: Partial<StaffUser>) => handleRequest(async () => {
    await updateDoc(doc(db, "users", id), updates);
    if (updates.password && auth.currentUser && auth.currentUser.uid === id && !isDbOffline) {
       try { await updatePassword(auth.currentUser, updates.password); } catch(e) {}
    }
    return updates;
  }, KEYS.USERS, 'update', { id, updates }),

  deleteUser: async (id: string) => handleRequest(async () => {
    await deleteDoc(doc(db, "users", id));
  }, KEYS.USERS, 'delete', id),

  // --- PATIENTS ---
  getPatients: async () => handleRequest(async () => {
    const q = query(collection(db, "patients"), orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Patient[];
  }, KEYS.PATIENTS, 'get'),

  insertPatient: async (patient: Patient) => handleRequest(async () => {
    await setDoc(doc(db, "patients", patient.id), patient);
    return patient;
  }, KEYS.PATIENTS, 'insert', patient),

  updatePatient: async (id: string, updates: Partial<Patient>) => handleRequest(async () => {
    await updateDoc(doc(db, "patients", id), updates);
    return updates;
  }, KEYS.PATIENTS, 'update', { id, updates }),

  deletePatient: async (id: string) => handleRequest(async () => {
    await deleteDoc(doc(db, "patients", id));
  }, KEYS.PATIENTS, 'delete', id),

  // --- INVENTORY ---
  getInventory: async () => handleRequest(async () => {
    const q = query(collection(db, "inventory"), orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Medicine[];
  }, KEYS.INVENTORY, 'get'),

  insertMedicine: async (medicine: Medicine) => handleRequest(async () => {
    await setDoc(doc(db, "inventory", medicine.id), medicine);
    return medicine;
  }, KEYS.INVENTORY, 'insert', medicine),

  updateMedicine: async (id: string, updates: Partial<Medicine>) => handleRequest(async () => {
    await updateDoc(doc(db, "inventory", id), updates);
    return updates;
  }, KEYS.INVENTORY, 'update', { id, updates }),

  deleteMedicine: async (id: string) => handleRequest(async () => {
    await deleteDoc(doc(db, "inventory", id));
  }, KEYS.INVENTORY, 'delete', id),

  // --- SERVICES ---
  getServices: async () => handleRequest(async () => {
    const q = query(collection(db, "services"), orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as ClinicalService[];
  }, KEYS.SERVICES, 'get'),

  insertService: async (service: ClinicalService) => handleRequest(async () => {
    await setDoc(doc(db, "services", service.id), service);
    return service;
  }, KEYS.SERVICES, 'insert', service),

  deleteService: async (id: string) => handleRequest(async () => {
    await deleteDoc(doc(db, "services", id));
  }, KEYS.SERVICES, 'delete', id),

  // --- APPOINTMENTS ---
  getAppointments: async () => handleRequest(async () => {
    const q = query(collection(db, "appointments"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Appointment[];
  }, KEYS.APPOINTMENTS, 'get'),

  insertAppointment: async (appointment: Appointment) => handleRequest(async () => {
    await setDoc(doc(db, "appointments", appointment.id), appointment);
    return appointment;
  }, KEYS.APPOINTMENTS, 'insert', appointment),

  // --- INVOICES ---
  getInvoices: async () => handleRequest(async () => {
    const q = query(collection(db, "invoices"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Invoice[];
  }, KEYS.INVOICES, 'get'),

  createTransaction: async (invoice: Invoice, itemsToDeduct?: { id: string; quantity: number, currentStock: number }[]) => {
    if (isDbOffline) return handleLocalTransaction(invoice, itemsToDeduct);
    try {
        await setDoc(doc(db, "invoices", invoice.id), invoice);
        if (itemsToDeduct && itemsToDeduct.length > 0) {
            const batch = itemsToDeduct.map(item => {
                const newStock = Math.max(0, item.currentStock - item.quantity);
                return updateDoc(doc(db, "inventory", item.id), { stock: newStock });
            });
            await Promise.all(batch);
        }
        handleLocalTransaction(invoice, itemsToDeduct);
        return true;
    } catch (e: any) {
        if (e.code === 'auth/api-key-not-valid' || e.code === 'permission-denied') isDbOffline = true;
        return handleLocalTransaction(invoice, itemsToDeduct);
    }
  },

  // --- EXPENSES ---
  getExpenses: async () => handleRequest(async () => {
    const q = query(collection(db, "expenses"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Expense[];
  }, KEYS.EXPENSES, 'get'),

  insertExpense: async (expense: Expense) => handleRequest(async () => {
    await setDoc(doc(db, "expenses", expense.id), expense);
    return expense;
  }, KEYS.EXPENSES, 'insert', expense),

  // --- SALARIES ---
  getSalaries: async () => handleRequest(async () => {
    const q = query(collection(db, "salaries"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Salary[];
  }, KEYS.SALARIES, 'get'),

  insertSalary: async (salary: Salary) => handleRequest(async () => {
    await setDoc(doc(db, "salaries", salary.id), salary);
    return salary;
  }, KEYS.SALARIES, 'insert', salary),

  // --- SUPPLIERS ---
  getSuppliers: async () => handleRequest(async () => {
    const q = query(collection(db, "suppliers"), orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Supplier[];
  }, KEYS.SUPPLIERS, 'get'),

  insertSupplier: async (supplier: Supplier) => handleRequest(async () => {
    await setDoc(doc(db, "suppliers", supplier.id), supplier);
    return supplier;
  }, KEYS.SUPPLIERS, 'insert', supplier),

  updateSupplier: async (id: string, updates: Partial<Supplier>) => handleRequest(async () => {
    await updateDoc(doc(db, "suppliers", id), updates);
    return updates;
  }, KEYS.SUPPLIERS, 'update', { id, updates }),

  // --- LABS ---
  getLabResults: async () => handleRequest(async () => {
    const q = query(collection(db, "lab_results"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as LabResult[];
  }, KEYS.LABS, 'get'),

  insertLabResult: async (lab: LabResult) => handleRequest(async () => {
    await setDoc(doc(db, "lab_results", lab.id), lab);
    return lab;
  }, KEYS.LABS, 'insert', lab),

  // --- HISTORY ---
  insertHistory: async (history: PatientHistory) => handleRequest(async () => {
    await setDoc(doc(db, "patient_history", history.id), history);
    return history;
  }, KEYS.HISTORY, 'insert', history),

  // --- PRESCRIPTIONS ---
  getPrescriptions: async () => handleRequest(async () => {
    const q = query(collection(db, "prescriptions"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Prescription[];
  }, KEYS.PRESCRIPTIONS, 'get'),

  insertPrescription: async (rx: Prescription) => handleRequest(async () => {
    await setDoc(doc(db, "prescriptions", rx.id), rx);
    return rx;
  }, KEYS.PRESCRIPTIONS, 'insert', rx),

  deletePrescription: async (id: string) => handleRequest(async () => {
    await deleteDoc(doc(db, "prescriptions", id));
  }, KEYS.PRESCRIPTIONS, 'delete', id)
};

// Internal Helper for Local Transactions
const handleLocalTransaction = (invoice: Invoice, itemsToDeduct?: { id: string; quantity: number, currentStock: number }[]) => {
    let local = JSON.parse(localStorage.getItem(KEYS.INVOICES) || '[]');
    localStorage.setItem(KEYS.INVOICES, JSON.stringify([invoice, ...local]));
    
    if (itemsToDeduct) {
        let localInv = JSON.parse(localStorage.getItem(KEYS.INVENTORY) || '[]');
        localInv = localInv.map((p: any) => {
            const deduction = itemsToDeduct.find(d => d.id === p.id);
            if (deduction) return { ...p, stock: Math.max(0, p.stock - deduction.quantity) };
            return p;
        });
        localStorage.setItem(KEYS.INVENTORY, JSON.stringify(localInv));
    }
    return true;
}
