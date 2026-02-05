
import React from 'react';
import { Wallet, DollarSign, Smartphone, History, ShieldCheck, TrendingDown, Landmark } from 'lucide-react';
import { useData } from '../context/DataContext';

const TreasuryView: React.FC = () => {
  const { invoices, expenses, salaries } = useData();

  // Actual Inflow: 
  // We include both 'Paid' and 'Refunded' statuses for POSITIVE amounts.
  const cashInflow = invoices
    .filter(i => i.method === 'Cash' && (i.status === 'Paid' || i.status === 'Refunded') && i.amount > 0)
    .reduce((acc, i) => acc + i.amount, 0);
    
  const mobileInflow = invoices
    .filter(i => i.method === 'EVC-Plus' && (i.status === 'Paid' || i.status === 'Refunded') && i.amount > 0)
    .reduce((acc, i) => acc + i.amount, 0);
  
  // Government Share (VAT 5%) - Specifically from Merchant/Mobile transactions
  // This is what the government takes from your merchant account.
  const merchantTaxShare = mobileInflow * 0.05;
  const merchantNetBalance = mobileInflow - merchantTaxShare;

  // Outflow via Refunds:
  const cashRefunds = invoices
    .filter(i => i.method === 'Cash' && i.amount < 0)
    .reduce((acc, i) => acc + Math.abs(i.amount), 0);
    
  const mobileRefunds = invoices
    .filter(i => i.method === 'EVC-Plus' && i.amount < 0)
    .reduce((acc, i) => acc + Math.abs(i.amount), 0);

  const totalExpenses = expenses.reduce((acc, i) => acc + i.amount, 0);
  const totalSalaries = salaries.reduce((acc, i) => acc + i.amount, 0);

  // Net Balances per account
  const cashAccountBalance = cashInflow - cashRefunds; 
  const merchantAccountBalance = merchantNetBalance - mobileRefunds; // Actual usable money after tax and refunds

  // Grand Net Treasury (Cash + Merchant Net - Expenses - Salaries)
  const netTreasury = (cashAccountBalance + merchantAccountBalance) - (totalExpenses + totalSalaries);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Qasnadda & Xisaabaadka</h1>
          <p className="text-slate-500 font-medium">Lasocoshada lacagta caddaanka ah iyo haraaga Merchant-ka (EVC/Zaad).</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
             <ShieldCheck className="w-4 h-4" /> VAT 5% Auto-Deducted
          </div>
        </div>
      </div>

      {/* Main Net Balance */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-10 opacity-10">
            <Landmark className="w-48 h-48" />
         </div>
         <div className="relative z-10">
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs mb-2">Wadarta Haraaga Guud (Net)</p>
            <h2 className="text-6xl font-black tracking-tighter mb-8">${netTreasury.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Caddaanka (Cash)</span>
                  <span className="text-xl font-black text-white">${cashAccountBalance.toLocaleString()}</span>
               </div>
               <div className="p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Merchant (Net)</span>
                  <span className="text-xl font-black text-emerald-400">${merchantAccountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="p-5 bg-rose-500/10 rounded-2xl border border-rose-500/20 backdrop-blur-md">
                  <span className="text-[10px] text-rose-400 uppercase tracking-widest block mb-1">Kharashka Baxay</span>
                  <span className="text-xl font-black text-rose-400">-${(totalExpenses + totalSalaries).toLocaleString()}</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Cash Account */}
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h3 className="text-2xl font-black text-slate-900">Sanduuqa Caddaanka</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Physical Cash Drawer</p>
               </div>
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6" />
               </div>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Iibka (Cash In)</span>
                  <span className="font-black text-emerald-600 text-sm">+${cashInflow.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Lacag Celis (Refunds)</span>
                  <span className="font-black text-rose-600 text-sm">-${cashRefunds.toLocaleString()}</span>
               </div>
               <div className="pt-6">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Cash Balance Available</span>
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">${cashAccountBalance.toLocaleString()}</span>
               </div>
            </div>
         </div>

         {/* Mobile Money Account - MERCHANT NET CALCULATION */}
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h3 className="text-2xl font-black text-slate-900">Merchant Account</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">EVC-Plus / Zaad Ledger</p>
               </div>
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6" />
               </div>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Total Received (Gross)</span>
                  <span className="font-black text-slate-900 text-sm">${mobileInflow.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-rose-50 bg-rose-50/30 -mx-8 px-8">
                  <span className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                     <TrendingDown className="w-3 h-3" /> Dawladda (VAT 5%)
                  </span>
                  <span className="font-black text-rose-600 text-sm">-${merchantTaxShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Reversals/Refunds</span>
                  <span className="font-black text-slate-400 text-sm">-${mobileRefunds.toLocaleString()}</span>
               </div>
               <div className="pt-6">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Real Merchant Balance</span>
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">${merchantAccountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <p className="text-[9px] text-slate-400 font-bold mt-1">Lacagtani waa inta kuugu hartay haraaga dhabta ah ka dib VAT-ta.</p>
               </div>
            </div>
         </div>
      </div>

      {/* Expense/Salary Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-rose-500" /> Operational Outflow
             </h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                   <span className="text-xs font-bold text-slate-500">Kharashyada (Expenses)</span>
                   <span className="font-black text-slate-900">${totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                   <span className="text-xs font-bold text-slate-500">Mushaharaadka (Payroll)</span>
                   <span className="font-black text-slate-900">${totalSalaries.toLocaleString()}</span>
                </div>
             </div>
          </div>
          <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white flex flex-col justify-center">
             <h3 className="text-lg font-black mb-2 tracking-tight">Government Compliance</h3>
             <p className="text-emerald-100 text-xs font-medium leading-relaxed mb-4">
                Dhammaan iibka Merchant-ka waxaa laga xisaabiyay 5% VAT. Tani waxay kuu fududaynaysaa inaad ogaato dakhligaaga saafiga ah (Net Income).
             </p>
             <div className="text-3xl font-black">
                ${merchantTaxShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span className="text-xs font-bold text-emerald-200 ml-2 uppercase tracking-widest">VAT Accumulated</span>
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
                     <th className="px-8 py-5 text-right">Amount (Gross)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {[
                     ...invoices.map(i => ({ date: i.date, desc: `INV #${i.id} - ${i.patientName}`, account: i.method, amount: i.amount, type: i.amount < 0 ? 'out' : 'in' })),
                     ...expenses.map(e => ({ date: e.date, desc: `EXP - ${e.description}`, account: 'General Fund', amount: -e.amount, type: 'out' })),
                     ...salaries.map(s => ({ date: s.date, desc: `PAYROLL - ${s.staffName}`, account: 'General Fund', amount: -s.amount, type: 'out' }))
                  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15).map((item, idx) => (
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
