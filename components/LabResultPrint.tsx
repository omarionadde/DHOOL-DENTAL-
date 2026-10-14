import React from 'react';
import { LabResult, Patient } from '../types';
import { DhoolLogo } from './DhoolLogo';
import { Printer, Download, X } from 'lucide-react';

interface LabResultPrintProps {
  labResults: LabResult[];
  patient: Patient;
  onClose: () => void;
}

declare const html2pdf: any;

export const LabResultPrint: React.FC<LabResultPrintProps> = ({ 
  labResults, 
  patient, 
  onClose 
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('lab-print-content');
    if (!element) return;
    const opt = {
      margin: 8,
      filename: `Dhool_Lab_${patient.name.replace(/\s+/g, '_')}_${labResults[0]?.date || 'Report'}.pdf`,
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

  if (!labResults || labResults.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static overflow-y-auto">
      <div className="bg-white w-full max-w-2xl h-auto max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border-2 border-slate-300 print:border-none print:shadow-none print:w-full print:max-w-none print:h-auto my-auto">
        
        {/* Controls Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center print:hidden text-white">
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint} 
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow transition-all cursor-pointer"
              title="Print Lab Report"
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

        {/* Lab Document Content */}
        <div 
          id="lab-print-content" 
          className="print-sheet-active flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-black print:overflow-hidden print:p-0"
          style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
        >
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-6">
            <div className="flex items-center gap-4">
              <DhoolLogo className="w-16 h-16" />
              <div>
                <h1 className="text-3xl font-black text-black tracking-tighter leading-none">DHOOL</h1>
                <p className="text-[10px] font-black tracking-[0.3em] text-black uppercase mt-1">Dental Clinic & Laboratory</p>
                <div className="text-[10px] text-black font-bold mt-2 uppercase space-y-0.5">
                  <p>Waaberi District, Via Liberia, Mogadishu</p>
                  <p>Tel: +252 61 972 6662 | health@dhoolclinic.so</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-black uppercase tracking-tight mb-1">LAB REPORT</h2>
              <p className="text-xs font-black text-black">Lab ID: #{labResults[0].id.slice(-6).toUpperCase()}</p>
              <p className="text-xs font-bold text-black mt-0.5">{labResults[0].date}</p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-5 rounded-xl border-2 border-black">
            <div>
              <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Patient Name</p>
              <p className="text-xl font-black text-black">{patient.name}</p>
            </div>
            <div className="grid grid-cols-2">
              <div>
                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Age</p>
                <p className="text-xl font-black text-black">{patient.age} Yrs</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Sex</p>
                <p className="text-xl font-black text-black">{patient.gender || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Lab Tests Detail */}
          {labResults.map((labResult, idx) => (
            <div key={labResult.id} className="mb-6 border-2 border-black rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-6 py-3.5 border-b-2 border-black flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-black uppercase tracking-widest mb-0.5">Investigation / Test {labResults.length > 1 ? `#${idx + 1}` : ''}</p>
                  <h3 className="text-xl font-black text-black">{labResult.testName}</h3>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded border border-black text-[10px] font-black uppercase tracking-widest bg-white text-black">
                    {labResult.status}
                  </span>
                </div>
              </div>
              <div className="p-5 bg-white">
                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-2 border-b border-black/20 pb-1">Result / Findings</p>
                <div className="text-black font-semibold">
                  <p className="whitespace-pre-line text-sm leading-relaxed">{labResult.result}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Footer / Signature */}
          <div className="flex justify-between items-end pt-6 mt-8 border-t-2 border-black">
            <div>
              <p className="text-[9px] font-black text-black uppercase tracking-widest mb-1">Laboratory Policy</p>
              <p className="text-[9px] text-black font-bold max-w-xs leading-tight">System generated clinical laboratory findings. Correlation with dental clinical findings is advised.</p>
            </div>
            <div className="text-center w-52">
              <div className="border-b-2 border-black pb-2 mb-2 italic font-serif text-black font-bold">
                Dr. {labResults[0].doctorName || 'Laboratory Technologist'}
              </div>
              <p className="text-[9px] font-black text-black uppercase tracking-widest">Authorized Signature</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Precision & Care • Dhool Laboratory</p>
          </div>

        </div>
      </div>
    </div>
  );
};

