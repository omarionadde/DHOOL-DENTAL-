
import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, X, Search, Filter } from 'lucide-react';
import { Salary } from '../types';
import { useData } from '../context/DataContext';

const SalariesView: React.FC = () => {
  const { salaries, addSalary } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSal, setNewSal] = useState({ staffName: '', role: 'Staff', amount: '', month: 'November' });

  const handleDelete = (id: string) => {
    // Implement delete in context if needed
    alert('Deletion restricted in demo mode.');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const sal: Salary = {
      id: `S-${Math.random().toString(36).substr(2, 5)}`,
      staffName: newSal.staffName,
      role: newSal.role,
      amount: parseInt(newSal.amount),
      month: newSal.month,
      date: new Date().toISOString().split('T')[0],
    };
    await addSalary(sal);
    setIsModalOpen(false);
    setNewSal({ staffName: '', role: 'Staff', amount: '', month: 'November' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>
          <p className="text-slate-500">Track and manage monthly staff salaries.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
          <Plus className="w-4 h-4" /> Record Salary
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
            <tr>
              <th className="px-6 py-4">Staff Name</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Period</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {salaries.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{s.staffName}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">{s.role}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{s.month}</td>
                <td className="px-6 py-4 font-bold text-slate-900">${s.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">New Payroll Entry</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <input required placeholder="Staff Full Name" value={newSal.staffName} onChange={e => setNewSal({...newSal, staffName: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none" />
              <input required placeholder="Role (e.g. Doctor)" value={newSal.role} onChange={e => setNewSal({...newSal, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none" />
              <input required type="number" placeholder="Salary Amount" value={newSal.amount} onChange={e => setNewSal({...newSal, amount: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none" />
              <select value={newSal.month} onChange={e => setNewSal({...newSal, month: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none">
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
              <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">Record Payment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalariesView;
