
import React, { useState } from 'react';
import { 
  Calendar, Clock, User, Stethoscope, CheckCircle2, XCircle, Clock3, PlusCircle, X
} from 'lucide-react';
import { Appointment } from '../types';
import { useData } from '../context/DataContext';

const AppointmentsView: React.FC = () => {
  const { appointments, patients, addNewAppointment } = useData();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM',
    reason: '',
    doctor: 'Dr. Ahmed Osman'
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    const newApt: Appointment = {
      id: `APT-${Date.now().toString().slice(-5)}`,
      patientId: formData.patientId,
      patientName: patient?.name || 'Unknown',
      doctor: formData.doctor,
      date: formData.date,
      time: formData.time,
      status: 'Scheduled',
      reason: formData.reason
    };

    await addNewAppointment(newApt);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 font-medium">Manage doctor consultations and scheduling.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Book Consultation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-500 transition-all">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {apt.time.split(':')[0]}
                 </div>
                 <div>
                    <h4 className="font-black text-slate-900 text-lg">{apt.patientName}</h4>
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                       <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {apt.date}</span>
                       <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {apt.time}</span>
                       <span className="flex items-center gap-1.5"><Stethoscope className="w-3 h-3" /> {apt.doctor}</span>
                    </div>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl"><CheckCircle2 className="w-5 h-5" /></button>
                 <button className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl"><XCircle className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2"><X className="w-5 h-5" /></button>
            <h3 className="text-2xl font-black text-slate-900 mb-6">Book Appointment</h3>
            <form onSubmit={handleAdd} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Patient</label>
                <select required value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm">
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                  <input type="text" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="09:00 AM" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                <input required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="e.g. Tooth Extraction" />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px]">Confirm Booking</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsView;
