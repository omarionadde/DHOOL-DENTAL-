
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Patient, PatientHistory, Prescription, StaffUser, LabResult } from '../types';
import { Trash2, Printer, Plus, FileText, Pill, X, Save, Clock, ClipboardList, User, Microscope, Sparkles, AlertCircle } from 'lucide-react';
import { getAIAssistance } from '../services/geminiService';

interface Props {
  user: StaffUser;
  t: (key: string) => string;
}

const PatientsView: React.FC<Props> = ({ user, t }) => {
  const { 
    patients, addNewPatient, deletePat, 
    patientHistory, addNewHistory, prescriptions, addNewPrescription, removePrescription,
    labResults, addNewLabResult
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

  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');

  // Lab Form
  const [testName, setTestName] = useState('');
  const [testResult, setTestResult] = useState('');
  const [testStatus, setTestStatus] = useState<'Normal'|'Abnormal'|'Critical'>('Normal');

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
                 <TabButton active={detailTab === 'prescription'} onClick={() => setDetailTab('prescription')} icon={<Pill className="w-4 h-4" />} label="Pharmacy" />
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
                         {/* Fixed the name to 'Microscope' from 'মাইক্রোস্কোপ' */}
                         <Microscope className="w-20 h-20 mb-4 text-slate-300" />
                         <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">No Imaging Uploaded</p>
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
                 {/* Existing tabs follow logic... */}
              </div>
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
