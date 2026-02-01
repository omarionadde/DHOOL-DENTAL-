
import React, { useState, useEffect } from 'react';
import { User, Globe, Shield, Save, Camera, Lock, Calendar, DollarSign, Key, CheckCircle, Database, Link as LinkIcon, Download, AlertTriangle } from 'lucide-react';
import { StaffUser } from '../types';
import { daftraApi } from '../services/daftraService';
import { secureStorage } from '../utils/secureStorage';
import { useData } from '../context/DataContext';

interface Props {
  user: StaffUser;
  language: 'so' | 'en';
  setLanguage: (lang: 'so' | 'en') => void;
  currency: string;
  setCurrency: (c: string) => void;
  dateFormat: string;
  setDateFormat: (f: string) => void;
  t: (key: string) => string;
  updateCurrentUser: (name: string, password?: string) => Promise<{ success: boolean; error?: string }>;
}

const SettingsView: React.FC<Props> = ({ 
  user, language, setLanguage, currency, setCurrency, dateFormat, setDateFormat, t, updateCurrentUser
}) => {
  const data = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Daftra Integration States
  const [daftraDomain, setDaftraDomain] = useState(localStorage.getItem('daftra_domain') || 'dhool.daftra.com');
  const [daftraKey, setDaftraKey] = useState(secureStorage.getItem('daftra_api_key') || '');
  const [isDaftraTesting, setIsDaftraTesting] = useState(false);
  const [daftraStatus, setDaftraStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const result = await updateCurrentUser(name, password);
    setIsSaving(false);
    if (result.success) { setIsEditing(false); setPassword(''); }
  };

  const handleTestDaftra = async () => {
    setIsDaftraTesting(true);
    setDaftraStatus('idle');
    daftraApi.setConfig(daftraKey, daftraDomain);
    const isConnected = await daftraApi.checkConnection();
    setDaftraStatus(isConnected ? 'success' : 'error');
    setIsDaftraTesting(false);
  };

  const downloadMasterBackup = () => {
    const backupData = {
      version: "2.1.0",
      timestamp: new Date().toISOString(),
      clinic: "Dhool Dental Clinic",
      data: {
        patients: data.patients,
        inventory: data.inventory,
        invoices: data.invoices,
        expenses: data.expenses,
        salaries: data.salaries,
        clinicalServices: data.clinicalServices,
        patientHistory: data.patientHistory,
        prescriptions: data.prescriptions,
        labResults: data.labResults,
        activityLogs: data.activityLogs
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dhool_Master_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('settings')}</h1>
          <p className="text-slate-500 font-medium">Habeey xogtaada, luuqadda, iyo xiriirka system-yada kale.</p>
        </div>
        <div className="px-5 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
           <Database className="w-4 h-4" /> Subdomain Mode: Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* PROFILE SECTION */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
               <User className="w-40 h-40" />
            </div>
            <div className="flex items-center justify-between mb-10 relative z-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Xogtaada Gaarka Ah</h3>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-slate-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all">
                  Wax ka bedel
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="flex items-center gap-8 relative z-10">
                <div className="relative">
                   <img src={user.avatar} className="w-28 h-28 rounded-[2rem] object-cover bg-slate-50 border-4 border-white shadow-xl" alt="" />
                   <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                      <CheckCircle className="w-4 h-4" />
                   </div>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h4>
                  <p className="text-slate-500 font-bold mt-1">{user.email}</p>
                  <div className="flex gap-2 mt-4">
                     <span className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">{user.role}</span>
                     <span className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">Verified ID</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all" placeholder="••••••••" />
                   </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={isSaving} className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 disabled:opacity-50 uppercase tracking-widest text-[10px]">{isSaving ? 'Kaydinaya...' : 'Kaydi Isbedelada'}</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="px-10 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Jooji</button>
                </div>
              </form>
            )}
          </div>

          {/* SYSTEM DATA BACKUP */}
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white border border-white/5 shadow-2xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
               <Download className="w-40 h-40" />
            </div>
            <div className="relative z-10">
                <h3 className="text-xl font-black tracking-tight mb-2">Master System Backup</h3>
                <p className="text-slate-400 text-sm font-medium mb-8 max-w-lg">
                  Soo deji dhammaan xogta nidaamka oo isku duuban (JSON). Waxaad u isticmaali kartaa inaad ku keydiso computer kale ama aad dib ugu soo celiso system-ka haddii wax xumaadaan.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                   <button 
                     onClick={downloadMasterBackup}
                     className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-xl"
                   >
                     <Download className="w-4 h-4" /> Generate Backup File
                   </button>
                   <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     <AlertTriangle className="w-4 h-4 text-amber-500" /> Recommendation: Backup Weekly
                   </div>
                </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR PREFERENCES */}
        <div className="space-y-6">
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2"><Globe className="w-5 h-5 text-blue-600" /> Regional Dookhyada</h3>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Luuqadda System-ka</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-black text-sm shadow-sm appearance-none border border-transparent focus:border-blue-500">
                    <option value="so">Somali (Default)</option>
                    <option value="en">English (Clinical)</option>
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lacagta (Currency)</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-black text-sm shadow-sm appearance-none border border-transparent focus:border-blue-500">
                    <option value="$">USD ($) - International</option>
                    <option value="SOS">SOS - Somalia Shilling</option>
                    <option value="KES">KES - Kenya Shilling</option>
                  </select>
               </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Shield className="w-32 h-32" />
             </div>
             <h4 className="text-lg font-black mb-4 tracking-tight relative z-10">Privacy & Security</h4>
             <p className="text-indigo-100 text-xs font-medium leading-relaxed relative z-10 mb-6">
                Dhool uses military-grade local encryption (XOR+Base64) for browser storage and SSL for Firebase cloud syncing.
             </p>
             <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                   <span className="text-[10px] font-black uppercase tracking-widest">Local Encrypt</span>
                   <span className="px-3 py-1 bg-emerald-500 rounded-lg text-[9px] font-black uppercase">Enabled</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                   <span className="text-[10px] font-black uppercase tracking-widest">Auto Backup</span>
                   <span className="px-3 py-1 bg-blue-500 rounded-lg text-[9px] font-black uppercase">Active</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
