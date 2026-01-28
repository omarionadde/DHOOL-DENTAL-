
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Patient, PatientHistory, Prescription, StaffUser, LabResult } from '../types';
import { Trash2, Printer, Plus, FileText, Pill, X, Save, Clock, ClipboardList, User, Microscope, Sparkles, AlertCircle, ChevronRight } from 'lucide-react';
import { getAIAssistance } from '../services/geminiService';

interface Props {
  user: StaffUser;
  t: (key: string) => string;
}

const PatientsView: React.FC<Props> = ({ user, t }) => {
  const { 
    patients, addNewPatient, deletePat, 
    patientHistory, addNewHistory, prescriptions, addNewPrescription, removePrescription,
    labResults, addNewLabResult, inventory
  } = useData();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  
  // Forms
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [condition, setCondition] = useState('');

  // History Form
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');

  // Lab Form
  const [testName, setTestName] = useState('');
  const [testResult, setTestResult] = useState('');
  const [testStatus, setTestStatus] = useState<'Normal'|'Abnormal'|'Critical'>('Normal');

  // Prescription Form State
  const [rxQueue, setRxQueue] = useState<{name: string; dosage: string; frequency: string; duration: string}[]>([]);
  const [rxForm, setRxForm] = useState({ name: '', dosage: '', frequency: '', duration: '' });

  const [detailTab, setDetailTab] = useState<'info' | 'history' | 'prescription' | 'labs'>('info');

  const handleGetAiSummary = async () => {
    if (!selectedPatient) return;
    setIsAiLoading(true);
    const historyText = patientHistory
      .filter(h => h.patientId === selectedPatient.id)
      .map(h => `${h.date}: ${h.diagnosis} - ${h.treatment}`)
      .join(', ');
    
    const prompt = `Please provide a concise medical summary for patient ${selectedPatient.name}, age ${selectedPatient.age}. Their clinical history includes: ${historyText}. Identify potential risks or follow-up needs.`;
    const summary = await getAIAssistance(prompt, "You are a clinical analytical tool.");
    setAiSummary(summary);
    setIsAiLoading(false);
  };

  const handleAddLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const newLab: LabResult = {
      id: Date.now().toString(),
      patientId: selectedPatient.id,
      testName,
      result: testResult,
      date: new Date().toISOString().split('T')[0],
      doctorName: user.name,
      status: testStatus
    };
    await addNewLabResult(newLab);
    setTestName(''); setTestResult(''); setTestStatus('Normal');
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = {
      id: Date.now().toString(),
      name,
      age: parseInt(age),
      phone,
      lastVisit: new Date().toISOString().split('T')[0],
      medicalHistory: [],
      condition: condition || 'Checkup'
    };
    await addNewPatient(newPatient);
    setShowAddModal(false);
    setName(''); setAge(''); setPhone(''); setCondition('');
  };

  const handleAddHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const newHistory: PatientHistory = {
      id: Date.now().toString(),
      patientId: selectedPatient.id,
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      treatment,
      notes,
      doctorName: user.name
    };
    await addNewHistory(newHistory);
    setDiagnosis(''); setTreatment(''); setNotes('');
  };

  // Prescription Handlers
  const handleAddToRxQueue = () => {
    if(!rxForm.name || !rxForm.dosage) return;
    setRxQueue([...rxQueue, rxForm]);
    setRxForm({ name: '', dosage: '', frequency: '', duration: '' });
  };

  const handleRemoveFromRxQueue = (index: number) => {
    const newQueue = [...rxQueue];
    newQueue.splice(index, 1);
    setRxQueue(newQueue);
  };

  const handleSaveRx = async () => {
    if(rxQueue.length === 0 || !selectedPatient) return;
    const newRx: Prescription = {
        id: Date.now().toString(),
        patientId: selectedPatient.id,
        doctorName: user.name,
        date: new Date().toISOString().split('T')[0],
        medicines: rxQueue
    };
    await addNewPrescription(newRx);
    setRxQueue([]);
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.phone.includes(searchTerm)
    );
  }, [patients, searchTerm]);

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('patients')}</h2>
          <p className="text-slate-500 font-medium">Clinical registry and diagnostic management.</p>
        </div>
        
        <div className="flex flex-1 w-full md:w-auto gap-3">
          <div className="relative flex-1 max-w-md">
            <SearchIcon />
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 shadow-sm font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
             onClick={() => setShowAddModal(true)}
             className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Register New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPatients.map(patient => (
          <div key={patient.id} onClick={() => { setSelectedPatient(patient); setDetailTab('info'); setAiSummary(null); }} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group relative flex flex-col">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                 {patient.name.charAt(0)}
               </div>
               <div>
                 <h3 className="font-black text-slate-900 text-lg leading-tight">{patient.name}</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{patient.phone}</p>
               </div>
             </div>
             
             <div className="bg-slate-50 rounded-2xl p-4 space-y-3 mt-auto">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</span><span className="font-black text-slate-900 text-sm">{patient.age}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Visit</span><span className="font-black text-slate-900 text-[10px]">{patient.lastVisit}</span></div>
             </div>
          </div>
        ))}
      </div>

      {selectedPatient && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-6xl h-[95vh] shadow-2xl overflow-hidden flex flex-col relative">
              <div className="bg-slate-900 text-white p-10 flex justify-between items-center relative overflow-hidden shrink-0">
                 <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-2">
                      <span className="px-3 py-1 bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">Patient Terminal</span>
                      <span className="text-slate-400 text-xs font-bold">UID: {selectedPatient.id.slice(-6)}</span>
                   </div>
                   <h2 className="text-4xl font-black tracking-tight">{selectedPatient.name}</h2>
                   <p className="text-slate-400 font-bold mt-1 uppercase text-xs tracking-widest">{selectedPatient.age} Years • {selectedPatient.phone}</p>
                 </div>
                 <div className="flex items-center gap-3 relative z-10">
                    <button 
                      onClick={handleGetAiSummary} 
                      disabled={isAiLoading}
                      className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      {isAiLoading ? 'Analyzing...' : <><Sparkles className="w-4 h-4" /> AI Diagnostics</>}
                    </button>
                    <button onClick={() => setSelectedPatient(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10">
                      <X className="w-6 h-6" />
                    </button>
                 </div>
              </div>
              
              <div className="flex border-b border-slate-100 bg-white p-2 gap-2 overflow-x-auto no-scrollbar shrink-0">
                 <TabButton active={detailTab === 'info'} onClick={() => setDetailTab('info')} icon={<FileText className="w-4 h-4" />} label="Overview" />
                 <TabButton active={detailTab === 'history'} onClick={() => setDetailTab('history')} icon={<ClipboardList className="w-4 h-4" />} label="Clinical History" />
                 <TabButton active={detailTab === 'prescription'} onClick={() => setDetailTab('prescription')} icon={<Pill className="w-4 h-4" />} label="Prescription" />
                 <TabButton active={detailTab === 'labs'} onClick={() => setDetailTab('labs')} icon={<Microscope className="w-4 h-4" />} label="Laboratory" />
              </div>

              <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50 no-scrollbar">
                 {aiSummary && (
                   <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-top-4">
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">
                        <Sparkles className="w-4 h-4" /> Gemini AI Insight
                      </h4>
                      <p className="text-slate-800 text-sm font-medium leading-relaxed italic">"{aiSummary}"</p>
                   </div>
                 )}

                 {detailTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Vitals & Summary</h3>
                        <div className="space-y-6">
                          <DataRow label="Chief Complaint" value={selectedPatient.condition || 'General Checkup'} />
                          <DataRow label="Recent Activity" value={selectedPatient.lastVisit} />
                          <DataRow label="System Status" value="Healthy / Stable" />
                        </div>
                      </div>
                      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center opacity-40">
                         <Microscope className="w-20 h-20 mb-4 text-slate-300" />
                         <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">No Imaging Uploaded</p>
                      </div>
                    </div>
                 )}

                 {detailTab === 'history' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                       <div className="lg:col-span-1">
                          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-0">
                             <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Add Clinical Note</h3>
                             <form onSubmit={handleAddHistory} className="space-y-4">
                                <div className="space-y-1">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diagnosis</label>
                                   <input required value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="e.g. Dental Caries" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Treatment Plan</label>
                                   <input required value={treatment} onChange={e => setTreatment(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="e.g. Root Canal Therapy" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Notes</label>
                                   <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm h-24" placeholder="Observations..." />
                                </div>
                                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg hover:bg-blue-700 transition-all">Save Record</button>
                             </form>
                          </div>
                       </div>
                       <div className="lg:col-span-2 space-y-6">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3"><ClipboardList className="w-5 h-5 text-slate-400" /> History Log</h3>
                          {patientHistory.filter(h => h.patientId === selectedPatient.id).map(record => (
                             <div key={record.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                                <div className="flex justify-between items-start mb-4">
                                   <div>
                                     <h4 className="text-lg font-black text-slate-900">{record.diagnosis}</h4>
                                     <p className="text-blue-600 font-bold text-sm mt-1">{record.treatment}</p>
                                   </div>
                                   <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{record.date}</span>
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">{record.notes}</p>
                                <div className="pt-4 border-t border-slate-50 flex items-center gap-2">
                                   <User className="w-4 h-4 text-slate-300" />
                                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dr. {record.doctorName}</span>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}

                 {detailTab === 'prescription' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* PRESCRIPTION BUILDER */}
                        <div className="lg:col-span-1">
                           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-0">
                              <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Prescription Builder</h3>
                              
                              <div className="space-y-4 mb-6">
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medicine Name</label>
                                    <input 
                                       list="meds-list"
                                       value={rxForm.name} 
                                       onChange={e => setRxForm({...rxForm, name: e.target.value})} 
                                       className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-100 transition-all" 
                                       placeholder="Search or type..." 
                                    />
                                    <datalist id="meds-list">
                                       {inventory.map(m => <option key={m.id} value={m.name} />)}
                                    </datalist>
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage</label>
                                    <input 
                                       value={rxForm.dosage} 
                                       onChange={e => setRxForm({...rxForm, dosage: e.target.value})} 
                                       className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-100 transition-all" 
                                       placeholder="e.g. 500mg" 
                                    />
                                 </div>
                                 <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                                       <input 
                                          value={rxForm.frequency} 
                                          onChange={e => setRxForm({...rxForm, frequency: e.target.value})} 
                                          className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-100 transition-all" 
                                          placeholder="e.g. 1-0-1" 
                                       />
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                                       <input 
                                          value={rxForm.duration} 
                                          onChange={e => setRxForm({...rxForm, duration: e.target.value})} 
                                          className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-100 transition-all" 
                                          placeholder="e.g. 5 Days" 
                                       />
                                    </div>
                                 </div>
                                 <button 
                                    onClick={handleAddToRxQueue}
                                    type="button" 
                                    className="w-full py-3 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                                 >
                                    Add Medicine to List
                                 </button>
                              </div>

                              {/* Queue List */}
                              {rxQueue.length > 0 && (
                                 <div className="mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Medicines to Prescribe</h4>
                                    <div className="space-y-2">
                                       {rxQueue.map((item, idx) => (
                                          <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                             <div>
                                                <p className="text-xs font-black text-slate-800">{item.name}</p>
                                                <p className="text-[10px] text-slate-500">{item.dosage} • {item.frequency}</p>
                                             </div>
                                             <button onClick={() => handleRemoveFromRxQueue(idx)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg"><X className="w-3 h-3" /></button>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}

                              <button 
                                 onClick={handleSaveRx}
                                 disabled={rxQueue.length === 0}
                                 className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                 Issue Final Prescription
                              </button>
                           </div>
                        </div>

                        {/* HISTORY */}
                        <div className="lg:col-span-2 space-y-6">
                           <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3"><Pill className="w-5 h-5 text-slate-400" /> Prescription History</h3>
                           
                           {prescriptions.filter(p => p.patientId === selectedPatient.id).length === 0 ? (
                              <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                 <p className="text-slate-400 font-bold text-sm">No prescriptions issued yet.</p>
                              </div>
                           ) : (
                              prescriptions.filter(p => p.patientId === selectedPatient.id).map(rx => (
                                 <div key={rx.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                                       <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                             <FileText className="w-5 h-5" />
                                          </div>
                                          <div>
                                             <h4 className="font-black text-slate-900 text-sm">Rx Issued: {rx.date}</h4>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dr. {rx.doctorName}</p>
                                          </div>
                                       </div>
                                       <div className="flex gap-2">
                                          <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Print">
                                             <Printer className="w-4 h-4" />
                                          </button>
                                          <button onClick={() => { if(confirm('Delete record?')) removePrescription(rx.id) }} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                             <Trash2 className="w-4 h-4" />
                                          </button>
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       {rx.medicines.map((med, idx) => (
                                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                                             <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-black text-xs">
                                                   {idx + 1}
                                                </div>
                                                <div>
                                                   <p className="font-black text-slate-900 text-sm">{med.name}</p>
                                                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{med.dosage}</p>
                                                </div>
                                             </div>
                                             <div className="text-right">
                                                <p className="font-black text-slate-900 text-xs">{med.frequency}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{med.duration}</p>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              ))
                           )}
                        </div>
                    </div>
                 )}

                 {detailTab === 'labs' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                       <div className="lg:col-span-1">
                          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-0">
                             <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">New Lab Report</h3>
                             <form onSubmit={handleAddLab} className="space-y-4">
                                <div className="space-y-1">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Name</label>
                                   <input required value={testName} onChange={e => setTestName(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="e.g. CBC / X-Ray" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Findings / Result</label>
                                   <textarea required value={testResult} onChange={e => setTestResult(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm h-24" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Severity</label>
                                   <select value={testStatus} onChange={e => setTestStatus(e.target.value as any)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm">
                                      <option>Normal</option>
                                      <option>Abnormal</option>
                                      <option>Critical</option>
                                   </select>
                                </div>
                                <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 transition-all">Submit Report</button>
                             </form>
                          </div>
                       </div>
                       <div className="lg:col-span-2 space-y-6">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3"><Microscope className="w-5 h-5 text-slate-400" /> Diagnostic History</h3>
                          {labResults.filter(l => l.patientId === selectedPatient.id).length === 0 ? (
                             <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold text-sm">No lab reports found.</p>
                             </div>
                          ) : (
                             labResults.filter(l => l.patientId === selectedPatient.id).map(lab => (
                               <div key={lab.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                                  <div className="flex justify-between items-center mb-4">
                                     <h4 className="text-lg font-black text-slate-900">{lab.testName}</h4>
                                     <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                       lab.status === 'Critical' ? 'bg-rose-50 text-rose-600' : 
                                       lab.status === 'Abnormal' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                     }`}>{lab.status}</span>
                                  </div>
                                  <p className="text-sm font-bold text-slate-600 mb-4">{lab.result}</p>
                                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-4">
                                     <span>Ordered by: Dr. {lab.doctorName}</span>
                                     <span>{lab.date}</span>
                                  </div>
                               </div>
                             ))
                          )}
                       </div>
                    </div>
                 )}
              </div>
           </div>
         </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] p-8 w-full max-w-md relative shadow-2xl">
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2"><X className="w-5 h-5" /></button>
              <h3 className="text-2xl font-black text-slate-900 mb-8">Patient Registration</h3>
              <form onSubmit={handleAddPatient} className="space-y-4">
                 <input required placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                 <input required type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                 <input required placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                 <input placeholder="Chief Complaint (Optional)" value={condition} onChange={e => setCondition(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                 <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl hover:bg-blue-700 transition-all">Create Profile</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const SearchIcon = () => (
  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3"/></svg>
);

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);

const DataRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
    <p className="text-lg font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);

export default PatientsView;
