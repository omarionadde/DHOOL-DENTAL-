import React from 'react';
import { Prescription, Patient } from '../types';
import { DhoolLogo } from './DhoolLogo';
import { Printer, Download, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static overflow-y-auto">
      <div className="bg-white w-full max-w-2xl h-auto max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border-2 border-slate-300 print:border-none print:shadow-none print:w-full print:max-w-none print:h-auto my-auto">
        
        {/* Controls Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center print:hidden text-white">
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint} 
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow transition-all cursor-pointer"
              title="Print Prescription"
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

        {/* Prescription Document Content */}
        <div id="prescription-print-content" className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white text-black print:overflow-visible">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-6">
            <div className="flex items-center gap-4">
              <DhoolLogo className="w-16 h-16" />
              <div>
                <h1 className="text-3xl font-black text-black tracking-tighter leading-none">DHOOL</h1>
                <p className="text-[10px] font-black tracking-[0.3em] text-black uppercase mt-1">Dental Clinic & Pharmacy</p>
                <div className="text-[10px] text-black font-bold mt-2 uppercase space-y-0.5">
                  <p>Waaberi District, Via Liberia, Mogadishu</p>
                  <p>Tel: +252 61 972 6662 | health@dhoolclinic.so</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-black uppercase tracking-tight mb-1">PRESCRIPTION</h2>
              <p className="text-xs font-black text-black">Rx ID: #{prescription.id.slice(-6).toUpperCase()}</p>
              <p className="text-xs font-bold text-black mt-0.5">Date: {prescription.date}</p>
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

          {/* Rx Icon */}
          <div className="mb-4">
            <span className="text-5xl font-serif italic font-black text-black">℞</span>
          </div>

          {/* Medications Table */}
          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead className="border-y-2 border-black bg-slate-100">
                <tr>
                  <th className="py-2.5 px-3 text-[10px] font-black text-black uppercase tracking-widest">Medicine & Dosage</th>
                  <th className="py-2.5 px-3 text-[10px] font-black text-black uppercase tracking-widest text-center">Frequency</th>
                  <th className="py-2.5 px-3 text-[10px] font-black text-black uppercase tracking-widest text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/20 text-black">
                {prescription.medicines.map((med, idx) => (
                  <tr key={idx}>
                    <td className="py-4 px-3">
                      <p className="font-black text-black text-sm">{med.name}</p>
                      <p className="text-[10px] font-bold text-black uppercase">{med.dosage}</p>
                    </td>
                    <td className="py-4 px-3 text-center font-black text-black text-sm">{med.frequency}</td>
                    <td className="py-4 px-3 text-right font-bold text-black text-sm">{med.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Clinical Notes / Advice */}
          <div className="mb-10">
            <h4 className="text-[10px] font-black text-black uppercase tracking-widest mb-2 border-b-2 border-black pb-1">Doctor's Advice / Special Instructions</h4>
            <div className="min-h-[50px] border-2 border-dashed border-black/30 rounded-xl p-3 bg-slate-50">
              <p className="text-black font-semibold text-xs leading-relaxed">Follow dosage strictly with water after meals. Report any adverse reactions immediately.</p>
            </div>
          </div>

          {/* Footer / Signature */}
          <div className="flex justify-between items-end pt-6 border-t-2 border-black">
            <div>
              <p className="text-[9px] font-black text-black uppercase tracking-widest mb-1">Clinic Policy</p>
              <p className="text-[9px] text-black font-bold max-w-xs leading-tight">This prescription is valid for 30 days from issue. Dispense by qualified pharmacist only.</p>
            </div>
            <div className="text-center w-52">
              <div className="border-b-2 border-black pb-2 mb-2 italic font-serif text-black font-bold">
                Dr. Mohamed Abdi
              </div>
              <p className="text-[9px] font-black text-black uppercase tracking-widest">Attending Dentist & Stamp</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Your Smile is Our Mission • Dhool Clinic</p>
          </div>

        </div>
      </div>
    </div>
  );
};

