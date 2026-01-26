
import React, { useState } from 'react';
import { StaffUser, Role } from '../types';
import { Shield, UserPlus, Trash2, Mail, Lock, User, X, Check, Eye } from 'lucide-react';
import { useData } from '../context/DataContext';

interface Props {
  t: (key: string) => string;
  currentUser?: StaffUser;
}

const UsersView: React.FC<Props> = ({ t, currentUser }) => {
  const { users: appUsers, addNewUser, removeUser } = useData();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Staff');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    
    setIsLoading(true);
    const newUser: StaffUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password,
      role,
      status: 'Active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`
    };
    
    const result = await addNewUser(newUser);
    setIsLoading(false);
    
    if (result.success) {
        alert(t('userAdded'));
        setShowModal(false);
        setName(''); setEmail(''); setPassword(''); setRole('Staff');
    } else {
        alert(t('errorAddingUser') + (result.error ? `: ${result.error}` : ''));
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      alert('You cannot delete yourself!');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      await removeUser(id);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('admin')}</h1>
          <p className="text-slate-500 font-medium">Manage clinical staff and access permissions.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {t('userAdded') ? t('addUser') : 'Add User'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appUsers.map(u => (
          <div key={u.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={() => handleDelete(u.id)}
                disabled={u.id === currentUser?.id}
                className="p-2 text-slate-300 hover:text-rose-600 transition-colors disabled:opacity-0"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <img src={u.avatar} className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-1" alt="" />
              <div>
                <h3 className="font-black text-slate-900 text-lg leading-tight">{u.name}</h3>
                <p className="text-xs font-bold text-slate-400 mt-0.5">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                u.role === 'Admin' ? 'bg-purple-50 text-purple-600' : 
                u.role === 'Doctor' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
              }`}>
                {u.role}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                {u.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Access Matrix */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm mt-8">
        <div className="p-8 border-b border-slate-100">
           <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-600" /> Access Permissions
           </h3>
           <p className="text-slate-400 text-sm font-medium mt-1">This table shows which parts of the system are visible to each role.</p>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                 <tr>
                    <th className="px-6 py-4">Module</th>
                    <th className="px-6 py-4 text-center">Admin</th>
                    <th className="px-6 py-4 text-center">Doctor</th>
                    <th className="px-6 py-4 text-center">Staff</th>
                    <th className="px-6 py-4 text-center">Accountant</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {[
                    { name: 'Dashboard', admin: true, doc: true, staff: true, acc: true },
                    { name: 'Patients & History', admin: true, doc: true, staff: true, acc: false },
                    { name: 'Appointments', admin: true, doc: true, staff: true, acc: false },
                    { name: 'POS & Pharmacy', admin: true, doc: false, staff: true, acc: false },
                    { name: 'Invoices & Billing', admin: true, doc: false, staff: false, acc: true },
                    { name: 'Expenses & Payroll', admin: true, doc: false, staff: false, acc: true },
                    { name: 'Reports', admin: true, doc: false, staff: false, acc: true },
                    { name: 'User Management', admin: true, doc: false, staff: false, acc: false },
                 ].map((mod, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                       <td className="px-6 py-4 font-black text-slate-800 text-xs">{mod.name}</td>
                       <td className="px-6 py-4 text-center">{mod.admin ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-200 mx-auto" />}</td>
                       <td className="px-6 py-4 text-center">{mod.doc ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-200 mx-auto" />}</td>
                       <td className="px-6 py-4 text-center">{mod.staff ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-200 mx-auto" />}</td>
                       <td className="px-6 py-4 text-center">{mod.acc ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-200 mx-auto" />}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

       {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <input required value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="John Doe" />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative">
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="john@dhool.com" />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="••••••••" />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                  <div className="relative">
                    <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm appearance-none">
                      <option value="Staff">Staff (POS & Sales)</option>
                      <option value="Doctor">Doctor (Clinical)</option>
                      <option value="Accountant">Accountant (Finance)</option>
                      <option value="Admin">Admin (Full Access)</option>
                    </select>
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
               </div>
               <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 mt-4 disabled:opacity-50">
                  {isLoading ? 'Creating...' : 'Create User Account'}
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
