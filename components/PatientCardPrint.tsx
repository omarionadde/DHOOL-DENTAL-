import React, { useRef } from 'react';
import { Patient } from '../types';
import { DhoolLogo } from './DhoolLogo';
import { Printer, Download, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface Props {
  patient: Patient;
  onClose: () => void;
}

export const PatientCardPrint: React.FC<Props> = ({ patient, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    if (cardRef.current) {
        const controlsElement = cardRef.current.querySelector('.print-hidden-in-pdf');
        if (controlsElement) {
            (controlsElement as HTMLElement).style.display = 'none';
        }

        const opt = {
            margin:       10,
            filename:     `Dhool_Patient_Card_${patient.name.replace(/\s+/g, '_')}_${patient.id.slice(-6)}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(cardRef.current).save().then(() => {
            if (controlsElement) {
                (controlsElement as HTMLElement).style.display = '';
            }
        });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static overflow-y-auto">
      <div ref={cardRef} className="bg-white w-full max-w-lg h-auto rounded-2xl shadow-2xl overflow-hidden flex flex-col border-2 border-slate-300 print:border-none print:shadow-none print:w-full print:max-w-none my-auto">
        
        {/* Controls */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center print:hidden print-hidden-in-pdf text-white">
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()} 
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow transition-all cursor-pointer"
                  title="Print Patient Card"
                >
                    <Printer className="w-4 h-4" /> Print / Daabac
                </button>
                <button 
                  onClick={handleDownloadPdf} 
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
                  title="Download PDF"
                >
                    <Download className="w-4 h-4 text-emerald-400" /> PDF
                </button>
            </div>
            <button 
              onClick={onClose} 
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md shadow-rose-900/40 transition-all cursor-pointer"
              title="Close window"
            >
                <X className="w-4 h-4" /> Close / Xidh
            </button>
        </div>

        {/* Card Header (for Print) */}
        <div className="p-6 sm:p-8 border-b-2 border-black flex justify-between items-start bg-white text-black">
            <div className="flex items-center gap-4">
                <DhoolLogo className="w-14 h-14" />
                <div>
                   <h1 className="text-2xl font-black text-black tracking-tighter leading-none">DHOOL</h1>
                   <p className="text-[9px] font-black tracking-[0.2em] text-black uppercase mt-0.5">Dental Clinic & Pharmacy</p>
                   <div className="text-[8px] text-black font-bold mt-1.5 uppercase space-y-0.5">
                     <p>Waaberi District, Via Liberia, Mogadishu</p>
                     <p>Tel: +252 61 972 6662 | health@dhoolclinic.so</p>
                   </div>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-xl font-black text-black uppercase tracking-tight">PATIENT CARD</h2>
                <p className="text-black font-bold uppercase text-[10px] mt-1">Date: {new Date().toLocaleDateString()}</p>
            </div>
        </div>

        {/* Card Content */}
        <div className="p-8 sm:p-10 bg-white text-black">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-white font-black text-4xl mb-4 shadow-lg">
              {patient.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-black text-black tracking-tight">{patient.name}</h2>
            <p className="text-black font-black uppercase text-xs tracking-[0.2em] mt-2 bg-slate-100 px-4 py-1.5 rounded-full border border-black">
              Patient ID: #{patient.id.slice(-6).toUpperCase()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-xl border-2 border-black">
            <div className="flex flex-col">
              <span className="text-black text-[10px] font-black uppercase tracking-widest mb-1">Age</span>
              <span className="text-black font-black text-lg">{patient.age} Yrs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-black text-[10px] font-black uppercase tracking-widest mb-1">Sex</span>
              <span className="text-black font-black text-lg">{patient.gender || 'N/A'}</span>
            </div>
            <div className="flex flex-col col-span-2 pt-2 border-t border-black/20">
              <span className="text-black text-[10px] font-black uppercase tracking-widest mb-1">Phone Number</span>
              <span className="text-black font-black text-lg">{patient.phone}</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-black text-center">
            <p className="text-[9px] font-black text-black uppercase tracking-[0.3em]">Official Dhool Clinic Identification</p>
          </div>
        </div>
      </div>
    </div>
  );
};

