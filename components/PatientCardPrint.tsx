import React from 'react';
import { Patient } from '../types';
import { DhoolLogo } from './DhoolLogo';

interface Props {
  patient: Patient;
  onClose: () => void;
}

export const PatientCardPrint: React.FC<Props> = ({ patient, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <style type="text/css" media="print">
        {`
          @page { size: A4 portrait; margin: 20mm; }
          body, html { width: 100%; height: auto; }
          .print-full-page { width: 100% !important; height: auto !important; min-height: 0 !important; max-height: none !important; overflow: visible !important; border: 1px solid #e2e8f0 !important; padding: 2rem !important; border-radius: 1rem !important; }
          .print-hidden { display: none !important; }
        `}
      </style>
      <div className="bg-white w-full max-w-lg h-auto rounded-3xl shadow-2xl overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto print-full-page">
        
        {/* Controls */}
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center print:hidden">
          <button onClick={onClose} className="text-slate-500 font-bold text-xs uppercase">Close</button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase">Print / Save PDF</button>
        </div>

        {/* Card Header (for Print) */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-start">
            <div className="flex items-center gap-4">
                <DhoolLogo className="w-12 h-12" />
                <div>
                   <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">DHOOL</h1>
                   <p className="text-[9px] font-black tracking-[0.2em] text-emerald-600 uppercase mt-0.5">Dental Clinic & Pharmacy</p>
                   <div className="text-[8px] text-slate-500 font-bold mt-2 uppercase">
                     Waaberi District, Via Liberia<br/>
                     Mogadishu, Somalia<br/>
                     Tel: +252 61 972 6662<br/>
                     Email: health@dhoolclinic.so
                   </div>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mt-1">Patient Card</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] mt-1">Date: {new Date().toLocaleDateString()}</p>
            </div>
        </div>

        {/* Card Content */}
        <div className="p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-28 h-28 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-5xl mb-6 shadow-lg shadow-blue-200">
              {patient.name.charAt(0)}
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{patient.name}</h2>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em] mt-2 bg-slate-100 px-3 py-1 rounded-full">Patient ID: {patient.id.slice(-6)}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Age</span>
              <span className="text-slate-900 font-bold text-lg">{patient.age}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Sex</span>
              <span className="text-slate-900 font-bold text-lg">{patient.gender}</span>
            </div>
            <div className="flex flex-col col-span-2">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Phone</span>
              <span className="text-slate-900 font-bold text-lg">{patient.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
