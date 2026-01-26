
import React, { useState } from 'react';
import { Truck, Search, Plus, Trash2, Mail, Phone, User, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Supplier } from '../types';

const SuppliersView: React.FC = () => {
  const { suppliers, addNewSupplier, updateSupplier } = useData();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact: '', phone: '', email: '', debt: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSup: Supplier = {
      id: `SUP-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      contactPerson: formData.contact,
      phone: formData.phone,
      email: formData.email,
      totalDebt: parseFloat(formData.debt) || 0,
      status: 'Active'
    };
    await addNewSupplier(newSup);
    setShowModal(false);
    setFormData({ name: '', contact: '', phone: '', email: '', debt: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Suppliers & Vendors</h1>
          <p className="text-slate-500 font-medium">Manage pharmaceutical procurement and debts.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(sup => (
          <div key={sup.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                   <Truck className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-black text-slate-900 text-lg">{sup.name}</h3>
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">ID: {sup.id}</span>
                </div>
             </div>
             
             <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500"><User className="w-4 h-4" /> {sup.contactPerson}</div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500"><Phone className="w-4 h-4" /> {sup.phone}</div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500"><Mail className="w-4 h-4" /> {sup.email}</div>
             </div>

             <div className="pt-6 border-t border-slate-50 flex justify-between items-end">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outstanding Balance</p>
                   <p className="text-2xl font-black text-rose-600">${sup.totalDebt.toLocaleString()}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${sup.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>{sup.status}</span>
             </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-8 w-full max-w-md relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2"><X className="w-5 h-5" /></button>
            <h3 className="text-2xl font-black text-slate-900 mb-8">New Supplier Entry</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
               <input required placeholder="Supplier Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
               <input required placeholder="Contact Person" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
               <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
               </div>
               <input type="number" placeholder="Initial Debt ($)" value={formData.debt} onChange={e => setFormData({...formData, debt: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
               <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px]">Add to Database</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersView;
