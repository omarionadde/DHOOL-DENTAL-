
import React from 'react';
import { useData } from '../context/DataContext';
import { Clock, CheckCircle2, PlayCircle, User, Calendar, ArrowRight, UserPlus } from 'lucide-react';
import { Appointment } from '../types';

const QueueView: React.FC = () => {
  const { appointments, addNewAppointment } = useData(); 
  
  const { updateAppointmentStatus } = useData() as any; 

  const today = new Date().toISOString().split('T')[0];
  
  // Filter for today's appointments
  const todaysQueue = appointments.filter(a => a.date === today && a.status !== 'Cancelled');

  const waiting = todaysQueue.filter(a => a.status === 'Scheduled').sort((a,b) => a.time.localeCompare(b.time));
  const inProgress = todaysQueue.filter(a => a.status === 'In Progress');
  const completed = todaysQueue.filter(a => a.status === 'Completed').slice(0, 5); // Show last 5

  const handleStatusChange = async (id: string, status: 'Scheduled' | 'In Progress' | 'Completed') => {
    if(updateAppointmentStatus) {
        await updateAppointmentStatus(id, status);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Queue Management</h1>
          <p className="text-slate-500 font-medium">Real-time patient flow for reception and doctors.</p>
        </div>
        <div className="bg-slate-900 text-white px-6 py-2 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2">
            <Clock className="w-4 h-4" /> Today: {today}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* WAITING COLUMN */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-amber-50/50">
                <h3 className="text-lg font-black text-amber-600 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Waiting Room
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs ml-auto">{waiting.length}</span>
                </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3 no-scrollbar bg-slate-50/30">
                {waiting.length === 0 && <EmptyState msg="No patients waiting" />}
                {waiting.map(apt => (
                    <QueueCard 
                        key={apt.id} 
                        apt={apt} 
                        action={() => handleStatusChange(apt.id, 'In Progress')}
                        actionLabel="Call In"
                        actionColor="bg-blue-600 hover:bg-blue-700"
                        actionIcon={<ArrowRight className="w-4 h-4" />}
                    />
                ))}
            </div>
        </div>

        {/* IN TREATMENT COLUMN */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden ring-4 ring-blue-50">
            <div className="p-6 border-b border-slate-100 bg-blue-50/50">
                <h3 className="text-lg font-black text-blue-600 flex items-center gap-2">
                    <PlayCircle className="w-5 h-5" /> In Treatment
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs ml-auto">{inProgress.length}</span>
                </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3 no-scrollbar bg-blue-50/10">
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

        {/* COMPLETED COLUMN */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-emerald-50/50">
                <h3 className="text-lg font-black text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Completed
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs ml-auto">{completed.length}</span>
                </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3 no-scrollbar bg-slate-50/30">
                {completed.length === 0 && <EmptyState msg="No completed visits yet" />}
                {completed.map(apt => (
                    <div key={apt.id} className="bg-white p-4 rounded-2xl border border-slate-100 opacity-70">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-black text-slate-900 line-through decoration-slate-400">{apt.patientName}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{apt.reason}</p>
                            </div>
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase">Done</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

const QueueCard = ({ apt, action, actionLabel, actionColor, actionIcon, isActive }: any) => {
    const isGuest = apt.patientId && apt.patientId.startsWith('GUEST-');

    return (
        <div className={`bg-white p-5 rounded-3xl border transition-all shadow-sm ${isActive ? 'border-blue-200 shadow-blue-100 scale-100' : 'border-slate-100 hover:border-slate-300'}`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {apt.time.split(':')[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 text-sm leading-tight">{apt.patientName}</h4>
                            {isGuest && (
                                <span className="bg-amber-100 text-amber-700 text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest flex items-center gap-1">
                                    <UserPlus className="w-2 h-2" /> Guest
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                            <User className="w-3 h-3" /> {apt.doctor}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg truncate max-w-[120px]">{apt.reason}</span>
                <button 
                    onClick={action}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg ${actionColor}`}
                >
                    {actionLabel} {actionIcon}
                </button>
            </div>
        </div>
    );
};

const EmptyState = ({ msg }: { msg: string }) => (
    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl">
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{msg}</p>
    </div>
);

export default QueueView;
