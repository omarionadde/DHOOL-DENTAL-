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
      margin: 10,
      filename: `Dhool_Lab_${patient.name.replace(/\s+/g, '_')}_${labResults[0]?.date || 'Report'}.pdf`,
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

  if (!labResults || labResults.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-full-page { width: 100%; height: 100%; }
        `}
      </style>
      <div className="bg-white w-full max-w-2xl h-[90vh] md:h-auto md:max-h-[95vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto print-full-page">
        
        {/* Controls */}
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center print:hidden">
          <div className="flex gap-2">
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              <Printer className="w-4 h-4" /> Print Lab Result
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lab Document Content */}
        <div id="lab-print-content" className="flex-1 overflow-y-auto p-12 bg-white print:overflow-visible">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
            <div className="flex items-center gap-4">
              <DhoolLogo className="w-16 h-16" />
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">DHOOL</h1>
                <p className="text-[10px] font-black tracking-[0.3em] text-emerald-600 uppercase mt-1">Dental Clinic & Laboratory</p>
                <div className="text-[9px] text-slate-400 font-bold mt-2 uppercase space-y-0.5">
                  <p>Waaberi District, Via Liberia</p>
                  <p>Tel: +252 61 972 6662</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-slate-200 uppercase tracking-tighter mb-2">Lab Report</h2>
              <p className="text-xs font-black text-slate-900">Lab ID: #{labResults[0].id.slice(-6).toUpperCase()}</p>
              <p className="text-xs font-bold text-slate-500">{labResults[0].date}</p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-8 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
              <p className="text-lg font-black text-slate-900">{patient.name}</p>
            </div>
            <div className="grid grid-cols-2">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Age</p>
                <p className="text-lg font-black text-slate-900">{patient.age}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sex</p>
                <p className="text-lg font-black text-slate-900">{patient.gender || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Lab Tests Detail */}
          {labResults.map((labResult, idx) => (
            <div key={labResult.id} className="mb-6 border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Investigation / Test {labResults.length > 1 ? `#${idx + 1}` : ''}</p>
                  <h3 className="text-xl font-black text-slate-900">{labResult.testName}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    labResult.status === 'Normal' ? 'bg-emerald-100 text-emerald-700' :
                    labResult.status === 'Abnormal' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {labResult.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Result / Findings</p>
                <div className="prose prose-sm max-w-none text-slate-700">
                  <p className="whitespace-pre-line text-sm leading-relaxed">{labResult.result}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Footer / Signature */}
          <div className="flex justify-between items-end pt-10 mt-auto border-t border-slate-50">
            <div>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1">Laboratory Policy</p>
              <p className="text-[8px] text-slate-400 italic max-w-xs leading-tight">This is a system generated report. Clinical correlation is advised.</p>
            </div>
            <div className="text-center w-48">
              <div className="border-b border-slate-900 pb-2 mb-2 italic font-serif text-slate-800">
                Dr. {labResults[0].doctorName || 'Laboratory Technologist'}
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Authorized Signature</p>
            </div>
          </div>

          <div className="mt-12 text-center opacity-20">
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Precision & Care</p>
          </div>

        </div>
      </div>
    </div>
  );
};
