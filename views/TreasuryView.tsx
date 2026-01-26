
import React from 'react';
import { Wallet, DollarSign, Smartphone, History } from 'lucide-react';
import { useData } from '../context/DataContext';

const TreasuryView: React.FC = () => {
  const { invoices, expenses, salaries } = useData();

  // Calculate Method Totals
  const cashInflow = invoices.filter(i => i.method === 'Cash' && i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0);
  const mobileInflow = invoices.filter(i => i.method === 'EVC-Plus' && i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0);
  
  // Refunds (Outflow)
  const cashRefunds = invoices.filter(i => i.method === 'Cash' && i.status === 'Refunded').reduce((acc, i) => acc + Math.abs(i.amount), 0);
  const mobileRefunds = invoices.filter(i => i.method === 'EVC-Plus' && i.status === 'Refunded').reduce((acc, i) => acc + Math.abs(i.amount), 0);

  // Assuming expenses are paid from Cash mostly, or generic fund.
  const totalOutflow = expenses.reduce((acc, i) => acc + i.amount, 0) + salaries.reduce((acc, i) => acc + i.amount, 0);

  // Balances
  const cashBalance = cashInflow - cashRefunds; // Gross Cash sitting in drawer (before expenses)
  const mobileBalance = mobileInflow - mobileRefunds; // Gross Mobile Balance

  const netTreasury = (cashBalance + mobileBalance) - totalOutflow;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Treasury & Accounts</h1>
        <p className="text-slate-500 font-medium">Track cash drawer and mobile money balances.</p>
      </div>

      {/* Main Net Balance */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-10 opacity-10">
            <Wallet className="w-40 h-40" />
         </div>
         <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs mb-2">Net Treasury Balance</p>
         <h2 className="text-5xl font-black tracking-tighter mb-6">${netTreasury.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
         <div className="flex gap-4">
            <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/5">
               <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Total Collected</span>
               <span className="text-lg font-bold text-emerald-400">+${(cashInflow + mobileInflow).toLocaleString()}</span>
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/5">
               <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Total Spent/Refunded</span>
               <span className="text-lg font-bold text-rose-400">-${(totalOutflow + cashRefunds + mobileRefunds).toLocaleString()}</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Cash Account */}
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h3 className="text-2xl font-black text-slate-900">Cash Drawer</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Physical Cash</p>
               </div>
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
               </div>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-500">Sales Inflow</span>
                  <span className="font-black text-emerald-600">+${cashInflow.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-500">Refunds Given</span>
                  <span className="font-black text-rose-600">-${cashRefunds.toLocaleString()}</span>
               </div>
               <div className="pt-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Current Drawer Estimate</span>
                  <span className="text-3xl font-black text-slate-900">${cashBalance.toLocaleString()}</span>
               </div>
            </div>
         </div>

         {/* Mobile Money Account */}
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h3 className="text-2xl font-black text-slate-900">Mobile Money</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">EVC Plus / Zaad</p>
               </div>
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
               </div>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-500">Digital Inflow</span>
                  <span className="font-black text-emerald-600">+${mobileInflow.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-500">Reversals</span>
                  <span className="font-black text-rose-600">-${mobileRefunds.toLocaleString()}</span>
               </div>
               <div className="pt-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Digital Balance</span>
                  <span className="text-3xl font-black text-slate-900">${mobileBalance.toLocaleString()}</span>
               </div>
            </div>
         </div>
      </div>

      {/* Recent Ledger */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
         <div className="p-8 border-b border-slate-100">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
               <History className="w-5 h-5 text-slate-400" /> Recent Financial Movements
            </h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                     <th className="px-8 py-5">Date</th>
                     <th className="px-8 py-5">Description</th>
                     <th className="px-8 py-5">Account</th>
                     <th className="px-8 py-5 text-right">Amount</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {/* Combine invoices and expenses for ledger view, limited to 10 */}
                  {[
                     ...invoices.map(i => ({ date: i.date, desc: `INV #${i.id} - ${i.patientName}`, account: i.method, amount: i.amount, type: i.amount < 0 ? 'out' : 'in' })),
                     ...expenses.map(e => ({ date: e.date, desc: `EXP - ${e.description}`, account: 'General Fund', amount: -e.amount, type: 'out' }))
                  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10).map((item, idx) => (
                     <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-8 py-4 text-xs font-bold text-slate-500">{item.date}</td>
                        <td className="px-8 py-4 font-black text-slate-900">{item.desc}</td>
                        <td className="px-8 py-4">
                           <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{item.account}</span>
                        </td>
                        <td className={`px-8 py-4 text-right font-black ${item.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {item.amount > 0 ? '+' : ''}{item.amount.toFixed(2)}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default TreasuryView;
