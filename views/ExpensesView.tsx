
import React, { useState } from 'react';
import { Wallet, Search, Plus, Trash2, X, Filter } from 'lucide-react';
import { Expense } from '../types';
import { useData } from '../context/DataContext';

const ExpensesView: React.FC = () => {
  const { expenses, addExpense } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExp, setNewExp] = useState({ description: '', category: 'Other', amount: '', date: new Date().toISOString().split('T')[0] });

  // Currently DataContext doesn't have deleteExpense, assuming add-only or simplified for this example
  const handleDelete = (id: string) => {
    // Implement delete in context if needed, just alerting for now
    alert('Deletion restricted in demo mode.');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const exp: Expense = {
      id: `E-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      description: newExp.description,
      category: newExp.category as any,
      amount: parseFloat(newExp.amount),
      date: newExp.date,
    };
    
    await addExpense(exp);
    setIsModalOpen(false);
    setNewExp({ description: '', category: 'Other', amount: '', date: new Date().toISOString().split('T')[0] });
  };

  const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Expense Tracking</h1>
          <p className="text-slate-500 font-medium">Manage operational costs and clinic overheads.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Outflow</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">${total.toFixed(2)}</h2>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Categories</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{new Set(expenses.map(e => e.category)).size}</h2>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Entries</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{expenses.length}</h2>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Description</th>
              <th className="px-8 py-5">Category</th>
              <th className="px-8 py-5">Date</th>
              <th className="px-8 py-5">Amount</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-4 font-black text-slate-900">{e.description}</td>
                <td className="px-8 py-4">
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{e.category}</span>
                </td>
                <td className="px-8 py-4 text-xs font-bold text-slate-500 tracking-tight">{e.date}</td>
                <td className="px-8 py-4 font-black text-rose-600">-${e.amount.toFixed(2)}</td>
                <td className="px-8 py-4 text-right">
                  <button onClick={() => handleDelete(e.id)} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Expense</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="p-8 space-y-5">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                 <input required placeholder="e.g. Office Rent" value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                 <select value={newExp.category} onChange={e => setNewExp({...newExp, category: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20">
                   <option value="Utilities">Utilities</option>
                   <option value="Equipment">Equipment</option>
                   <option value="Rent">Rent</option>
                   <option value="Procurement">Procurement</option>
                   <option value="Salaries">Salaries</option>
                   <option value="Other">Other</option>
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
                 <input required type="number" step="0.01" placeholder="0.00" value={newExp.amount} onChange={e => setNewExp({...newExp, amount: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                 <input required type="date" value={newExp.date} onChange={e => setNewExp({...newExp, date: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <button type="submit" className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 shadow-xl shadow-rose-600/20 transition-all">Record Transaction</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesView;
