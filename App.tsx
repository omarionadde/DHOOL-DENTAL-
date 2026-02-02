
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Menu, ChevronDown, ChevronRight,
  Receipt, Wallet, BarChart3, ShoppingCart, 
  Settings as SettingsIcon, LogOut, Shield, Stethoscope, Briefcase, Truck, ClipboardList, Clock
} from 'lucide-react';
import { StaffUser, ViewType } from './types';
import DashboardView from './views/DashboardView';
import PatientsView from './views/PatientsView';
import AppointmentsView from './views/AppointmentsView';
import PharmacyView from './views/PharmacyView';
import POSView from './views/POSView';
import BillingView from './views/BillingView';
import ExpensesView from './views/ExpensesView';
import SalariesView from './views/SalariesView';
import UsersView from './views/UsersView';
import ReportsView from './views/ReportsView';
import TreasuryView from './views/TreasuryView';
import SuppliersView from './views/SuppliersView';
import ClinicalServicesView from './views/ClinicalServicesView';
import SettingsView from './views/SettingsView';
import LoginView from './views/LoginView';
import AIAssistantView from './views/AIAssistantView';
import QueueView from './views/QueueView';
import { firebaseService } from './services/firebaseService';
import { DataProvider, useData } from './context/DataContext';
import { DhoolLogo } from './components/DhoolLogo';
import { secureStorage } from './utils/secureStorage';

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [language, setLanguage] = useState<'so' | 'en'>('en');
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currency, setCurrency] = useState('$');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  
  const { updateUserProfile } = useData(); 

  useEffect(() => {
    try {
      // Use secureStorage for encrypted session management
      const savedUser = secureStorage.getItem('dhool_user');
      if (savedUser) setCurrentUser(savedUser);
      
      const savedLang = localStorage.getItem('dhool_lang');
      if (savedLang) setLanguage(savedLang as any);
    } catch (e) {
      console.error("Storage load error", e);
    }
  }, []);

  const handleLogin = async (email: string, pass: string) => {
    try {
        const user = await firebaseService.login(email, pass);
        if (user) {
          setCurrentUser(user);
          // Save session securely
          secureStorage.setItem('dhool_user', user);
          return true;
        }
    } catch (e) {
        console.error("Login failed", e);
    }
    return false;
  };

  const handleLogout = async () => {
    await firebaseService.logout();
    setCurrentUser(null);
    secureStorage.removeItem('dhool_user');
    navigate('/');
  };

  const handleGroupToggle = (group: string) => {
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
      setExpandedGroup(group);
    } else {
      setExpandedGroup(expandedGroup === group ? null : group);
    }
  };

  const t = (key: string) => {
    const dict: Record<string, any> = {
      so: {
        dashboard: 'Dashboard-ka',
        pos_grp: 'POS & Iibka',
        services: 'Iibka Adeegyada',
        manage_services: 'Maamulka Adeegyada',
        pos_start: 'Iibka Farmashiga',
        pharmacy: 'Bakhaarka (Pharmacy)',
        suppliers: 'Keenayaasha (Suppliers)',
        sales_grp: 'Maamulka Iibka',
        invoices: 'Biilasha Dhameystiran',
        clients_grp: 'Bukaanada & Macmiisha',
        patients: 'Diiwaanka Bukaanada',
        finance_grp: 'Maaliyadda',
        expenses: 'Kharashyada',
        payroll: 'Mushaharka',
        treasury: 'Qasnadda (Treasury)',
        reports: 'Warbixinnada',
        settings: 'Settings',
        admin: 'User-ada',
        logout: 'Ka Bax',
        queue: 'Qolka Sugitaanka'
      },
      en: {
        dashboard: 'Dashboard',
        pos_grp: 'POS & Sales',
        services: 'Clinical POS',
        manage_services: 'Manage Services',
        pos_start: 'Pharmacy POS',
        pharmacy: 'Pharmacy Stock',
        suppliers: 'Suppliers',
        sales_grp: 'Sales Management',
        invoices: 'Invoices',
        clients_grp: 'Clients',
        patients: 'Patients',
        finance_grp: 'Finance',
        expenses: 'Expenses',
        payroll: 'Payroll',
        treasury: 'Treasury & Accounts',
        reports: 'Reports',
        settings: 'Settings',
        admin: 'Users',
        logout: 'Logout',
        queue: 'Waiting Queue'
      }
    };
    return dict[language]?.[key] || key;
  };

  const canAccess = (view: ViewType) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    switch(view) {
      case 'dashboard': return true;
      case 'patients': case 'appointments': case 'services': case 'queue': return (['Doctor', 'Staff', 'Admin'] as string[]).includes(currentUser.role);
      case 'pos': case 'pharmacy': case 'suppliers': return (['Staff', 'Admin'] as string[]).includes(currentUser.role);
      case 'invoices': case 'expenses': case 'salaries': case 'reports': case 'treasury': return (['Accountant', 'Admin'] as string[]).includes(currentUser.role);
      case 'users': return false;
      default: return true;
    }
  };

  if (!currentUser) return <LoginView onLogin={handleLogin} />;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <aside className={`bg-[#111827] text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col border-r border-white/5 overflow-y-auto no-scrollbar shadow-2xl flex-shrink-0`}>
        <div className="p-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl shadow-lg shrink-0"><DhoolLogo className="w-8 h-8" /></div>
            {isSidebarOpen && <span className="text-xl font-black text-blue-500 tracking-tighter uppercase animate-in fade-in">DHOOL</span>}
          </div>
        </div>

        <nav className="flex-1 px-3">
          <NavItem to="/" label={t('dashboard')} active={location.pathname === '/'} icon={LayoutDashboard} isSidebarOpen={isSidebarOpen} />
          {canAccess('queue') && <NavItem to="/queue" label={t('queue')} active={location.pathname === '/queue'} icon={Clock} isSidebarOpen={isSidebarOpen} />}
          
          <div className="h-4"></div>

          {canAccess('pos') && (
            <NavGroup id="pos" label={t('pos_grp')} isOpen={expandedGroup === 'pos'} onToggle={() => handleGroupToggle('pos')} isSidebarOpen={isSidebarOpen} icon={ShoppingCart}>
               <SubNavItem to="/pos" label={t('pos_start')} active={location.pathname === '/pos'} />
               <SubNavItem to="/pharmacy" label={t('pharmacy')} active={location.pathname === '/pharmacy'} />
               <SubNavItem to="/suppliers" label={t('suppliers')} active={location.pathname === '/suppliers'} />
            </NavGroup>
          )}

          {canAccess('services') && (
            <NavGroup id="services_grp" label="Clinical Core" isOpen={expandedGroup === 'services_grp'} onToggle={() => handleGroupToggle('services_grp')} isSidebarOpen={isSidebarOpen} icon={Stethoscope}>
               <SubNavItem to="/services" label={t('services')} active={location.pathname === '/services'} />
               <SubNavItem to="/clinical-management" label={t('manage_services')} active={location.pathname === '/clinical-management'} />
            </NavGroup>
          )}

          {canAccess('invoices') && (
            <NavGroup id="sales" label={t('sales_grp')} isOpen={expandedGroup === 'sales'} onToggle={() => handleGroupToggle('sales')} isSidebarOpen={isSidebarOpen} icon={Receipt}>
              <SubNavItem to="/invoices" label={t('invoices')} active={location.pathname === '/invoices'} />
            </NavGroup>
          )}

          {canAccess('patients') && (
            <NavGroup id="clients" label={t('clients_grp')} isOpen={expandedGroup === 'clients'} onToggle={() => handleGroupToggle('clients')} isSidebarOpen={isSidebarOpen} icon={Users}>
              <SubNavItem to="/patients" label={t('patients')} active={location.pathname === '/patients'} />
            </NavGroup>
          )}

          {canAccess('expenses') && (
            <NavGroup id="finance" label={t('finance_grp')} isOpen={expandedGroup === 'finance'} onToggle={() => handleGroupToggle('finance')} isSidebarOpen={isSidebarOpen} icon={Wallet}>
              <SubNavItem to="/treasury" label={t('treasury')} active={location.pathname === '/treasury'} />
              <SubNavItem to="/expenses" label={t('expenses')} active={location.pathname === '/expenses'} />
              <SubNavItem to="/salaries" label={t('payroll')} active={location.pathname === '/salaries'} />
            </NavGroup>
          )}

          <div className="mt-8 border-t border-white/5 pt-4">
            {canAccess('appointments') && <NavItem to="/appointments" label={t('appointments')} active={location.pathname === '/appointments'} icon={Calendar} isSidebarOpen={isSidebarOpen} />}
            {canAccess('reports') && <NavItem to="/reports" label={t('reports')} active={location.pathname === '/reports'} icon={BarChart3} isSidebarOpen={isSidebarOpen} />}
            <NavItem to="/settings" label={t('settings')} active={location.pathname === '/settings'} icon={SettingsIcon} isSidebarOpen={isSidebarOpen} />
            {canAccess('users') && <NavItem to="/users" label={t('admin')} active={location.pathname === '/users'} icon={Shield} isSidebarOpen={isSidebarOpen} />}
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-rose-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 shrink-0" /> 
            {isSidebarOpen && <span className="ml-2 animate-in fade-in">{t('logout')}</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Menu className="w-5 h-5" /></button>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-900">{currentUser.name}</p>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{currentUser.role}</p>
            </div>
            <img src={currentUser.avatar} className="w-10 h-10 rounded-2xl border border-slate-200 p-1 bg-slate-50" />
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          <Routes>
             <Route path="/" element={<DashboardView />} />
             <Route path="/queue" element={<QueueView />} />
             <Route path="/pos" element={<POSView mode="pos" currency={currency} t={t} />} />
             <Route path="/services" element={<POSView mode="services" currency={currency} t={t} />} />
             <Route path="/clinical-management" element={<ClinicalServicesView />} />
             <Route path="/patients" element={<PatientsView user={currentUser} t={t} />} />
             <Route path="/appointments" element={<AppointmentsView />} />
             <Route path="/pharmacy" element={<PharmacyView />} />
             <Route path="/suppliers" element={<SuppliersView />} />
             <Route path="/invoices" element={<BillingView user={currentUser} />} />
             <Route path="/expenses" element={<ExpensesView />} />
             <Route path="/salaries" element={<SalariesView />} />
             <Route path="/treasury" element={<TreasuryView />} />
             <Route path="/reports" element={<ReportsView />} />
             <Route path="/users" element={<UsersView t={t} currentUser={currentUser} />} />
             <Route path="/settings" element={<SettingsView 
                  user={currentUser} 
                  language={language} setLanguage={(l) => { setLanguage(l); localStorage.setItem('dhool_lang', l); }} 
                  currency={currency} setCurrency={setCurrency} 
                  dateFormat={dateFormat} setDateFormat={setDateFormat} 
                  t={t} 
                  updateCurrentUser={async (name: string, password?: string) => {
                     if (!currentUser) return { success: false, error: 'No user' };
                     const updates: any = { name };
                     if (password) updates.password = password;
                     const updated = await updateUserProfile(currentUser.id, updates);
                     if (updated) {
                        setCurrentUser(updated); 
                        secureStorage.setItem('dhool_user', updated);
                        return { success: true };
                     }
                     return { success: false, error: 'Update failed' };
                  }}
             />} />
          </Routes>
        </section>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <DataProvider>
    <Router>
      <Routes>
        <Route path="/ai-assistant" element={<AIAssistantView />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  </DataProvider>
);

const NavItem = ({ to, label, icon: Icon, active, isSidebarOpen }: any) => (
  <Link 
    to={to} 
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
    title={!isSidebarOpen ? label : ''}
  >
    <Icon className="w-5 h-5 shrink-0" /> 
    {isSidebarOpen && <span className="text-sm font-bold tracking-tight animate-in fade-in">{label}</span>}
  </Link>
);

const NavGroup = ({ label, icon: Icon, isOpen, onToggle, isSidebarOpen, children }: any) => (
  <div className="mb-1">
    <button 
      onClick={onToggle} 
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
        isOpen ? 'bg-white/5 text-blue-400' : 'text-slate-400 hover:text-white'
      }`}
      title={!isSidebarOpen ? label : ''}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 shrink-0" />
        {isSidebarOpen && <span className="text-sm font-bold tracking-tight animate-in fade-in">{label}</span>}
      </div>
      {isSidebarOpen && (isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
    </button>
    {isOpen && isSidebarOpen && (
      <div className="mt-1 ml-4 border-l border-white/5 pl-2 space-y-1 animate-in slide-in-from-top-2">
        {children}
      </div>
    )}
  </div>
);

const SubNavItem = ({ to, label, active }: any) => (
  <Link 
    to={to} 
    className={`block w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? 'text-blue-500 bg-blue-500/10' : 'text-slate-500 hover:text-white hover:bg-white/5'
    }`}
  >
    {label}
  </Link>
);

export default App;
