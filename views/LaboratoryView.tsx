import React, { useState, useMemo } from 'react';
import { 
  Microscope, Search, Plus, Trash2, Edit2, Printer, 
  CheckCircle2, AlertTriangle, AlertCircle, Clock, 
  FileSpreadsheet, MessageSquare, X, Filter, Activity, FileText, ChevronRight
} from 'lucide-react';
import { LabResult, Patient } from '../types';
import { useData } from '../context/DataContext';
import { LabResultPrint } from '../components/LabResultPrint';
import { WhatsAppModal } from '../components/WhatsAppModal';
import { getLabResultWhatsAppMessage } from '../utils/whatsappHelper';
import { exportLabResultsToExcel } from '../utils/excelExporter';

const COMMON_TEST_TEMPLATES = [
  { name: 'Dental Panoramic X-Ray (OPG)', category: 'Dental Radiology', unit: 'Image/Report', ref: 'Normal bone & dentition', price: 25 },
  { name: 'Periapical X-Ray (RVG)', category: 'Dental Radiology', unit: 'Image/Report', ref: 'No apical radiolucency', price: 10 },
  { name: 'Bitewing X-Ray (Interproximal)', category: 'Dental Radiology', unit: 'Image/Report', ref: 'No interproximal decay', price: 10 },
  { name: 'Complete Blood Count (CBC)', category: 'Hematology', unit: 'Full Panel', ref: 'WBC: 4-10, Hb: 12-16 g/dL', price: 15 },
  { name: 'Fasting Blood Glucose (FBS)', category: 'Biochemistry', unit: 'mg/dL', ref: '70 - 100 mg/dL', price: 8 },
  { name: 'Random Blood Sugar (RBS)', category: 'Biochemistry', unit: 'mg/dL', ref: '< 140 mg/dL', price: 5 },
  { name: 'Bleeding & Clotting Time (BT/CT)', category: 'Hematology', unit: 'Minutes', ref: 'BT: 2-7 min, CT: 4-10 min', price: 12 },
  { name: 'Hepatitis B Surface Antigen (HBsAg)', category: 'Serology', unit: 'Rapid Test', ref: 'Negative', price: 10 },
  { name: 'Hepatitis C Virus Antibody (HCV)', category: 'Serology', unit: 'Rapid Test', ref: 'Negative', price: 10 },
  { name: 'Routine Urinalysis (U/A)', category: 'Urinalysis', unit: 'Stix & Micro', ref: 'Clear, Protein/Sugar Neg', price: 8 },
  { name: 'Salivary Buffer & pH Test', category: 'Dental Diagnostics', unit: 'pH', ref: 'pH 6.8 - 7.2', price: 15 }
];

const LaboratoryView: React.FC = () => {
  const { labResults, patients, addNewLabResult, updateLabResult, deleteLabResult } = useData();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Normal' | 'Abnormal' | 'Critical'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'Pending' | 'In Progress' | 'Completed'>('all');

  // Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedLabForAction, setSelectedLabForAction] = useState<LabResult | null>(null);
  const [printingLab, setPrintingLab] = useState<{ lab: LabResult; patient: Patient } | null>(null);
  const [whatsAppData, setWhatsAppData] = useState<{ phone: string; patientName: string; message: string; title: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Order Form
  const [orderForm, setOrderForm] = useState({
    patientId: '',
    testName: COMMON_TEST_TEMPLATES[0].name,
    category: COMMON_TEST_TEMPLATES[0].category,
    unit: COMMON_TEST_TEMPLATES[0].unit,
    referenceRange: COMMON_TEST_TEMPLATES[0].ref,
    doctorName: 'Dr. Mohamed Abdi',
    technicianName: 'Lab Tech Ahmed',
    priority: 'Routine',
    price: COMMON_TEST_TEMPLATES[0].price.toString(),
    notes: ''
  });

  // Result Entry Form
  const [resultForm, setResultForm] = useState({
    result: '',
    unit: '',
    referenceRange: '',
    status: 'Normal' as 'Normal' | 'Abnormal' | 'Critical',
    notes: '',
    orderStatus: 'Completed' as 'Pending' | 'In Progress' | 'Completed'
  });

  // Handle template selection
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = COMMON_TEST_TEMPLATES.find(t => t.name === e.target.value);
    if (selected) {
      setOrderForm(prev => ({
        ...prev,
        testName: selected.name,
        category: selected.category,
        unit: selected.unit,
        referenceRange: selected.ref,
        price: selected.price.toString()
      }));
    } else {
      setOrderForm(prev => ({ ...prev, testName: e.target.value }));
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.patientId) {
      alert("Fadlan dooro bukaan!");
      return;
    }

    const patient = patients.find(p => p.id === orderForm.patientId);

    const newLab: LabResult = {
      id: `LAB-${Date.now().toString().slice(-6)}`,
      patientId: orderForm.patientId,
      patientName: patient?.name || 'Bukaan',
      testName: orderForm.testName,
      category: orderForm.category,
      result: 'Pending (Sugaya Natiijo)',
      unit: orderForm.unit,
      referenceRange: orderForm.referenceRange,
      notes: orderForm.notes,
      date: new Date().toISOString().split('T')[0],
      doctorName: orderForm.doctorName,
      technicianName: orderForm.technicianName,
      status: 'Normal',
      orderStatus: 'Pending',
      price: parseFloat(orderForm.price) || 0
    };

    await addNewLabResult(newLab);
    setIsOrderModalOpen(false);
    // Reset form
    setOrderForm({
      patientId: '',
      testName: COMMON_TEST_TEMPLATES[0].name,
      category: COMMON_TEST_TEMPLATES[0].category,
      unit: COMMON_TEST_TEMPLATES[0].unit,
      referenceRange: COMMON_TEST_TEMPLATES[0].ref,
      doctorName: 'Dr. Mohamed Abdi',
      technicianName: 'Lab Tech Ahmed',
      priority: 'Routine',
      price: COMMON_TEST_TEMPLATES[0].price.toString(),
      notes: ''
    });
  };

  const openResultModal = (lab: LabResult) => {
    setSelectedLabForAction(lab);
    setResultForm({
      result: lab.result === 'Pending (Sugaya Natiijo)' ? '' : lab.result,
      unit: lab.unit || '',
      referenceRange: lab.referenceRange || '',
      status: lab.status || 'Normal',
      notes: lab.notes || '',
      orderStatus: 'Completed'
    });
    setIsResultModalOpen(true);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabForAction) return;

    await updateLabResult(selectedLabForAction.id, {
      result: resultForm.result || 'Negative / Normal',
      unit: resultForm.unit,
      referenceRange: resultForm.referenceRange,
      status: resultForm.status,
      notes: resultForm.notes,
      orderStatus: resultForm.orderStatus
    });

    setIsResultModalOpen(false);
    setSelectedLabForAction(null);
  };

  const handlePrintReport = (lab: LabResult) => {
    const patient = patients.find(p => p.id === lab.patientId) || {
      id: lab.patientId,
      name: lab.patientName || 'Patient',
      age: 30,
      gender: 'Male',
      phone: '',
      lastVisit: lab.date,
      medicalHistory: []
    } as Patient;

    setPrintingLab({ lab, patient });
  };

  const handleSendWhatsApp = (lab: LabResult) => {
    const patient = patients.find(p => p.id === lab.patientId);
    const phone = patient?.phone || '';
    const message = getLabResultWhatsAppMessage({
      patientName: lab.patientName || patient?.name || 'Bukaan',
      testName: lab.testName,
      date: lab.date,
      doctorName: lab.doctorName,
      status: `${lab.result} (${lab.status})`
    });

    setWhatsAppData({
      phone,
      patientName: lab.patientName || patient?.name || 'Bukaan',
      message,
      title: `Ogeysiiska Natiijada Shaybaarka - ${lab.testName}`
    });
  };

  const handleDelete = async (id: string) => {
    await deleteLabResult(id);
    setDeleteConfirmId(null);
  };

  // Filtered lab results
  const filteredLabs = useMemo(() => {
    return labResults.filter(lab => {
      const patient = patients.find(p => p.id === lab.patientId);
      const patientName = (lab.patientName || patient?.name || '').toLowerCase();
      const testName = lab.testName.toLowerCase();
      const id = lab.id.toLowerCase();
      const doctor = (lab.doctorName || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch = patientName.includes(query) || testName.includes(query) || id.includes(query) || doctor.includes(query);
      const matchesStatus = statusFilter === 'all' || lab.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || lab.category === categoryFilter;
      const matchesOrderStatus = orderStatusFilter === 'all' || (lab.orderStatus || 'Completed') === orderStatusFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesOrderStatus;
    });
  }, [labResults, patients, searchTerm, statusFilter, categoryFilter, orderStatusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = labResults.length;
    const completed = labResults.filter(l => (l.orderStatus || 'Completed') === 'Completed').length;
    const pending = labResults.filter(l => l.orderStatus === 'Pending' || l.orderStatus === 'In Progress').length;
    const critical = labResults.filter(l => l.status === 'Critical' || l.status === 'Abnormal').length;
    return { total, completed, pending, critical };
  }, [labResults]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    labResults.forEach(l => {
      if (l.category) set.add(l.category);
    });
    return Array.from(set);
  }, [labResults]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Microscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shaybaarka & Baaritaannada (Laboratory)</h1>
              <p className="text-slate-500 font-medium text-sm">Maamulka baaritaanada dhiigga, saxarada, X-Ray-ga ilkaha, iyo gelinta natiijooyinka shaybaarka.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => exportLabResultsToExcel(filteredLabs, patients)}
            className="flex items-center gap-2 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            title="Dhoofso Excel Shaxda Natiijooyinka"
          >
            <FileSpreadsheet className="w-4 h-4" /> Dhoofso Excel
          </button>
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Dalbo Baaritaan Cusub
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Wadarta Baaritaannada</p>
            <h3 className="text-3xl font-black text-slate-900 mt-2">{stats.total}</h3>
            <span className="text-[11px] font-bold text-slate-500">Dhammaan tijaabooyinka</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <Microscope className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Natiijadu Diyaar (Ready)</p>
            <h3 className="text-3xl font-black text-emerald-700 mt-2">{stats.completed}</h3>
            <span className="text-[11px] font-bold text-emerald-600">Dhamaystiran & la daabici karo</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-amber-600">Socda / Sugaya (Pending)</p>
            <h3 className="text-3xl font-black text-amber-700 mt-2">{stats.pending}</h3>
            <span className="text-[11px] font-bold text-amber-600">Geli natiijadooda hadda</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-rose-600">Digniin / Critical</p>
            <h3 className="text-3xl font-black text-rose-700 mt-2">{stats.critical}</h3>
            <span className="text-[11px] font-bold text-rose-600">Abnormal / Baahida degdega</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Test Presets Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Tijaabooyinka Degdegga ah (Quick Test Presets)</span>
            <h3 className="text-xl font-black tracking-tight mt-1">Baaritaanada ugu badan ee Ilkaha & Caafimaadka Guud</h3>
          </div>
          <span className="text-xs font-medium text-slate-300">Guji mid ka mid ah si aad degdeg ugu dalbato:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-5">
          {COMMON_TEST_TEMPLATES.slice(0, 6).map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOrderForm(prev => ({
                  ...prev,
                  testName: tmpl.name,
                  category: tmpl.category,
                  unit: tmpl.unit,
                  referenceRange: tmpl.ref,
                  price: tmpl.price.toString()
                }));
                setIsOrderModalOpen(true);
              }}
              className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 p-3 rounded-2xl text-left transition-all"
            >
              <p className="text-[11px] font-black text-white leading-tight truncate">{tmpl.name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">{tmpl.category.split(' ')[0]}</span>
                <span className="text-[10px] font-black text-emerald-400">${tmpl.price}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Raadi bukaan, magaca baaritaanka, ID-ga ama dhakhtarka..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={orderStatusFilter}
            onChange={e => setOrderStatusFilter(e.target.value as any)}
            className="px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl font-black text-xs text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Dhammaan Xaaladaha Dalabka</option>
            <option value="Pending">Pending (Sugaya)</option>
            <option value="Completed">Completed (Dhamaystiran)</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl font-black text-xs text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Dhammaan Natiijooyinka</option>
            <option value="Normal">Normal (Caadi)</option>
            <option value="Abnormal">Abnormal (Digniin)</option>
            <option value="Critical">Critical (Halist ah)</option>
          </select>

          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl font-black text-xs text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">Dhammaan Qaybaha</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">ID & Taariikh</th>
                <th className="py-4 px-6">Bukaanka (Patient)</th>
                <th className="py-4 px-6">Baaritaanka (Test)</th>
                <th className="py-4 px-6">Natiijada (Result)</th>
                <th className="py-4 px-6">Xadka Caadiga ah (Ref)</th>
                <th className="py-4 px-6">Xaaladda</th>
                <th className="py-4 px-6">Dhakhtarka</th>
                <th className="py-4 px-6 text-right">Hawlaha (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLabs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-bold">
                    <Microscope className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    Wax baaritaanno ah lagama helin xogta hadda jirta.
                  </td>
                </tr>
              ) : (
                filteredLabs.map((lab) => {
                  const patient = patients.find(p => p.id === lab.patientId);
                  const isCompleted = lab.orderStatus === 'Completed' || (lab.result && lab.result !== 'Pending (Sugaya Natiijo)');

                  return (
                    <tr key={lab.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* ID & Date */}
                      <td className="py-4 px-6">
                        <span className="font-black text-slate-900 block font-mono text-xs">{lab.id}</span>
                        <span className="text-[11px] text-slate-400 font-bold">{lab.date}</span>
                      </td>

                      {/* Patient */}
                      <td className="py-4 px-6">
                        <div className="font-black text-slate-900">{lab.patientName || patient?.name || 'Bukaan'}</div>
                        <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>ID: #{lab.patientId.slice(-6).toUpperCase()}</span>
                          {patient?.phone && <span>• {patient.phone}</span>}
                        </div>
                      </td>

                      {/* Test Name & Category */}
                      <td className="py-4 px-6">
                        <div className="font-black text-slate-900">{lab.testName}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-md uppercase tracking-wider">
                          {lab.category || 'General'}
                        </span>
                      </td>

                      {/* Result */}
                      <td className="py-4 px-6">
                        {isCompleted ? (
                          <div className="font-black text-slate-900">
                            {lab.result} {lab.unit && <span className="text-xs font-bold text-slate-500">{lab.unit}</span>}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg animate-pulse">
                            <Clock className="w-3.5 h-3.5" /> Sugaya Natiijo
                          </span>
                        )}
                        {lab.notes && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5 max-w-xs truncate">{lab.notes}</p>
                        )}
                      </td>

                      {/* Reference Range */}
                      <td className="py-4 px-6 text-xs font-bold text-slate-600">
                        {lab.referenceRange || 'N/A'}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          lab.status === 'Critical' 
                            ? 'bg-rose-100 text-rose-800'
                            : lab.status === 'Abnormal'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            lab.status === 'Critical' ? 'bg-rose-600' : lab.status === 'Abnormal' ? 'bg-amber-600' : 'bg-emerald-600'
                          }`}></span>
                          {lab.status}
                        </span>
                      </td>

                      {/* Doctor */}
                      <td className="py-4 px-6 text-xs font-bold text-slate-700">
                        {lab.doctorName}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Enter / Edit Result */}
                          <button
                            onClick={() => openResultModal(lab)}
                            className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Geli / Wax ka beddel Natiijada"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Print Lab Report */}
                          <button
                            onClick={() => handlePrintReport(lab)}
                            className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Daabac Warbixinta Shaybaarka"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* WhatsApp Notification */}
                          <button
                            onClick={() => handleSendWhatsApp(lab)}
                            className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="U dir WhatsApp Natiijada"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(lab.id)}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Tirtir Baaritaanka"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ORDER NEW LAB TEST */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Dalbo Baaritaan Cusub (Order Lab Test)</h3>
                <p className="text-xs font-bold text-slate-400">Dooro bukaanka iyo tijaabada shaybaarka looga baahan yahay</p>
              </div>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              {/* Patient Selection */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Dooro Bukaanka (Patient) *
                </label>
                <select
                  required
                  value={orderForm.patientId}
                  onChange={e => setOrderForm(prev => ({ ...prev, patientId: e.target.value }))}
                  className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                >
                  <option value="">-- Dooro Bukaanka --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (#{p.id.slice(-6).toUpperCase()}) - {p.phone || 'No phone'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template / Pre-set */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Baaritaanka Caanka ah (Test Template)
                </label>
                <select
                  value={orderForm.testName}
                  onChange={handleTemplateChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                >
                  {COMMON_TEST_TEMPLATES.map((tmpl, idx) => (
                    <option key={idx} value={tmpl.name}>
                      {tmpl.name} ({tmpl.category}) - ${tmpl.price}
                    </option>
                  ))}
                  <option value="Custom Test">Baaritaan Kale (Custom Test)...</option>
                </select>
              </div>

              {/* Test Name Custom if needed */}
              {orderForm.testName === 'Custom Test' && (
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Magaca Baaritaanka Gaarka ah *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tusaale: Dental Salivary Culture, Vitamin D3..."
                    onChange={e => setOrderForm(prev => ({ ...prev, testName: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  />
                </div>
              )}

              {/* Category & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Qaybta (Category)
                  </label>
                  <select
                    value={orderForm.category}
                    onChange={e => setOrderForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  >
                    <option value="Dental Radiology">Dental Radiology (X-Ray)</option>
                    <option value="Hematology">Hematology (Dhiigga)</option>
                    <option value="Biochemistry">Biochemistry (Kiimiko)</option>
                    <option value="Serology">Serology & Virology</option>
                    <option value="Urinalysis">Urinalysis (Kaadida)</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Other">Qayb Kale</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Halbeegga (Unit)
                  </label>
                  <input
                    type="text"
                    value={orderForm.unit}
                    onChange={e => setOrderForm(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="g/dL, mg/dL, mm/hr, etc."
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Reference Range & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Xadka Caadiga ah (Reference Range)
                  </label>
                  <input
                    type="text"
                    value={orderForm.referenceRange}
                    onChange={e => setOrderForm(prev => ({ ...prev, referenceRange: e.target.value }))}
                    placeholder="Tusaale: 70 - 100 mg/dL"
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Qiimaha ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={orderForm.price}
                    onChange={e => setOrderForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Doctor & Technician */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Dhakhtarka Dalbaday
                  </label>
                  <input
                    type="text"
                    value={orderForm.doctorName}
                    onChange={e => setOrderForm(prev => ({ ...prev, doctorName: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Farsamo-yaqaanka Shaybaarka
                  </label>
                  <input
                    type="text"
                    value={orderForm.technicianName}
                    onChange={e => setOrderForm(prev => ({ ...prev, technicianName: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Faahfaahin / Xusuusin (Notes)
                </label>
                <textarea
                  rows={2}
                  value={orderForm.notes}
                  onChange={e => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Sababta baaritaanka ama tilmaamaha shaybaarka..."
                  className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
              >
                Xaqiiji Dalabka Baaritaanka
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ENTER / RECORD LAB RESULTS */}
      {isResultModalOpen && selectedLabForAction && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setIsResultModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Geli Natiijada Shaybaarka</h3>
                <p className="text-xs font-bold text-slate-400">{selectedLabForAction.testName} - {selectedLabForAction.patientName}</p>
              </div>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Natiijada Baaritaanka (Test Result Value) *
                </label>
                <input
                  type="text"
                  required
                  value={resultForm.result}
                  onChange={e => setResultForm(prev => ({ ...prev, result: e.target.value }))}
                  placeholder="Tusaale: 13.5, Negative, No bone loss..."
                  className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Halbeegga (Unit)
                  </label>
                  <input
                    type="text"
                    value={resultForm.unit}
                    onChange={e => setResultForm(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="g/dL, mg/dL..."
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Xadka Caadiga ah (Ref Range)
                  </label>
                  <input
                    type="text"
                    value={resultForm.referenceRange}
                    onChange={e => setResultForm(prev => ({ ...prev, referenceRange: e.target.value }))}
                    placeholder="12.0 - 16.0"
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Xaaladda Natiijada (Evaluation Status) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResultForm(prev => ({ ...prev, status: 'Normal' }))}
                    className={`py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border ${
                      resultForm.status === 'Normal'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ✓ Normal
                  </button>

                  <button
                    type="button"
                    onClick={() => setResultForm(prev => ({ ...prev, status: 'Abnormal' }))}
                    className={`py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border ${
                      resultForm.status === 'Abnormal'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ⚠ Abnormal
                  </button>

                  <button
                    type="button"
                    onClick={() => setResultForm(prev => ({ ...prev, status: 'Critical' }))}
                    className={`py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border ${
                      resultForm.status === 'Critical'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ⛔ Critical
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Faallooyinka Dhakhtarka Shaybaarka (Clinical Remarks)
                </label>
                <textarea
                  rows={2}
                  value={resultForm.notes}
                  onChange={e => setResultForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Xusuusin ku saabsan natiijada ama daawaynta..."
                  className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
              >
                Kaydi Natiijada & Dhameystir
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 z-[110] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 font-black">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Ma hubtaa inaad tirtirto?</h3>
            <p className="text-xs font-bold text-slate-500 mt-1 mb-6">Xogta baaritaankan lama soo celin karo marka la tirtiro.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-200"
              >
                Jooji
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-rose-700 shadow-lg shadow-rose-600/20"
              >
                Haa, Tirtir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Lab Result Modal */}
      {printingLab && (
        <LabResultPrint
          labResults={[printingLab.lab]}
          patient={printingLab.patient}
          onClose={() => setPrintingLab(null)}
        />
      )}

      {/* WhatsApp Modal */}
      {whatsAppData && (
        <WhatsAppModal
          isOpen={true}
          phone={whatsAppData.phone}
          patientName={whatsAppData.patientName}
          defaultMessage={whatsAppData.message}
          title={whatsAppData.title}
          onClose={() => setWhatsAppData(null)}
        />
      )}
    </div>
  );
};

export default LaboratoryView;
