
import React from 'react';
import { 
  Users, Calendar, DollarSign, Package, ChevronRight, Zap, AlertTriangle, TrendingUp, TrendingDown, Database, CloudCheck
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { useData } from '../context/DataContext';

const DashboardView: React.FC = () => {
  const { patients, appointments, inventory, invoices, expenses, salaries, isOnline } = useData();

  // Financial Integration Logic
  const totalRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalSalaries = salaries.reduce((acc, sal) => acc + sal.amount, 0);
  const netProfit = totalRevenue - (totalExpenses + totalSalaries);

  const lowStockItems = inventory.filter(item => item.stock < 10);

  const chartData = [
    { name: 'Week 1', revenue: totalRevenue * 0.2, visits: patients.length * 0.1 },
    { name: 'Week 2', revenue: totalRevenue * 0.35, visits: patients.length * 0.25 },
    { name: 'Week 3', revenue: totalRevenue * 0.6, visits: patients.length * 0.5 },
    { name: 'Week 4', revenue: totalRevenue, visits: patients.length },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dhool Clinical Terminal</h1>
          <p className="text-slate-500 font-medium">Real-time clinical, financial, and logistics oversight.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 border border-blue-100 px-5 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-md">
             <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">System Integrated</span>
          </div>
          <div className={`px-5 py-3 rounded-2xl flex items-center gap-3 border ${isOnline ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
             {isOnline ? <Database className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
             <span className="text-[10px] font-black uppercase tracking-widest">
               {isOnline ? 'Data Protected & Synced' : 'Working Locally (Offline)'}
             </span>
          </div>
        </div>
      </div>

      {/* Financial Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Patients" 
          value={patients.length.toString()} 
          icon={<Users className="w-6 h-6 text-blue-600" />} 
          trend="Registry" 
          positive={true}
        />
        <StatCard 
          title="Monthly Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />} 
          trend="Inflow" 
          positive={true}
        />
        <StatCard 
          title="Clinic Outflow" 
          value={`$${(totalExpenses + totalSalaries).toLocaleString()}`} 
          icon={<TrendingDown className="w-6 h-6 text-rose-600" />} 
          trend="Expenses" 
          positive={false}
        />
        <StatCard 
          title="Net Profit" 
          value={`$${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          icon={<DollarSign className="w-6 h-6 text-indigo-600" />} 
          trend="Bottom Line" 
          positive={netProfit >= 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Chart */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 min-w-0 flex flex-col backdrop-blur-xl bg-white/80">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Growth Analytics</h3>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip contentStyle={{borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)'}} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Stock Notifications */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-900 text-xl tracking-tight">Critical Inventory</h3>
                <span className="px-4 py-1.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-full tracking-widest">Low Stock Alerts</span>
             </div>
             {lowStockItems.length === 0 ? (
               <div className="py-12 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-sm">All pharmacy levels are optimal.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-rose-50/50 rounded-2xl border border-rose-100">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center">
                             <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                             <h4 className="font-black text-slate-900 text-sm">{item.name}</h4>
                             <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{item.category}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className="text-xl font-black text-rose-600">{item.stock}</span>
                          <p className="text-[9px] text-rose-400 font-black uppercase">Units Left</p>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                 <Zap className="w-32 h-32" />
              </div>
              <h3 className="text-xl font-black mb-6 tracking-tight">Today's Queue</h3>
              <div className="space-y-4">
                 {appointments.length === 0 ? (
                   <p className="text-slate-500 text-sm font-bold italic">No visits scheduled today.</p>
                 ) : (
                   appointments.slice(0, 5).map(apt => (
                      <div key={apt.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                         <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs">
                            {apt.time.split(':')[0]}
                         </div>
                         <div className="flex-1 overflow-hidden">
                            <h4 className="font-black text-sm truncate">{apt.patientName}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{apt.reason}</p>
                         </div>
                         <ChevronRight className="w-4 h-4 text-slate-600" />
                      </div>
                   ))
                 )}
              </div>
              <button className="mt-8 w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all">
                 View Full Calendar
              </button>
           </div>

           <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-2xl">
              <h3 className="text-xl font-black mb-4 tracking-tight">Quick Reports</h3>
              <p className="text-indigo-100 text-sm font-medium mb-6">Generated clinical summary for current session.</p>
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Active Patients</span>
                    <span className="font-black text-lg">{patients.length}</span>
                 </div>
                 <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Services Offered</span>
                    <span className="font-black text-lg">{invoices.length}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend: string; positive: boolean }> = ({ title, value, icon, trend, positive }) => (
  <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-6 hover:shadow-xl hover:-translate-y-1 transition-all group backdrop-blur-xl bg-white/80">
    <div className="flex items-center justify-between">
      <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
        {icon}
      </div>
      <div className={`flex items-center text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trend}
      </div>
    </div>
    <div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h2>
    </div>
  </div>
);

export default DashboardView;
