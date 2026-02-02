
import React, { useState } from 'react';
import { 
  Calendar, Clock, User, Stethoscope, CheckCircle2, XCircle, Clock3, PlusCircle, X, UserPlus, Users
} from 'lucide-react';
import { Appointment } from '../types';
import { useData } from '../context/DataContext';

const AppointmentsView: React.FC = () => {
  const { appointments, patients, addNewAppointment } = useData();
  const [showModal, setShowModal] = useState(false);
  
  // Toggle between existing patient list or new guest
  const [isGuest, setIsGuest] = useState(false);
  const [guestName, setGuestName] = useState('');

  const [formData, setFormData] = useState({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM',
    reason: '',
    doctor: 'Dr. Mohamed Abdi'
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalPatientName = 'Unknown';
    let finalPatientId = '';

    if (isGuest) {
        if(!guestName.trim()) {
            alert("Fadlan geli magaca qofka.");
            return;
        }
        finalPatientName = guestName;
        // Generate a temporary ID for guests so the system doesn't crash
        finalPatientId = `GUEST-${Date.now()}`;
    } else {
        const patient = patients.find(p => p.id === formData.patientId);
        if (!patient) {
            alert("Fadlan dooro bukaan.");
            return;
        }
        finalPatientName = patient.name;
        finalPatientId = formData.patientId;
    }

    const newApt: Appointment = {
      id: `APT-${Date.now().toString().slice(-5)}`,
      patientId: finalPatientId,
      patientName: finalPatientName,
      doctor: formData.doctor,
      date: formData.date,
      time: formData.time,
      status: 'Scheduled',
      reason: formData.reason
    };

    await addNewAppointment(newApt);
    setShowModal(false);
    
    // Reset form
    setFormData({
        patientId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00 AM',
        reason: '',
        doctor: 'Dr. Mohamed Abdi'
    });
    setGuestName('');
    setIsGuest(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 font-medium">Manage doctor consultations and scheduling.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-blue-700 transition-all">
          <PlusCircle className="w-4 h-4" /> Book Consultation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {appointments.length === 0 ? (
              <div className="bg-white p-12 rounded-[2rem] border border-dashed border-slate-200 text-center">
                  <Clock3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm">No appointments scheduled.</p>
              </div>
          ) : (
            appointments.map((apt) => (
                <div key={apt.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between group hover:border-blue-500 transition-all gap-4">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                        {apt.time.split(':')[0]}
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 text-lg">{apt.patientName}</h4>
                        {apt.patientId.startsWith('GUEST-') && (
                            <span className="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest ml-2">Walk-in / Guest</span>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {apt.date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {apt.time}</span>
                        <span className="flex items-center gap-1.5"><Stethoscope className="w-3 h-3" /> {apt.doctor}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 self-end md:self-center">
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        apt.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                        {apt.status}
                    </div>
                </div>
                </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Book Appointment</h3>
            
            <form onSubmit={handleAdd} className="space-y-5">
              
              {/* Toggle Patient Type */}
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => setIsGuest(false)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!isGuest ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Users className="w-4 h-4" /> Existing Patient
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsGuest(true)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isGuest ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <UserPlus className="w-4 h-4" /> New / Guest
                  </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {isGuest ? "Guest Name" : "Select Registered Patient"}
                </label>
                
                {isGuest ? (
                    <input 
                        required 
                        autoFocus
                        value={guestName} 
                        onChange={e => setGuestName(e.target.value)} 
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all" 
                        placeholder="Enter full name..." 
                    />
                ) : (
                    <select 
                        required 
                        value={formData.patientId} 
                        onChange={e => setFormData({...formData, patientId: e.target.value})} 
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all appearance-none"
                    >
                        <option value="">-- Choose Patient --</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>)}
                    </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                  <input type="text" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all" placeholder="09:00 AM" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Visit</label>
                <input required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all" placeholder="e.g. Tooth Extraction" />
              </div>
              
              <div className="pt-2">
                  <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl hover:bg-blue-700 transition-all hover:-translate-y-1">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsView;
