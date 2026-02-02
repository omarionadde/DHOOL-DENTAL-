
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Patient, PatientHistory, Prescription, StaffUser, LabResult } from '../types';
import { Trash2, Printer, Plus, FileText, Pill, X, Save, Clock, ClipboardList, User, Microscope, Sparkles, AlertCircle, ChevronRight, CheckCircle2, FileDown, Wallet, CreditCard, DollarSign, LayoutGrid, Image as ImageIcon, Upload, Eye } from 'lucide-react';
import { getAIAssistance } from '../services/geminiService';
import { PrescriptionPrint } from '../components/PrescriptionPrint';
import { PatientReportPrint } from '../components/PatientReportPrint';

interface Props {
  user: StaffUser;
  t: (key: string) => string;
}

const PatientsView: React.FC<Props> = ({ user, t }) => {
  const { 
    patients, addNewPatient, deletePat, processPatientPayment, updatePat,
    patientHistory, addNewHistory, prescriptions, addNewPrescription, removePrescription,
    labResults, addNewLabResult, inventory
  } = useData();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [printingRx, setPrintingRx] = useState<Prescription | null>(null);
  const [showReportPrint, setShowReportPrint] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Registration State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [phone, setPhone] = useState('');
  const [condition, setCondition] = useState('');

  // Payment Form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [manualDebt, setManualDebt] = useState('');

  // History Form
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');

  // Lab Form
  const [testName, setTestName] = useState('');
  const [testResult, setTestResult] = useState('');
  const [testStatus, setTestStatus] = useState<'Normal'|'Abnormal'|'Critical'>('Normal');

  // Image Upload Form
  const [imageNote, setImageNote] = useState('');
  const [imageType, setImageType] = useState<'X-Ray' | 'Photo' | 'Document'>('X-Ray');

  // Prescription Form State
  const [rxQueue, setRxQueue] = useState<{name: string; dosage: string; frequency: string; duration: string}[]>([]);
  const [rxForm, setRxForm] = useState({ name: '', dosage: '', frequency: '', duration: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  // Dental Chart State
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [toothStatusAction, setToothStatusAction] = useState<'Healthy' | 'Decay' | 'Filled' | 'Missing' | 'Crown' | 'RootCanal'>('Healthy');

  const [detailTab, setDetailTab] = useState<'info' | 'chart' | 'history' | 'prescription' | 'labs' | 'imaging' | 'financial'>('info');

  const handleGetAiSummary = async () => {
    if (!selectedPatient) return;
    setIsAiLoading(true);
    const historyText = patientHistory
      .filter(h => h.patientId === selectedPatient.id)
      .map(h => `${h.date}: ${h.diagnosis} - ${h.treatment}`)
      .join(', ');
    
    const prompt = `Please provide a concise medical summary for patient ${selectedPatient.name}, age ${selectedPatient.age}, gender ${selectedPatient.gender || 'Unknown'}. Their clinical history includes: ${historyText}. Identify potential risks or follow-up needs.`;
    const summary = await getAIAssistance(prompt, "You are a clinical analytical tool.");
    setAiSummary(summary);
    setIsAiLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedPatient) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            const newImage = {
                id: Date.now().toString(),
                url: base64String,
                date: new Date().toISOString().split('T')[0],
                note: imageNote || 'No notes',
                type: imageType
            };
            const updatedImages = [newImage, ...(selectedPatient.images || [])];
            
            await updatePat(selectedPatient.id, { images: updatedImages });
            setSelectedPatient({...selectedPatient, images: updatedImages});
            setImageNote('');
        };
        reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
      if(!selectedPatient) return;
      if(!confirm('Are you sure you want to delete this image?')) return;
      const updatedImages = (selectedPatient.images || []).filter(img => img.id !== imageId);
      await updatePat(selectedPatient.id, { images: updatedImages });
      setSelectedPatient({...selectedPatient, images: updatedImages});
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
    if (isSubmitting) return;

    // Check for Duplicates
    const duplicate = patients.find(p => 
      p.phone.trim() === phone.trim() || 
      p.name.trim().toLowerCase() === name.trim().toLowerCase()
    );

    if (duplicate) {
      alert("Bukaankan horay ayaa loo diiwaangeliyay! Fadlan hubi magaca ama lambarka taleefanka.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newPatient: Patient = {
        id: Date.now().toString(),
        name: name.trim(),
        age: parseInt(age),
        gender: gender,
        phone: phone.trim(),
        lastVisit: new Date().toISOString().split('T')[0],
        medicalHistory: [],
        condition: condition || 'Checkup',
        balance: 0,
        teethStatus: {},
        images: []
      };
      await addNewPatient(newPatient);
      setShowAddModal(false);
      setName(''); setAge(''); setPhone(''); setCondition(''); setGender('Male');
    } catch (error) {
      console.error("Error adding patient:", error);
    } finally {
      setIsSubmitting(false);
    }
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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    await processPatientPayment(selectedPatient.id, amount, paymentMethod);
    // Update local view
    setSelectedPatient(prev => prev ? {...prev, balance: (prev.balance || 0) - amount} : null);
    setPaymentAmount('');
    alert("Payment processed successfully!");
  };

  const handleAddManualDebt = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!selectedPatient || !manualDebt) return;
     const amount = parseFloat(manualDebt);
     if (isNaN(amount) || amount <= 0) return;
     
     const newBalance = (selectedPatient.balance || 0) + amount;
     await updatePat(selectedPatient.id, { balance: newBalance });
     setSelectedPatient(prev => prev ? {...prev, balance: newBalance} : null);
     setManualDebt('');
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
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleToothClick = async (toothNumber: number) => {
    if (!selectedPatient) return;
    
    // Toggle status or set new status
    const currentStatus = selectedPatient.teethStatus?.[toothNumber] || 'Healthy';
    const newStatus = toothStatusAction;

    const updatedTeeth = { ...selectedPatient.teethStatus, [toothNumber]: newStatus };
    
    // Optimistic Update
    setSelectedPatient({ ...selectedPatient, teethStatus: updatedTeeth });
    
    // Save to DB
    await updatePat(selectedPatient.id, { teethStatus: updatedTeeth });
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.phone.includes(searchTerm)
    );
  }, [patients, searchTerm]);

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto">
      {/* Rx Printing Modal */}
      {printingRx && selectedPatient && (
        <PrescriptionPrint 
          prescription={printingRx} 
          patient={selectedPatient} 
          onClose={() => setPrintingRx(null)} 
        />
      )}

      {/* Full Report Modal */}
      {showReportPrint && selectedPatient && (
        <PatientReportPrint 
          patient={selectedPatient}
          history={patientHistory.filter(h => h.patientId === selectedPatient.id)}
          prescriptions={prescriptions.filter(p => p.patientId === selectedPatient.id)}
          labs={labResults.filter(l => l.patientId === selectedPatient.id)}
          onClose={() => setShowReportPrint(false)}
        />
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
          <div className="fixed inset-0 bg-black/90 z-[150] flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
              <img src={selectedImage} className="max-w-full max-h-full rounded-lg shadow-2xl" />
              <button className="absolute top-4 right-4 p-4 text-white"><X className="w-8 h-8" /></button>
          </div>
      )}

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
             
             {patient.balance && patient.balance > 0 ? (
                <div className="mb-4 bg-rose-50 border border-rose-100 p-2 rounded-xl text-center">
                   <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Outstanding Debt</p>
                   <p className="text-lg font-black text-rose-600">${patient.balance.toFixed(2)}</p>
                </div>
             ) : null}

             <div className="bg-slate-50 rounded-2xl p-4 space-y-3 mt-auto">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age / Sex</span><span className="font-black text-slate-900 text-sm">{patient.age} / {patient.gender ? patient.gender.charAt(0) : 'N/A'}</span></div>
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
                   <p className="text-slate-400 font-bold mt-1 uppercase text-xs tracking-widest">{selectedPatient.age} Years • {selectedPatient.gender || 'Unknown'} • {selectedPatient.phone}</p>
                 </div>
                 <div className="flex items-center gap-3 relative z-10">
                    <button 
                      onClick={() => setShowReportPrint(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                    >
                      <FileDown className="w-4 h-4" /> Full Report
                    </button>
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
                 <TabButton active={detailTab === 'chart'} onClick={() => setDetailTab('chart')} icon={<LayoutGrid className="w-4 h-4" />} label="Dental Chart" />
                 <TabButton active={detailTab === 'imaging'} onClick={() => setDetailTab('imaging')} icon={<ImageIcon className="w-4 h-4" />} label="X-Ray & Imaging" />
                 <TabButton active={detailTab === 'history'} onClick={() => setDetailTab('history')} icon={<ClipboardList className="w-4 h-4" />} label="Clinical History" />
                 <TabButton active={detailTab === 'prescription'} onClick={() => setDetailTab('prescription')} icon={<Pill className="w-4 h-4" />} label="Prescription" />
                 <TabButton active={detailTab === 'labs'} onClick={() => setDetailTab('labs')} icon={<Microscope className="w-4 h-4" />} label="Laboratory" />
                 <TabButton active={detailTab === 'financial'} onClick={() => setDetailTab('financial')} icon={<Wallet className="w-4 h-4" />} label="Financial & Debt" />
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
                          <DataRow label="Gender" value={selectedPatient.gender || 'Not Specified'} />
                          <DataRow label="System Status" value="Healthy / Stable" />
                        </div>
                      </div>
                      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                         {selectedPatient.images && selectedPatient.images.length > 0 ? (
                             <div className="w-full h-full flex flex-col items-center justify-center">
                                 <img src={selectedPatient.images[0].url} className="w-32 h-32 object-cover rounded-xl mb-4 border border-slate-200" />
                                 <p className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Latest Imaging Available</p>
                                 <button onClick={() => setDetailTab('imaging')} className="mt-2 text-blue-600 text-xs font-black hover:underline">View Gallery</button>
                             </div>
                         ) : (
                             <div className="opacity-40 flex flex-col items-center">
                                <Microscope className="w-20 h-20 mb-4 text-slate-300" />
                                <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">No Imaging Uploaded</p>
                             </div>
                         )}
                      </div>
                    </div>
                 )}

                 {detailTab === 'imaging' && (
                     <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                         <div className="lg:col-span-1">
                             <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-0">
                                 <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Upload Media</h3>
                                 <div className="space-y-4">
                                     <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 rounded-[2rem] p-8 hover:bg-slate-50 transition-all flex flex-col items-center text-center">
                                         <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                         <Upload className="w-8 h-8 text-blue-500 mb-2" />
                                         <p className="text-xs font-bold text-slate-500">Click to upload X-Ray or Photo</p>
                                     </div>
                                     <div className="space-y-1">
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">File Category</label>
                                         <select value={imageType} onChange={e => setImageType(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 rounded-2xl outline-none font-bold text-xs border border-transparent focus:border-blue-500">
                                             <option>X-Ray</option>
                                             <option>Photo</option>
                                             <option>Document</option>
                                         </select>
                                     </div>
                                     <div className="space-y-1">
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes</label>
                                         <textarea value={imageNote} onChange={e => setImageNote(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-2xl outline-none font-bold text-xs h-20 border border-transparent focus:border-blue-500" placeholder="Optional descriptions..." />
                                     </div>
                                 </div>
                             </div>
                         </div>
                         <div className="lg:col-span-3">
                             <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-3"><ImageIcon className="w-5 h-5 text-slate-400" /> Patient Gallery</h3>
                             {!selectedPatient.images || selectedPatient.images.length === 0 ? (
                                 <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                     <p className="text-slate-400 font-bold text-sm">No medical images on record.</p>
                                 </div>
                             ) : (
                                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                     {selectedPatient.images.map((img, idx) => (
                                         <div key={idx} className="bg-white p-3 rounded-3xl border border-slate-100 shadow-sm group relative">
                                             <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative">
                                                 <img src={img.url} className="w-full h-full object-cover" />
                                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                     <button onClick={() => setSelectedImage(img.url)} className="p-2 bg-white/20 hover:bg-white/40 rounded-xl text-white backdrop-blur-sm"><Eye className="w-5 h-5" /></button>
                                                     <button onClick={() => handleDeleteImage(img.id)} className="p-2 bg-white/20 hover:bg-rose-500/80 rounded-xl text-white backdrop-blur-sm"><Trash2 className="w-5 h-5" /></button>
                                                 </div>
                                             </div>
                                             <div>
                                                 <div className="flex justify-between items-center mb-1">
                                                     <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{img.type}</span>
                                                     <span className="text-[9px] font-bold text-slate-400">{img.date}</span>
                                                 </div>
                                                 <p className="text-xs font-bold text-slate-600 truncate">{img.note}</p>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </div>
                     </div>
                 )}

                 {detailTab === 'chart' && (
                    <div className="flex flex-col lg:flex-row gap-8">
                       <div className="flex-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                          <div className="flex justify-between items-center mb-6">
                             <h3 className="text-xl font-black text-slate-900 tracking-tight">Odontogram (Shaxda Ilkaha)</h3>
                             <div className="flex gap-2">
                                <StatusLegend color="bg-white border-slate-200" label="Healthy" />
                                <StatusLegend color="bg-rose-500" label="Decay" />
                                <StatusLegend color="bg-blue-500" label="Filled" />
                                <StatusLegend color="bg-slate-800" label="Missing" />
                                <StatusLegend color="bg-amber-400" label="Crown" />
                             </div>
                          </div>
                          
                          {/* Teeth Grid */}
                          <div className="space-y-8">
                             {/* Upper Jaw */}
                             <div className="flex justify-center gap-1 flex-wrap">
                                {[18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28].map(num => (
                                   <Tooth 
                                      key={num} 
                                      number={num} 
                                      status={selectedPatient.teethStatus?.[num] || 'Healthy'}
                                      onClick={() => handleToothClick(num)} 
                                   />
                                ))}
                             </div>
                             
                             <div className="h-px bg-slate-100 w-full"></div>

                             {/* Lower Jaw */}
                             <div className="flex justify-center gap-1 flex-wrap">
                                {[48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38].map(num => (
                                   <Tooth 
                                      key={num} 
                                      number={num} 
                                      status={selectedPatient.teethStatus?.[num] || 'Healthy'}
                                      onClick={() => handleToothClick(num)} 
                                   />
                                ))}
                             </div>
                          </div>
                       </div>

                       <div className="w-full lg:w-72 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-fit">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Action Tool</h4>
                          <div className="space-y-2">
                             {(['Healthy', 'Decay', 'Filled', 'Missing', 'Crown', 'RootCanal'] as const).map(status => (
                                <button
                                   key={status}
                                   onClick={() => setToothStatusAction(status)}
                                   className={`w-full p-4 rounded-2xl flex items-center justify-between text-xs font-bold transition-all ${toothStatusAction === status ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                >
                                   <span>{status}</span>
                                   {toothStatusAction === status && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                             ))}
                          </div>
                          <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                             <p className="text-[10px] text-blue-600 font-medium leading-relaxed">
                                Select a tool above, then click on a tooth in the chart to mark its status. Changes save automatically.
                             </p>
                          </div>
                       </div>
                    </div>
                 )}

                 {detailTab === 'financial' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                          <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-3">
                             <Wallet className="w-6 h-6 text-slate-400" /> Current Standing
                          </h3>
                          <div className={`p-8 rounded-[2rem] text-center mb-8 ${ (selectedPatient.balance || 0) > 0 ? 'bg-rose-50 border border-rose-100' : 'bg-emerald-50 border border-emerald-100' }`}>
                             <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${ (selectedPatient.balance || 0) > 0 ? 'text-rose-400' : 'text-emerald-400' }`}>Total Outstanding Debt</p>
                             <h2 className={`text-5xl font-black tracking-tighter ${ (selectedPatient.balance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600' }`}>${(selectedPatient.balance || 0).toFixed(2)}</h2>
                          </div>

                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Manual Adjustment (Add Debt)</h4>
                          <form onSubmit={handleAddManualDebt} className="flex gap-4 mb-6">
                             <input type="number" step="0.01" value={manualDebt} onChange={e => setManualDebt(e.target.value)} placeholder="Amount..." className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
                             <button type="submit" className="px-6 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px]">Add Charge</button>
                          </form>
                       </div>

                       <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                          <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-3">
                             <DollarSign className="w-6 h-6 text-slate-400" /> Process Payment
                          </h3>
                          <form onSubmit={handlePayment} className="space-y-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Amount</label>
                                <input required type="number" step="0.01" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all" placeholder="0.00" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Method</label>
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm appearance-none">
                                   <option value="Cash">Cash</option>
                                   <option value="EVC-Plus">EVC-Plus / Zaad</option>
                                </select>
                             </div>
                             <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 mt-4">
                               <CheckCircle2 className="w-4 h-4" /> Receive Payment
                             </button>
                          </form>
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
                                   <input required value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all" placeholder="e.g. Dental Caries" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Treatment Plan</label>
                                   <input required value={treatment} onChange={e => setTreatment(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all" placeholder="e.g. Root Canal Therapy" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Notes</label>
                                   <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm h-24 border-2 border-transparent focus:border-blue-500 transition-all" placeholder="Observations..." />
                                </div>
                                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                  <Save className="w-4 h-4" /> Save Record
                                </button>
                             </form>
                          </div>
                       </div>
                       <div className="lg:col-span-2 space-y-6">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3"><ClipboardList className="w-5 h-5 text-slate-400" /> History Log</h3>
                          {patientHistory.filter(h => h.patientId === selectedPatient.id).length === 0 ? (
                            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold text-sm">No clinical notes recorded yet.</p>
                            </div>
                          ) : (
                            patientHistory.filter(h => h.patientId === selectedPatient.id).map(record => (
                              <div key={record.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                                 <div className="flex justify-between items-start mb-4">
                                    <div>
                                      <h4 className="text-lg font-black text-slate-900">{record.diagnosis}</h4>
                                      <p className="text-blue-600 font-bold text-sm mt-1">{record.treatment}</p>
                                    </div>
                                    <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{record.date}</span>
                                 </div>
                                 <p className="text-slate-500 text-sm leading-relaxed mb-4 italic">"{record.notes || 'No specific notes'}"</p>
                                 <div className="pt-4 border-t border-slate-50 flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-300" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medical Officer: Dr. {record.doctorName}</span>
                                 </div>
                              </div>
                            ))
                          )}
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
                                       className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all" 
                                       placeholder="e.g. Amoxicillin" 
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
                                       className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all" 
                                       placeholder="e.g. 500mg" 
                                    />
                                 </div>
                                 <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                                       <input 
                                          value={rxForm.frequency} 
                                          onChange={e => setRxForm({...rxForm, frequency: e.target.value})} 
                                          className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all" 
                                          placeholder="e.g. 1-0-1 (TID)" 
                                       />
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                                       <input 
                                          value={rxForm.duration} 
                                          onChange={e => setRxForm({...rxForm, duration: e.target.value})} 
                                          className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all" 
                                          placeholder="e.g. 7 Days" 
                                       />
                                    </div>
                                 </div>
                                 <button 
                                    onClick={handleAddToRxQueue}
                                    type="button" 
                                    className="w-full py-3 bg-blue-50 text-blue-600 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                                 >
                                    <Plus className="w-4 h-4" /> Add to Prescription List
                                 </button>
                              </div>

                              {/* Queue List */}
                              {rxQueue.length > 0 && (
                                 <div className="mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-100 animate-in slide-in-from-top-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pending Items</h4>
                                    <div className="space-y-2">
                                       {rxQueue.map((item, idx) => (
                                          <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm group">
                                             <div className="overflow-hidden">
                                                <p className="text-xs font-black text-slate-800 truncate">{item.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold">{item.dosage} • {item.frequency} • {item.duration}</p>
                                             </div>
                                             <button onClick={() => handleRemoveFromRxQueue(idx)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg shrink-0"><X className="w-3 h-3" /></button>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}

                              <button 
                                 onClick={handleSaveRx}
                                 disabled={rxQueue.length === 0}
                                 className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                 <CheckCircle2 className="w-4 h-4" /> Finalize & Store Prescription
                              </button>
                              
                              {showSuccess && (
                                <div className="mt-4 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-center font-black text-[10px] uppercase tracking-widest animate-in fade-in">
                                  Prescription Stored Successfully!
                                </div>
                              )}
                           </div>
                        </div>

                        {/* HISTORY */}
                        <div className="lg:col-span-2 space-y-6">
                           <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3"><Pill className="w-5 h-5 text-slate-400" /> Issued Prescriptions</h3>
                           
                           {prescriptions.filter(p => p.patientId === selectedPatient.id).length === 0 ? (
                              <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                 <p className="text-slate-400 font-bold text-sm">No historical prescriptions found.</p>
                              </div>
                           ) : (
                              prescriptions.filter(p => p.patientId === selectedPatient.id).map(rx => (
                                 <div key={rx.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:border-blue-500 transition-all">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                                       <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                             <FileText className="w-5 h-5" />
                                          </div>
                                          <div>
                                             <h4 className="font-black text-slate-900 text-sm">Rx Record #{rx.id.slice(-4)}</h4>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rx.date} • Dr. {rx.doctorName}</p>
                                          </div>
                                       </div>
                                       <div className="flex gap-2">
                                          <button onClick={() => setPrintingRx(rx)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Print Prescription">
                                             <Printer className="w-4 h-4" />
                                          </button>
                                          <button onClick={() => { if(confirm('Are you sure you want to delete this prescription record?')) removePrescription(rx.id) }} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                             <Trash2 className="w-4 h-4" />
                                          </button>
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       {rx.medicines.map((med, idx) => (
                                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                                             <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-[10px]">
                                                   {idx + 1}
                                                </div>
                                                <div>
                                                   <p className="font-black text-slate-900 text-sm uppercase">{med.name}</p>
                                                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{med.dosage}</p>
                                                </div>
                                             </div>
                                             <div className="text-right">
                                                <p className="font-black text-blue-600 text-[10px] uppercase tracking-widest">{med.frequency}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{med.duration}</p>
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
                                   <input required value={testName} onChange={e => setTestName(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500 transition-all" placeholder="e.g. Panoramic X-Ray" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Findings / Result</label>
                                   <textarea required value={testResult} onChange={e => setTestResult(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm h-24 border-2 border-transparent focus:border-blue-500 transition-all" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Result Severity</label>
                                   <select value={testStatus} onChange={e => setTestStatus(e.target.value as any)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm appearance-none border-2 border-transparent focus:border-blue-500 transition-all">
                                      <option>Normal</option>
                                      <option>Abnormal</option>
                                      <option>Critical</option>
                                   </select>
                                </div>
                                <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                  <Save className="w-4 h-4" /> Submit Report
                                </button>
                             </form>
                          </div>
                       </div>
                       <div className="lg:col-span-2 space-y-6">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3"><Microscope className="w-5 h-5 text-slate-400" /> Diagnostic History</h3>
                          {labResults.filter(l => l.patientId === selectedPatient.id).length === 0 ? (
                             <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold text-sm">No laboratory records found.</p>
                             </div>
                          ) : (
                             labResults.filter(l => l.patientId === selectedPatient.id).map(lab => (
                               <div key={lab.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-blue-100 transition-all">
                                  <div className="flex justify-between items-center mb-4">
                                     <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{lab.testName}</h4>
                                     <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                       lab.status === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                                       lab.status === 'Abnormal' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                     }`}>{lab.status}</span>
                                  </div>
                                  <div className="p-4 bg-slate-50 rounded-2xl mb-4">
                                     <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{lab.result}"</p>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4">
                                     <span>Pathologist/Doctor: Dr. {lab.doctorName}</span>
                                     <span>Exam Date: {lab.date}</span>
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
           <div className="bg-white rounded-[3rem] p-8 w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-200">
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"><X className="w-5 h-5" /></button>
              <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Patient Registration</h3>
              <form onSubmit={handleAddPatient} className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                   <input required placeholder="Enter name..." value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-sm border-2 border-transparent focus:border-blue-500 transition-all" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                      <input required type="number" placeholder="Age..." value={age} onChange={e => setAge(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-sm border-2 border-transparent focus:border-blue-500 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                      <select value={gender} onChange={e => setGender(e.target.value as 'Male' | 'Female')} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-sm border-2 border-transparent focus:border-blue-500 transition-all appearance-none">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                    <input required placeholder="061..." value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-sm border-2 border-transparent focus:border-blue-500 transition-all" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Condition</label>
                   <input placeholder="Chief complaint..." value={condition} onChange={e => setCondition(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-sm border-2 border-transparent focus:border-blue-500 transition-all" />
                 </div>
                 <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className={`w-full py-5 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl hover:bg-blue-700 transition-all mt-4 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                    {isSubmitting ? 'Processing...' : 'Create Patient Profile'}
                 </button>
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

const StatusLegend = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
     <div className={`w-2 h-2 rounded-full ${color}`}></div>
     <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
  </div>
);

const Tooth: React.FC<{ number: number; status: string; onClick: () => void }> = ({ number, status, onClick }) => {
   const statusColors: Record<string, string> = {
      'Healthy': 'fill-white stroke-slate-200 hover:fill-blue-50',
      'Decay': 'fill-rose-500 stroke-rose-600',
      'Filled': 'fill-blue-500 stroke-blue-600',
      'Missing': 'fill-slate-800 stroke-slate-900',
      'Crown': 'fill-amber-400 stroke-amber-500',
      'RootCanal': 'fill-purple-500 stroke-purple-600'
   };

   return (
      <div 
         onClick={onClick} 
         className="flex flex-col items-center gap-1 cursor-pointer group hover:-translate-y-1 transition-all"
         title={`Tooth #${number}: ${status}`}
      >
         <div className="w-10 h-10 md:w-12 md:h-12 relative">
            <svg viewBox="0 0 24 24" className={`w-full h-full transition-colors drop-shadow-sm ${statusColors[status] || statusColors['Healthy']}`} strokeWidth="1.5">
               <path d="M7 2c-2 0-3 2.5-3 5v4c0 3 2 5 2 7 0 2 1 4 2 4s2-2 2-4V9h4v9c0 2 1 4 2 4s2-2 2-4v-7c0-2.5-1-5-3-5h-4V5c0-2-1-3-2-3z" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="bg-black/50 text-white text-[8px] font-black px-1 rounded">{status[0]}</div>
            </div>
         </div>
         <span className={`text-[9px] font-black ${status !== 'Healthy' ? 'text-slate-900' : 'text-slate-300'}`}>{number}</span>
      </div>
   );
};

export default PatientsView;
