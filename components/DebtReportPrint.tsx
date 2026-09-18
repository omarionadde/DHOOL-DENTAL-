import React from 'react';
import { Patient } from '../types';
import { DhoolLogo } from './DhoolLogo';
import { Printer, Download, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface DebtReportPrintProps {
  patients: Patient[];
  totalDebt: number;
  onClose: () => void;
}

export const DebtReportPrint: React.FC<DebtReportPrintProps> = ({
  patients,
  totalDebt,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('debt-report-pdf-content');
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `Warbixinta_Deemaha_Dhool_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[250] flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl h-[95vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto">
        
        {/* Controls Header */}
        <div className="p-6 bg-slate-50 border-b flex justify-between items-center print:hidden">
          <div className="flex items-center gap-4">
            <h2 className="font-black text-slate-900 uppercase tracking-tight text-sm">Warbixinta Deemaha (Debt Report)</h2>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex gap-2">
              <button 
                onClick={handleDownloadPDF} 
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-blue-600" /> Download PDF
              </button>
              <button 
                onClick={handlePrint} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <Printer className="w-4 h-4" /> Print Report
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Printable / PDF Content */}
        <div id="debt-report-pdf-content" className="flex-1 overflow-y-auto p-10 bg-white print:overflow-visible">
          
          {/* Clinic Header */}
          <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <DhoolLogo className="w-16 h-16" />
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">DHOOL</h1>
                <p className="text-[10px] font-black tracking-[0.3em] text-emerald-600 uppercase mt-1">Dental Clinic & Pharmacy</p>
                <div className="text-[9px] text-slate-500 font-bold mt-2 uppercase space-y-0.5">
                  <p>Waaberi District, Via Liberia, Mogadishu, Somalia</p>
                  <p>Tel: +252 61 972 6662 | Email: health@dhoolclinic.so</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">WARBIXINTA DEEMAHA</h2>
              <p className="text-xs font-bold text-slate-500 mt-1">Patient Outstanding Debt Report</p>
              <p className="text-xs font-bold text-slate-400 mt-2">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Metrics Summary Card */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tirada Bukaanka Deenta qaba</p>
              <p className="text-2xl font-black text-slate-900">{patients.length} Patient(s)</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wadarta Deenta Harta</p>
              <p className="text-2xl font-black text-rose-600">${totalDebt.toFixed(2)}</p>
            </div>
            <div className="text-right flex flex-col justify-center">
              <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 font-black text-[10px] uppercase rounded-full self-end">
                Official Financial Report
              </span>
            </div>
          </div>

          {/* Debts Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">Magaca Bukaanka (Patient Name)</th>
                  <th className="py-3 px-4">Taleefanka (Phone)</th>
                  <th className="py-3 px-4">Da'da/Jinsiga</th>
                  <th className="py-3 px-4 text-right">Deenta ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {patients.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-500">{p.id.slice(-6)}</td>
                    <td className="py-3 px-4 font-black text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{p.phone}</td>
                    <td className="py-3 px-4 text-slate-600">{p.age} Yrs / {p.gender || 'N/A'}</td>
                    <td className="py-3 px-4 text-right font-black text-rose-600">${(p.balance || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-900 font-black text-slate-900 text-xs">
                  <td colSpan={5} className="py-4 px-4 text-right uppercase tracking-wider">Wadarta Guud (Total Outstanding Debt):</td>
                  <td className="py-4 px-4 text-right text-rose-600 text-sm font-black">${totalDebt.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Signatures */}
          <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-bold">
            <div>
              <p>Maamulka Clinic-ka / Authorized Signature: _______________________</p>
            </div>
            <div>
              <p>Dhool Dental Clinic & Pharmacy © {new Date().getFullYear()}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
