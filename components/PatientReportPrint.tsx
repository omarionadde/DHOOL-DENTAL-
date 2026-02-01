
import React from 'react';
import { Patient, PatientHistory, LabResult, Prescription } from '../types';
import { DhoolLogo } from './DhoolLogo';
import { Printer, Download, X, FileText, ClipboardList, Microscope, Pill } from 'lucide-react';

interface PatientReportPrintProps {
  patient: Patient;
  history: PatientHistory[];
  labs: LabResult[];
  prescriptions: Prescription[];
  onClose: () => void;
}

declare const html2pdf: any;

export const PatientReportPrint: React.FC<PatientReportPrintProps> = ({ 
  patient, 
  history, 
  labs, 
  prescriptions, 
  onClose 
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('patient-report-content');
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `Dhool_Medical_Report_${patient.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
       html2pdf().set(opt).from(element).save();
    } else {
       alert("PDF library loading... please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[250] flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl h-[95vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto">
        
        {/* Controls */}
        <div className="p-6 bg-slate-50 border-b flex justify-between items-center print:hidden">
          <div className="flex items-center gap-4">
            <h2 className="font-black text-slate-900 uppercase tracking-tight text-sm">Patient Clinical Report</h2>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex gap-2">
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Download className="w-4 h-4" /> Download PDF
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                <Printer className="w-4 h-4" /> Print Report
                </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Report Content */}
        <div id="patient-report-content" className="flex-1 overflow-y-auto p-12 bg-white print:overflow-visible">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-8">
            <div className="flex items-center gap-4">
              <DhoolLogo className="w-20 h-20" />
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">DHOOL</h1>
                <p className="text-[12px] font-black tracking-[0.4em] text-emerald-600 uppercase mt-1">Dental Clinic & Pharmacy</p>
                <div className="text-[10px] text-slate-400 font-bold mt-4 uppercase space-y-1">
                  <p>Waaberi District, Via Liberia</p>
                  <p>Mogadishu, Somalia</p>
                  <p>Tel: +252 61 972 6662</p>
                  <p>Email: health@dhoolclinic.so</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-5xl font-black text-slate-100 uppercase tracking-tighter mb-4">Medical Report</h2>
              <p className="text-xs font-black text-slate-900">Patient ID: {patient.id.toUpperCase()}</p>
              <p className="text-xs font-bold text-slate-500">Report Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Patient Profile */}
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10 grid grid-cols-2 gap-8">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
                <p className="text-2xl font-black text-slate-900">{patient.name}</p>
             </div>
             <div className="grid grid-cols-3">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Age</p>
                   <p className="text-xl font-black text-slate-900">{patient.age}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                   <p className="text-xl font-black text-slate-900">M/F</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                   <p className="text-lg font-black text-slate-900">{patient.phone}</p>
                </div>
             </div>
          </div>

          {/* History Section */}
          <div className="mb-12">
             <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-3">
                <ClipboardList className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Clinical History</h3>
             </div>
             {history.length === 0 ? (
               <p className="text-slate-400 italic text-sm">No historical records available.</p>
             ) : (
               <div className="space-y-6">
                 {history.map((h, idx) => (
                   <div key={idx} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-lg font-black text-slate-900">{h.diagnosis}</p>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h.date}</span>
                      </div>
                      <p className="text-blue-600 font-bold text-sm mb-2">{h.treatment}</p>
                      <p className="text-slate-500 text-xs italic">"{h.notes || 'No notes'}"</p>
                      <p className="mt-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">Medical Officer: Dr. {h.doctorName}</p>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* Labs Section */}
          <div className="mb-12">
             <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-3">
                <Microscope className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Laboratory Results</h3>
             </div>
             {labs.length === 0 ? (
               <p className="text-slate-400 italic text-sm">No lab results available.</p>
             ) : (
               <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Name</th>
                      <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Result Findings</th>
                      <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {labs.map((l, idx) => (
                      <tr key={idx}>
                        <td className="py-4 font-black text-slate-900 text-sm">{l.testName} <br/><span className="text-[9px] font-bold text-slate-400">{l.date}</span></td>
                        <td className="py-4 text-xs text-slate-600 italic">"{l.result}"</td>
                        <td className="py-4 text-right">
                          <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                            l.status === 'Normal' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>{l.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             )}
          </div>

          {/* Prescriptions Section */}
          <div className="mb-20">
             <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-3">
                <Pill className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Medication Summary</h3>
             </div>
             {prescriptions.length === 0 ? (
               <p className="text-slate-400 italic text-sm">No prescriptions issued.</p>
             ) : (
               <div className="space-y-4">
                  {prescriptions.map((p, pIdx) => (
                    <div key={pIdx} className="border-l-4 border-indigo-500 bg-slate-50 p-6 rounded-r-2xl">
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Prescription Issued: {p.date}</p>
                       <div className="grid grid-cols-2 gap-4">
                          {p.medicines.map((m, mIdx) => (
                            <div key={mIdx} className="bg-white p-3 rounded-xl border border-slate-100">
                               <p className="font-black text-slate-900 text-xs">{m.name} ({m.dosage})</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase">{m.frequency} • {m.duration}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end pt-10 border-t-2 border-slate-900">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clinic Endorsement</p>
                <p className="text-[9px] text-slate-400 italic max-w-sm leading-tight">This medical report is an accurate summary of the clinical records stored in the Dhool Clinic Terminal. Any alterations to this document render it invalid.</p>
             </div>
             <div className="text-center w-64">
                <div className="border-b border-slate-900 pb-2 mb-2 italic text-lg font-serif">
                   Clinic Management Office
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Stamp & Signature</p>
             </div>
          </div>

          <div className="mt-12 text-center opacity-20">
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Advancing Dental Excellence</p>
          </div>

        </div>
      </div>
    </div>
  );
};
