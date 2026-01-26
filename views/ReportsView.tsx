
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Package, Wallet, ShoppingBag, Calendar, Stethoscope, Filter, Search, ChevronRight, Download
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { useData } from '../context/DataContext';

const ReportsView: React.FC = () => {
  const { patients, inventory, invoices, expenses, salaries } = useData();
  
  // Date states
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const [reportRange, setReportRange] = useState('This Month');
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayStr);

  // Filtering Logic
  const filteredInvoices = useMemo(() => {
    let start = new Date(startDate);
    let end = new Date(endDate);
    const now = new Date();

    if (reportRange === 'Today') {
      start = new Date(now.setHours(0,0,0,0));
      end = new Date(now.setHours(23,59,59,999));
    } else if (reportRange === 'Specific Day') {
      start = new Date(startDate);
      start.setHours(0,0,0,0);
      end = new Date(startDate);
      end.setHours(23,59,59,999);
    } else if (reportRange === 'This Month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date();
    } else if (reportRange === 'Last Month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (reportRange === 'Last Quarter') {
      start = new Date();
      start.setMonth(start.getMonth() - 3);
      end = new Date();
    }

    const filterFn = (item: { date: string }) => {
      const d = new Date(item.date);
      return d >= start && d <= end;
    };

    return invoices.filter(filterFn);
  }, [invoices, reportRange, startDate, endDate]);

  const stats = useMemo(() => {
    const totalRev = filteredInvoices.reduce((a, b) => a + (b.status === 'Paid' ? b.amount : 0), 0);
    const totalEx = expenses.reduce((a, b) => a + b.amount, 0);
    const pharmacySales = filteredInvoices.filter(i => i.type === 'Pharmacy').reduce((a, b) => a + b.amount, 0);
    const clinicalSales = filteredInvoices.filter(i => i.type === 'Dental').reduce((a, b) => a + b.amount, 0);
    
    return { totalRev, totalEx, pharmacySales, clinicalSales };
  }, [filteredInvoices, expenses]);

  const barData = [
    { name: 'Clinical', value: stats.clinicalSales, color: '#2563eb' },
    { name: 'Pharmacy', value: stats.pharmacySales, color: '#059669' },
    { name: 'Expenses', value: stats.totalEx, color: '#e11d48' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Reports</h1>
          <p className="text-slate-500 font-medium">Historical analysis and financial performance.</p>
        </div>
        
        <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap gap-2">
           {['Today', 'Specific Day', 'This Month', 'Last Month', 'Last Quarter', 'Custom'].map(range => (
             <button 
               key={range}
               onClick={() => setReportRange(range)}
               className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${reportRange === range ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
             >
               {range}
             </button>
           ))}
        </div>
      </div>

      {(reportRange === 'Custom' || reportRange === 'Specific Day') && (
        <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex flex-wrap gap-6 items-end animate-in slide-in-from-top-4">
           <div className="space-y-1">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">{reportRange === 'Specific Day' ? 'Select Date' : 'Start Date'}</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-5 py-3 bg-white border border-blue-200 rounded-2xl text-xs font-black outline-none" />
           </div>
           {reportRange === 'Custom' && (
             <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-5 py-3 bg-white border border-blue-200 rounded-2xl text-xs font-black outline-none" />
             </div>
           )}
           <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Generate Report</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <ReportCard title="Revenue" value={`$${stats.totalRev.toLocaleString()}`} icon={<TrendingUp className="w-5 h-5" />} color="emerald" />
         <ReportCard title="Clinical" value={`$${stats.clinicalSales.toLocaleString()}`} icon={<Stethoscope className="w-5 h-5" />} color="blue" />
         <ReportCard title="Pharmacy" value={`$${stats.pharmacySales.toLocaleString()}`} icon={<ShoppingBag className="w-5 h-5" />} color="indigo" />
         <ReportCard title="Expenses" value={`$${stats.totalEx.toLocaleString()}`} icon={<TrendingDown className="w-5 h-5" />} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col h-[500px]">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
               <BarChart3 className="w-5 h-5 text-blue-600" /> Revenue vs Outflow
            </h3>
            <div className="flex-1">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <Tooltip contentStyle={{borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)'}} cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[15, 15, 0, 0]}>
                      {barData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                 <Wallet className="w-5 h-5 text-emerald-600" /> Recent Transactions
              </h3>
              <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"><Download className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
               {filteredInvoices.slice(0, 10).map((inv) => (
                 <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all">
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${inv.type === 'Dental' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {inv.type.charAt(0)}
                       </div>
                       <div>
                          <p className="font-black text-slate-900 text-sm leading-tight">{inv.patientName}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{inv.date}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-slate-900 text-sm">${inv.amount.toFixed(2)}</p>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{inv.method}</span>
                    </div>
                 </div>
               ))}
               {filteredInvoices.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                    <Search className="w-16 h-16 mb-4" />
                    <p className="font-black uppercase text-xs tracking-widest">No matching records</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

const ReportCard = ({ title, value, icon, color }: any) => {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100'
  };
  return (
    <div className={`p-8 rounded-[2.5rem] border ${colors[color]} shadow-sm flex flex-col gap-6 bg-white hover:shadow-2xl hover:-translate-y-1 transition-all group`}>
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{title}</p>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900">{value}</h2>
       </div>
    </div>
  );
};

export default ReportsView;
