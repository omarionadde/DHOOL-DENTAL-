import React from 'react';
import { Patient, PatientHistory, LabResult, Prescription } from '../types';
import { DhoolLogo } from './DhoolLogo';
import { Printer, Download, X, ClipboardList, Microscope, Pill } from 'lucide-react';

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
      margin: 8,
      filename: `Dhool_Medical_Report_${patient.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all'] }
    };

    if (typeof html2pdf !== 'undefined') {
       html2pdf().set(opt).from(element).save();
    } else {
       alert("PDF library loading... please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250] flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static overflow-y-auto">
      <div className="bg-white w-full max-w-4xl h-auto max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border-2 border-slate-300 print:border-none print:shadow-none print:w-full print:max-w-none print:h-auto my-auto">
        
        {/* Controls Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center print:hidden text-white">
          <div className="flex items-center gap-3">
            <span className="font-black text-slate-200 uppercase tracking-tight text-xs hidden sm:inline">Clinical Report</span>
            <div className="h-4 w-px bg-slate-700 hidden sm:inline"></div>
            <button 
              onClick={handlePrint} 
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow transition-all cursor-pointer"
              title="Print Medical Report"
            >
              <Printer className="w-4 h-4" /> Print / Daabac
            </button>
            <button 
              onClick={handleDownloadPDF} 
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
              title="Download PDF"
            >
              <Download className="w-4 h-4 text-emerald-400" /> PDF
            </button>
          </div>
          <button 
            onClick={onClose} 
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md shadow-rose-900/40 transition-all cursor-pointer"
            title="Close window"
          >
            <X className="w-4 h-4" /> Close / Xidh
          </button>
        </div>

        {/* Report Content */}
        <div 
          id="patient-report-content" 
          className="print-sheet-active flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-black print:overflow-hidden print:p-0"
          style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
        >
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-6">
            <div className="flex items-center gap-4">
              <DhoolLogo className="w-20 h-20" />
              <div>
                <h1 className="text-4xl font-black text-black tracking-tighter leading-none">DHOOL</h1>
                <p className="text-[11px] font-black tracking-[0.4em] text-black uppercase mt-1">Dental Clinic & Pharmacy</p>
                <div className="text-[10px] text-black font-bold mt-2 uppercase space-y-0.5">
                  <p>Waaberi District, Via Liberia, Mogadishu, Somalia</p>
                  <p>Tel: +252 61 972 6662 | health@dhoolclinic.so</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-black uppercase tracking-tight mb-1">MEDICAL REPORT</h2>
              <p className="text-xs font-black text-black">Patient ID: #{patient.id.slice(-6).toUpperCase()}</p>
              <p className="text-xs font-bold text-black mt-0.5">Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Patient Profile */}
          <div className="bg-slate-50 p-6 rounded-xl border-2 border-black mb-8 grid grid-cols-2 gap-6">
             <div>
                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Patient Full Name</p>
                <p className="text-2xl font-black text-black">{patient.name}</p>
             </div>
             <div className="grid grid-cols-3">
                <div>
                   <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Age</p>
                   <p className="text-xl font-black text-black">{patient.age} Yrs</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Gender</p>
                   <p className="text-xl font-black text-black">{patient.gender || 'N/A'}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Contact Phone</p>
                   <p className="text-base font-black text-black">{patient.phone}</p>
                </div>
             </div>
          </div>

          {/* History Section */}
          <div className="mb-8">
             <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-2">
                <ClipboardList className="w-5 h-5 text-black" />
                <h3 className="text-lg font-black text-black uppercase tracking-tight">Clinical History (Baaritaanadii Hore)</h3>
             </div>
             {history.length === 0 ? (
               <p className="text-black font-semibold italic text-xs">No historical records available.</p>
             ) : (
               <div className="space-y-4">
                 {history.map((h, idx) => (
                   <div key={idx} className="bg-slate-50 border border-black/20 p-5 rounded-xl">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-base font-black text-black">{h.diagnosis}</p>
                        <span className="text-[10px] font-black text-black uppercase">{h.date}</span>
                      </div>
                      <p className="text-black font-bold text-xs mb-1">Treatment: {h.treatment}</p>
                      <p className="text-black text-xs font-medium italic">Notes: "{h.notes || 'None'}"</p>
                      <p className="mt-2 text-[9px] font-black text-black uppercase tracking-wider">Attending Doctor: Dr. {h.doctorName}</p>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* Labs Section */}
          <div className="mb-8">
             <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-2">
                <Microscope className="w-5 h-5 text-black" />
                <h3 className="text-lg font-black text-black uppercase tracking-tight">Laboratory Results (Natiijooyinka Shaybaarka)</h3>
             </div>
             {labs.length === 0 ? (
               <p className="text-black font-semibold italic text-xs">No lab results available.</p>
             ) : (
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-y-2 border-black bg-slate-100">
                      <th className="py-2.5 px-3 text-[10px] font-black text-black uppercase tracking-widest">Test Name</th>
                      <th className="py-2.5 px-3 text-[10px] font-black text-black uppercase tracking-widest">Result Findings</th>
                      <th className="py-2.5 px-3 text-[10px] font-black text-black uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/20 text-xs text-black">
                    {labs.map((l, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-3 font-black text-black text-sm">{l.testName} <br/><span className="text-[9px] font-bold text-black">{l.date}</span></td>
                        <td className="py-3 px-3 text-xs text-black font-semibold leading-relaxed">{l.result}</td>
                        <td className="py-3 px-3 text-right">
                          <span className="px-2.5 py-1 rounded border border-black font-black text-[9px] uppercase bg-slate-100 text-black">
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             )}
          </div>

          {/* Prescriptions Section */}
          <div className="mb-10">
             <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-2">
                <Pill className="w-5 h-5 text-black" />
                <h3 className="text-lg font-black text-black uppercase tracking-tight">Medication Summary (Daawooyinka La Qoray)</h3>
             </div>
             {prescriptions.length === 0 ? (
               <p className="text-black font-semibold italic text-xs">No prescriptions issued.</p>
             ) : (
               <div className="space-y-4">
                  {prescriptions.map((p, pIdx) => (
                    <div key={pIdx} className="border-2 border-black bg-slate-50 p-5 rounded-xl">
                       <p className="text-[10px] font-black text-black uppercase tracking-widest mb-3">Prescription Date: {p.date}</p>
                       <div className="grid grid-cols-2 gap-3">
                          {p.medicines.map((m, mIdx) => (
                            <div key={mIdx} className="bg-white p-3 rounded-lg border border-black/20">
                               <p className="font-black text-black text-xs">{m.name} ({m.dosage})</p>
                               <p className="text-[9px] font-bold text-black uppercase">{m.frequency} • {m.duration}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end pt-6 border-t-2 border-black">
             <div>
                <p className="text-[9px] font-black text-black uppercase tracking-widest mb-1">Clinic Endorsement</p>
                <p className="text-[8px] text-black font-bold max-w-sm leading-tight">Official medical summary from Dhool Dental Clinic. Any modifications invalidate this record.</p>
             </div>
             <div className="text-center w-64">
                <div className="border-b-2 border-black pb-2 mb-2 italic text-base font-serif text-black font-bold">
                   Dhool Medical Directorate
                </div>
                <p className="text-[9px] font-black text-black uppercase tracking-widest">Authorized Signature & Stamp</p>
             </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Advancing Dental Excellence • Dhool Clinic</p>
          </div>

        </div>
      </div>
    </div>
  );
};

