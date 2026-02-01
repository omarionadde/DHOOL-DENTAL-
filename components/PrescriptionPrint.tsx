
import React from 'react';
import { Prescription, Patient } from '../types';
import { DhoolLogo } from './DhoolLogo';
import { Printer, Download, X, FileText } from 'lucide-react';

interface PrescriptionPrintProps {
  prescription: Prescription;
  patient: Patient;
  onClose: () => void;
}

declare const html2pdf: any;

export const PrescriptionPrint: React.FC<PrescriptionPrintProps> = ({ 
  prescription, 
  patient,
  onClose 
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('prescription-print-content');
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `Dhool_Rx_${patient.name.replace(/\s+/g, '_')}_${prescription.date}.pdf`,
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-2xl h-[90vh] md:h-auto md:max-h-[95vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto">
        
        {/* Controls */}
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center print:hidden">
          <div className="flex gap-2">
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              <Printer className="w-4 h-4" /> Print Rx
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prescription Document Content */}
        <div id="prescription-print-content" className="flex-1 overflow-y-auto p-12 bg-white print:overflow-visible">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
            <div className="flex items-center gap-4">
              <DhoolLogo className="w-16 h-16" />
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">DHOOL</h1>
                <p className="text-[10px] font-black tracking-[0.3em] text-emerald-600 uppercase mt-1">Dental Clinic & Pharmacy</p>
                <div className="text-[9px] text-slate-400 font-bold mt-2 uppercase space-y-0.5">
                  <p>Waaberi District, Via Liberia</p>
                  <p>Tel: +252 61 972 6662</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-black text-slate-200 uppercase tracking-tighter mb-2">Prescription</h2>
              <p className="text-xs font-black text-slate-900">Rx ID: #{prescription.id.slice(-6).toUpperCase()}</p>
              <p className="text-xs font-bold text-slate-500">{prescription.date}</p>
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
                <p className="text-lg font-black text-slate-900">M/F</p>
              </div>
            </div>
          </div>

          {/* Rx Icon */}
          <div className="mb-6">
            <span className="text-5xl font-serif italic text-slate-900">Rx</span>
          </div>

          {/* Medications Table */}
          <div className="mb-12">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medicine & Dosage</th>
                  <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Frequency</th>
                  <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prescription.medicines.map((med, idx) => (
                  <tr key={idx}>
                    <td className="py-5">
                      <p className="font-black text-slate-900 text-sm">{med.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{med.dosage}</p>
                    </td>
                    <td className="py-5 text-center font-black text-blue-600 text-sm">{med.frequency}</td>
                    <td className="py-5 text-right font-bold text-slate-700 text-sm">{med.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Clinical Notes / Advice */}
          <div className="mb-20">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-50 pb-2">Doctor's Advice / Special Instructions</h4>
            <div className="min-h-[60px] border border-dashed border-slate-100 rounded-xl p-4">
              <p className="text-slate-400 italic text-xs">No special instructions provided.</p>
            </div>
          </div>

          {/* Footer / Signature */}
          <div className="flex justify-between items-end pt-10 border-t border-slate-50">
            <div>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1">Clinic Policy</p>
              <p className="text-[8px] text-slate-400 italic max-w-xs leading-tight">This prescription is valid for 30 days from the date of issue. Please consult your pharmacist for drug interactions.</p>
            </div>
            <div className="text-center w-48">
              <div className="border-b border-slate-900 pb-2 mb-2 italic font-serif">
                Dr. Mohamed Abdi
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Doctor's Signature & Stamp</p>
            </div>
          </div>

          <div className="mt-12 text-center opacity-20">
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Your Smile is Our Mission</p>
          </div>

        </div>
      </div>
    </div>
  );
};
