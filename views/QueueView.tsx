
import React from 'react';
import { useData } from '../context/DataContext';
import { Clock, CheckCircle2, PlayCircle, User, Calendar, ArrowRight, UserPlus, Zap } from 'lucide-react';
import { Appointment } from '../types';

const QueueView: React.FC = () => {
  const { appointments } = useData(); 
  const { updateAppointmentStatus } = useData() as any; 

  const today = new Date().toISOString().split('T')[0];
  
  // Filter for today's appointments
  const todaysQueue = appointments.filter(a => a.date === today && a.status !== 'Cancelled');

  // Helper to sort by time string (e.g. "09:00 AM")
  const sortByTime = (a: Appointment, b: Appointment) => {
    // Basic string comparison works for HH:MM format, 
    // but we can make it more robust if needed.
    return a.time.localeCompare(b.time);
  };

  const waiting = todaysQueue
    .filter(a => a.status === 'Scheduled')
    .sort(sortByTime);

  const inProgress = todaysQueue
    .filter(a => a.status === 'In Progress')
    .sort(sortByTime);

  const completed = todaysQueue
    .filter(a => a.status === 'Completed')
    .sort((a, b) => b.time.localeCompare(a.time)) // Show most recently completed at the top
    .slice(0, 8); 

  const handleStatusChange = async (id: string, status: 'Scheduled' | 'In Progress' | 'Completed') => {
    if(updateAppointmentStatus) {
        await updateAppointmentStatus(id, status);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Safaka Bukaanada (Live)</h1>
          <p className="text-slate-500 font-medium">U kala horaysii bukaanka sida ay u soo galeen iyo waqtigooda.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                <Zap className="w-3 h-3" /> Live Syncing
            </div>
            <div className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                <Clock className="w-4 h-4" /> {today}
            </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* WAITING COLUMN - SORTED BY TIME ASC */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
                <h3 className="text-lg font-black text-amber-600 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Waiting Room
                </h3>
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black">{waiting.length} Pts</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4 no-scrollbar bg-slate-50/30">
                {waiting.length === 0 && <EmptyState msg="No patients waiting" />}
                {waiting.map((apt, index) => (
                    <QueueCard 
                        key={apt.id} 
                        apt={apt} 
                        isNext={index === 0} // Highlight the first person
                        action={() => handleStatusChange(apt.id, 'In Progress')}
                        actionLabel="Call In"
                        actionColor="bg-blue-600 hover:bg-blue-700"
                        actionIcon={<ArrowRight className="w-4 h-4" />}
                    />
                ))}
            </div>
        </div>

        {/* IN TREATMENT COLUMN - SORTED BY TIME ASC */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden ring-4 ring-blue-50/50">
            <div className="p-6 border-b border-slate-100 bg-blue-50/50 flex items-center justify-between">
                <h3 className="text-lg font-black text-blue-600 flex items-center gap-2">
                    <PlayCircle className="w-5 h-5" /> In Treatment
                </h3>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black">{inProgress.length} Active</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4 no-scrollbar bg-blue-50/10">
                {inProgress.length === 0 && <EmptyState msg="Chair is empty" />}
                {inProgress.map(apt => (
                    <QueueCard 
                        key={apt.id} 
                        apt={apt} 
                        action={() => handleStatusChange(apt.id, 'Completed')}
                        actionLabel="Finish"
                        actionColor="bg-emerald-600 hover:bg-emerald-700"
                        actionIcon={<CheckCircle2 className="w-4 h-4" />}
                        isActive
                    />
                ))}
            </div>
        </div>

        {/* COMPLETED COLUMN - SORTED BY TIME DESC */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-emerald-50/50 flex items-center justify-between">
                <h3 className="text-lg font-black text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Completed
                </h3>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black">{completed.length} Today</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3 no-scrollbar bg-slate-50/30">
                {completed.length === 0 && <EmptyState msg="No completed visits yet" />}
                {completed.map(apt => (
                    <div key={apt.id} className="bg-white p-5 rounded-3xl border border-slate-100 opacity-60 flex justify-between items-center group hover:opacity-100 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-sm line-through decoration-slate-300">{apt.patientName}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{apt.time}</span>
                                    <span className="text-[9px] font-bold text-slate-300">•</span>
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Processed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

const QueueCard = ({ apt, action, actionLabel, actionColor, actionIcon, isActive, isNext }: any) => {
    const isGuest = apt.patientId && apt.patientId.startsWith('GUEST-');

    return (
        <div className={`bg-white p-5 rounded-[2rem] border transition-all relative ${
            isActive 
            ? 'border-blue-300 shadow-xl shadow-blue-100 scale-[1.02] z-10' 
            : isNext 
            ? 'border-amber-300 shadow-lg shadow-amber-50 ring-2 ring-amber-100 animate-pulse' 
            : 'border-slate-100 hover:border-slate-300'
        }`}>
            {isNext && (
                <div className="absolute -top-2 left-6 px-3 py-1 bg-amber-500 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-200 z-20">
                    Next Up
                </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-colors ${
                        isActive ? 'bg-blue-600 text-white' : isNext ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                        {apt.time.split(' ')[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-slate-900 text-base leading-tight">{apt.patientName}</h4>
                            {isGuest && (
                                <span className="bg-slate-900 text-white text-[7px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                    <UserPlus className="w-2 h-2" /> Guest
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase mt-1">
                            <User className="w-3.5 h-3.5 text-blue-400" /> Dr. {apt.doctor.split(' ').pop()}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">#{apt.id.slice(-4)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 mt-2">
                <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span className="text-[10px] font-bold text-slate-500 truncate block">{apt.reason}</span>
                    </div>
                </div>
                <button 
                    onClick={action}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg active:scale-95 ${actionColor}`}
                >
                    {actionLabel} {actionIcon}
                </button>
            </div>
        </div>
    );
};

const EmptyState = ({ msg }: { msg: string }) => (
    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white/50">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
            <User className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{msg}</p>
    </div>
);

export default QueueView;
