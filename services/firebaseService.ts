
import { db, auth } from '../lib/firebase';
import { 
  collection, getDocs, updateDoc, deleteDoc, doc, 
  query, orderBy, setDoc, getDoc, limit, where, onSnapshot 
} from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, updatePassword, createUserWithEmailAndPassword } from "firebase/auth";
import { Patient, Medicine, Appointment, Invoice, PatientHistory, StaffUser, ClinicalService, Expense, Salary, Prescription, Supplier, LabResult, ActivityLog } from '../types';
import { secureStorage } from '../utils/secureStorage';

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
  LABS: 'dhool_local_labs',
  LOGS: 'dhool_local_logs'
};

let isDbOffline = false;

const handleOfflineLogin = (email: string, password: string) => {
    const localUsers: StaffUser[] = secureStorage.getItem(KEYS.USERS) || [];
    const normalizedEmail = email.toLowerCase().trim();
    
    // Hardcoded Admin Fallback
    if (normalizedEmail === 'admin@dhool.com' && password === 'admin123') {
        const defaultAdmin: StaffUser = {
            id: 'offline_admin',
            email: 'admin@dhool.com',
            name: 'System Admin (Offline)',
            role: 'Admin',
            status: 'Active',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=DhoolAdmin`
        };
        if (!localUsers.find(u => u.email === defaultAdmin.email)) {
            secureStorage.setItem(KEYS.USERS, [...localUsers, defaultAdmin]);
        }
        return defaultAdmin;
    }

    return localUsers.find(u => u.email.toLowerCase() === normalizedEmail && (u.password === password || !u.password)) || null;
};

const handleLocalFallback = (localKey: string, action: string, payload: any) => {
    let localData = secureStorage.getItem(localKey) || [];
    
    if (action === 'get') return localData;
    
    if (action === 'insert') {
      const newItem = Array.isArray(payload) ? payload[0] : payload;
      if (!newItem.id) newItem.id = Date.now().toString();
      const filtered = localData.filter((i:any) => i.id !== newItem.id);
      secureStorage.setItem(localKey, [newItem, ...filtered]);
      return newItem;
    }
    
    if (action === 'update') {
      const updatedList = localData.map((item: any) => item.id === payload.id ? { ...item, ...payload.updates } : item);
      secureStorage.setItem(localKey, updatedList);
      return payload.updates;
    }
    
    if (action === 'delete') {
      const updatedList = localData.filter((item: any) => item.id !== payload);
      secureStorage.setItem(localKey, updatedList);
      return null;
    }
};

// Request Handler for single actions
const handleRequest = async <T>(
  operation: () => Promise<T>,
  localKey: string,
  action: 'get' | 'insert' | 'update' | 'delete',
  payload?: any
): Promise<T | any> => {
  if (isDbOffline) return handleLocalFallback(localKey, action, payload);

  try {
    const data = await operation();
    // Update local storage for cache
    try {
        const currentLocal = secureStorage.getItem(localKey) || [];
        if (action === 'get' && Array.isArray(data)) {
           secureStorage.setItem(localKey, data);
        } else if (action === 'insert') {
           const newItem = Array.isArray(payload) ? payload[0] : payload;
           const dataToStore = (data && typeof data === 'object') ? data : newItem;
           const filtered = currentLocal.filter((i:any) => i.id !== dataToStore.id);
           secureStorage.setItem(localKey, [dataToStore, ...filtered]);
        } else if (action === 'update' && payload?.id) {
           const updated = currentLocal.map((i:any) => i.id === payload.id ? {...i, ...payload.updates} : i);
           secureStorage.setItem(localKey, updated);
        } else if (action === 'delete') {
           const updated = currentLocal.filter((i:any) => i.id !== payload);
           secureStorage.setItem(localKey, updated);
        }
    } catch (e) {}
    return data;
  } catch (error: any) {
    console.error(`Firebase Error [${action}]:`, error);
    if (error.code === 'unavailable' || error.code === 'permission-denied') {
        isDbOffline = true;
    }
    return handleLocalFallback(localKey, action, payload);
  }
};

export const firebaseService = {
  login: async (email: string, password?: string) => {
    if (!password) return null;
    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail === 'admin@dhool.com' && password === 'admin123') {
       return handleOfflineLogin(normalizedEmail, password);
    }

    if (isDbOffline) return handleOfflineLogin(normalizedEmail, password);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      let userDoc = await getDoc(doc(db, "users", uid));
      
      if (userDoc.exists()) {
        const userData = { ...userDoc.data(), id: uid } as StaffUser;
        handleLocalFallback(KEYS.USERS, 'insert', userData);
        return userData;
      } 
      
      const q = query(collection(db, "users"), where("email", "==", normalizedEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
         const userData = querySnapshot.docs[0].data() as StaffUser;
         handleLocalFallback(KEYS.USERS, 'insert', userData);
         return userData;
      }

      if (normalizedEmail === 'admin@dhool.com') {
         const adminProfile: StaffUser = {
            id: uid,
            email: normalizedEmail,
            name: 'System Admin',
            role: 'Admin',
            status: 'Active',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`
         };
         await setDoc(doc(db, "users", uid), adminProfile);
         return adminProfile;
      }
      return null;

    } catch (error: any) {
      if (error.code === 'auth/network-request-failed') {
          isDbOffline = true;
          return handleOfflineLogin(normalizedEmail, password);
      }
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
          try {
             const q = query(collection(db, "users"), where("email", "==", normalizedEmail));
             const snapshot = await getDocs(q);
             if (!snapshot.empty) {
                 const userData = snapshot.docs[0].data() as StaffUser;
                 if (userData.password && userData.password === password) {
                     try { await createUserWithEmailAndPassword(auth, email, password); } catch(e) {}
                     handleLocalFallback(KEYS.USERS, 'insert', userData);
                     return userData;
                 }
             }
          } catch (dbError) {}
          const localUser = handleOfflineLogin(normalizedEmail, password);
          if (localUser) return localUser;
      }
      return null;
    }
  },

  logout: async () => { try { await signOut(auth); } catch(e) {} },

  // --- Real-time Subscriptions ---
  
  // Generic subscriber that listens to a collection and returns an unsubscribe function
  subscribe: (
    collectionName: string, 
    callback: (data: any[]) => void, 
    orderByField: string = 'id', 
    orderDirection: 'asc' | 'desc' = 'asc',
    limitCount?: number
  ) => {
    if (isDbOffline) return () => {}; // No-op if offline

    try {
        let q = query(collection(db, collectionName), orderBy(orderByField, orderDirection));
        if (limitCount) {
            q = query(collection(db, collectionName), orderBy(orderByField, orderDirection), limit(limitCount));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            callback(data);
        }, (error) => {
            console.error(`Real-time error for ${collectionName}:`, error);
        });

        return unsubscribe;
    } catch (error) {
        console.error(`Failed to subscribe to ${collectionName}:`, error);
        return () => {};
    }
  },

  // One-time Actions (Create/Update/Delete still need explicit calls)
  
  insertLog: (log: ActivityLog) => handleRequest(() => setDoc(doc(db, "activity_logs", log.id), log).then(() => log), KEYS.LOGS, 'insert', log),
  
  getUsers: () => handleRequest(() => getDocs(query(collection(db, "users"), orderBy("name"))).then(s => s.docs.map(d => ({ ...d.data(), id: d.id })) as StaffUser[]), KEYS.USERS, 'get'),
  insertUser: (user: StaffUser) => handleRequest(() => setDoc(doc(db, "users", user.id), user).then(() => user), KEYS.USERS, 'insert', user),
  updateUser: (id: string, updates: Partial<StaffUser>) => handleRequest(() => updateDoc(doc(db, "users", id), updates).then(() => updates), KEYS.USERS, 'update', { id, updates }),
  deleteUser: (id: string) => handleRequest(() => deleteDoc(doc(db, "users", id)), KEYS.USERS, 'delete', id),

  // Fallback Getters (used if real-time fails or for initial load check)
  getPatients: () => handleRequest(() => getDocs(query(collection(db, "patients"), orderBy("name"))).then(s => s.docs.map(d => ({ ...d.data(), id: d.id })) as Patient[]), KEYS.PATIENTS, 'get'),
  insertPatient: (p: Patient) => handleRequest(() => setDoc(doc(db, "patients", p.id), p).then(() => p), KEYS.PATIENTS, 'insert', p),
  updatePatient: (id: string, updates: Partial<Patient>) => handleRequest(() => updateDoc(doc(db, "patients", id), updates).then(() => updates), KEYS.PATIENTS, 'update', { id, updates }),
  deletePatient: (id: string) => handleRequest(() => deleteDoc(doc(db, "patients", id)), KEYS.PATIENTS, 'delete', id),

  getInventory: () => handleRequest(() => getDocs(query(collection(db, "inventory"), orderBy("name"))).then(s => s.docs.map(d => ({ ...d.data(), id: d.id })) as Medicine[]), KEYS.INVENTORY, 'get'),
  insertMedicine: (m: Medicine) => handleRequest(() => setDoc(doc(db, "inventory", m.id), m).then(() => m), KEYS.INVENTORY, 'insert', m),
  updateMedicine: (id: string, updates: Partial<Medicine>) => handleRequest(() => updateDoc(doc(db, "inventory", id), updates).then(() => updates), KEYS.INVENTORY, 'update', { id, updates }),
  deleteMedicine: (id: string) => handleRequest(() => deleteDoc(doc(db, "inventory", id)), KEYS.INVENTORY, 'delete', id),

  getServices: () => handleRequest(() => getDocs(query(collection(db, "services"), orderBy("name"))).then(s => s.docs.map(d => ({ ...d.data(), id: d.id })) as ClinicalService[]), KEYS.SERVICES, 'get'),
  insertService: (s: ClinicalService) => handleRequest(() => setDoc(doc(db, "services", s.id), s).then(() => s), KEYS.SERVICES, 'insert', s),
  deleteService: (id: string) => handleRequest(() => deleteDoc(doc(db, "services", id)), KEYS.SERVICES, 'delete', id),

  getAppointments: () => handleRequest(() => getDocs(query(collection(db, "appointments"), orderBy("date", "desc"))).then(s => s.docs.map(d => ({ ...d.data(), id: d.id })) as Appointment[]), KEYS.APPOINTMENTS, 'get'),
  insertAppointment: (a: Appointment) => handleRequest(() => setDoc(doc(db, "appointments", a.id), a).then(() => a), KEYS.APPOINTMENTS, 'insert', a),

  getInvoices: () => handleRequest(() => getDocs(query(collection(db, "invoices"), orderBy("date", "desc"))).then(s => s.docs.map(d => ({ ...d.data(), id: d.id })) as Invoice[]), KEYS.INVOICES, 'get'),
  updateInvoice: (id: string, updates: Partial<Invoice>) => handleRequest(() => updateDoc(doc(db, "invoices", id), updates).then(() => updates), KEYS.INVOICES, 'update', { id, updates }),
  createTransaction: async (invoice: Invoice, itemsToDeduct?: { id: string; quantity: number, currentStock: number }[]) => {
    if (isDbOffline) return handleLocalTransaction(invoice, itemsToDeduct);
    try {
        await setDoc(doc(db, "invoices", invoice.id), invoice);
        if (itemsToDeduct && itemsToDeduct.length > 0) {
            await Promise.all(itemsToDeduct.map(item => updateDoc(doc(db, "inventory", item.id), { stock: Math.max(0, item.currentStock - item.quantity) })));
        }
        handleLocalTransaction(invoice, itemsToDeduct);
        return true;
    } catch (e) {
        console.error("Transaction Error:", e);
        return handleLocalTransaction(invoice, itemsToDeduct);
    }
  },

  getExpenses: () => handleRequest(() => getDocs(query(collection(db, "expenses"), orderBy("date", "desc"))).then(s => s.docs.map(d => ({ ...d.data(), id: d.id })) as Expense[]), KEYS.EXPENSES, 'get'),
  insertExpense: (e: Expense) => handleRequest(() => setDoc(doc(db, "expenses", e.id), e).then(() => e), KEYS.EXPENSES, 'insert', e),

  getSalaries: () => handleRequest(() => getDocs(query(collection(db, "salaries"), orderBy("date", "desc"))).then(s => s.docs.map(d => ({ ...d.data(), id: d.id })) as Salary[]), KEYS.SALARIES, 'get'),
  insertSalary: (s: Salary) => handleRequest(() => setDoc(doc(db, "salaries", s.id), s).then(() => s), KEYS.SALARIES, 'insert', s),

  getSuppliers: () => handleRequest(() => getDocs(query(collection(db, "suppliers"), orderBy("name"))).then(s => s.docs.map(d => ({ ...d.data(), id: d.id })) as Supplier[]), KEYS.SUPPLIERS, 'get'),
  insertSupplier: (s: Supplier) => handleRequest(() => setDoc(doc(db, "suppliers", s.id), s).then(() => s), KEYS.SUPPLIERS, 'insert', s),
  updateSupplier: (id: string, updates: Partial<Supplier>) => handleRequest(() => updateDoc(doc(db, "suppliers", id), updates).then(() => updates), KEYS.SUPPLIERS, 'update', { id, updates }),

  getLabResults: () => handleRequest(() => getDocs(query(collection(db, "lab_results"), orderBy("date", "desc"))).then(s => s.docs.map(d => ({ ...d.data(), id: d.id })) as LabResult[]), KEYS.LABS, 'get'),
  insertLabResult: (l: LabResult) => handleRequest(() => setDoc(doc(db, "lab_results", l.id), l).then(() => l), KEYS.LABS, 'insert', l),

  getPrescriptions: () => handleRequest(() => getDocs(query(collection(db, "prescriptions"), orderBy("date", "desc"))).then(s => s.docs.map(d => ({ ...d.data(), id: d.id })) as Prescription[]), KEYS.PRESCRIPTIONS, 'get'),
  insertPrescription: (rx: Prescription) => handleRequest(() => setDoc(doc(db, "prescriptions", rx.id), rx).then(() => rx), KEYS.PRESCRIPTIONS, 'insert', rx),
  deletePrescription: (id: string) => handleRequest(() => deleteDoc(doc(db, "prescriptions", id)), KEYS.PRESCRIPTIONS, 'delete', id),
  
  insertHistory: (h: PatientHistory) => handleRequest(() => setDoc(doc(db, "patient_history", h.id), h).then(() => h), KEYS.HISTORY, 'insert', h),
  
  getLogs: () => handleRequest(() => getDocs(query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(100))).then(s => s.docs.map(d => ({ ...d.data(), id: d.id })) as ActivityLog[]), KEYS.LOGS, 'get'),
};

const handleLocalTransaction = (invoice: Invoice, itemsToDeduct?: { id: string; quantity: number, currentStock: number }[]) => {
    let local = secureStorage.getItem(KEYS.INVOICES) || [];
    secureStorage.setItem(KEYS.INVOICES, [invoice, ...local]);
    if (itemsToDeduct) {
        let localInv = secureStorage.getItem(KEYS.INVENTORY) || [];
        localInv = localInv.map((p: any) => {
            const deduction = itemsToDeduct.find(d => d.id === p.id);
            if (deduction) return { ...p, stock: Math.max(0, p.stock - deduction.quantity) };
            return p;
        });
        secureStorage.setItem(KEYS.INVENTORY, localInv);
    }
    return true;
};
