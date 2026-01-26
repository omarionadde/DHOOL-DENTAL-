
import React, { useState } from 'react';
import { User, Globe, Shield, Save, Camera, Lock, Calendar, DollarSign, Key, CheckCircle } from 'lucide-react';
import { StaffUser } from '../types';

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
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const result = await updateCurrentUser(name, password);
    setIsSaving(false);
    if (result.success) { setIsEditing(false); setPassword(''); alert(t('profile_updated') || 'Profile Updated!'); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('settings')}</h1>
        <p className="text-slate-500 font-medium">Habeey xogtaada iyo qaabka uu app-ku u shaqeynayo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Xogtaada Gaarka Ah</h3>
              {!isEditing && <button onClick={() => setIsEditing(true)} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Wax ka bedel</button>}
            </div>

            {!isEditing ? (
              <div className="flex items-center gap-6">
                <img src={user.avatar} className="w-24 h-24 rounded-3xl object-cover bg-slate-50 border" alt="" />
                <div>
                  <h4 className="text-2xl font-black text-slate-900">{user.name}</h4>
                  <p className="text-slate-500 font-bold">{user.email}</p>
                  <span className="inline-block mt-3 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{user.role}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="Full Name" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="New Password (leave blank if no change)" />
                <div className="flex gap-4">
                  <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl disabled:opacity-50 uppercase tracking-widest text-[10px]">{isSaving ? 'Kaydinaya...' : 'Kaydi'}</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase tracking-widest text-[10px]">Jooji</button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Dookhyada System-ka</h3>
            
            <div className="flex items-center justify-between py-4 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Globe className="w-5 h-5" /></div>
                <div><h5 className="font-black text-slate-900 text-sm">Luuqadda</h5><p className="text-[10px] text-slate-400 font-bold uppercase">System Language</p></div>
              </div>
              <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="bg-slate-50 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none shadow-sm">
                <option value="so">Somali</option><option value="en">English</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
                <div><h5 className="font-black text-slate-900 text-sm">Lacagta (Currency)</h5><p className="text-[10px] text-slate-400 font-bold uppercase">Default Currency</p></div>
              </div>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-slate-50 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none shadow-sm">
                <option value="$">USD ($)</option><option value="KES">KES</option><option value="SO">SOS</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Calendar className="w-5 h-5" /></div>
                <div><h5 className="font-black text-slate-900 text-sm">Taariikhda</h5><p className="text-[10px] text-slate-400 font-bold uppercase">Date Format</p></div>
              </div>
              <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="bg-slate-50 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none shadow-sm">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 text-white shadow-2xl">
            <h4 className="text-lg font-black mb-4 tracking-tight">System Status</h4>
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/5">
                 <span className="text-[10px] font-black uppercase">Firebase Cloud</span>
                 <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
               </div>
               <div className="text-[10px] text-blue-200 text-center pt-2">
                 Powered by Google Firebase
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
