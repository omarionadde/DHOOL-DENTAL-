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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250] flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static overflow-y-auto">
      <div className="bg-white w-full max-w-4xl h-auto max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border-2 border-slate-300 print:border-none print:shadow-none print:w-full print:max-w-none print:h-auto my-auto">
        
        {/* Controls Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center print:hidden text-white">
          <div className="flex items-center gap-3">
            <span className="font-black text-slate-200 uppercase tracking-tight text-xs hidden sm:inline">Warbixinta Deemaha (Debt Report)</span>
            <div className="h-4 w-px bg-slate-700 hidden sm:inline"></div>
            <button 
              onClick={handlePrint} 
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow transition-all cursor-pointer"
              title="Print Debt Report"
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

        {/* Printable / PDF Content */}
        <div id="debt-report-pdf-content" className="flex-1 overflow-y-auto p-8 sm:p-10 bg-white text-black print:overflow-visible">
          
          {/* Clinic Header */}
          <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-6">
            <div className="flex items-center gap-4">
              <DhoolLogo className="w-16 h-16" />
              <div>
                <h1 className="text-3xl font-black text-black tracking-tighter leading-none">DHOOL</h1>
                <p className="text-[10px] font-black tracking-[0.3em] text-black uppercase mt-1">Dental Clinic & Pharmacy</p>
                <div className="text-[10px] text-black font-bold mt-2 uppercase space-y-0.5">
                  <p>Waaberi District, Via Liberia, Mogadishu, Somalia</p>
                  <p>Tel: +252 61 972 6662 | Email: health@dhoolclinic.so</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-black uppercase tracking-tight">WARBIXINTA DEEMAHA</h2>
              <p className="text-xs font-black text-black mt-1">Patient Outstanding Debt Report</p>
              <p className="text-xs font-bold text-black mt-1">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Metrics Summary Card */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-6 rounded-xl border-2 border-black mb-8">
            <div>
              <p className="text-[10px] font-black text-black uppercase tracking-widest">Tirada Bukaanka Deenta qaba</p>
              <p className="text-2xl font-black text-black">{patients.length} Bukaan (Patients)</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-black uppercase tracking-widest">Wadarta Deenta Harta</p>
              <p className="text-3xl font-black text-black">${totalDebt.toFixed(2)}</p>
            </div>
            <div className="text-right flex flex-col justify-center">
              <span className="inline-block px-3 py-1 bg-black text-white font-black text-[10px] uppercase rounded-lg self-end">
                Official Financial Report
              </span>
            </div>
          </div>

          {/* Debts Table */}
          <div className="overflow-hidden rounded-xl border-2 border-black mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-black text-[10px] font-black uppercase tracking-wider border-b-2 border-black">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">Magaca Bukaanka (Patient Name)</th>
                  <th className="py-3 px-4">Taleefanka (Phone)</th>
                  <th className="py-3 px-4">Da'da / Jinsiga</th>
                  <th className="py-3 px-4 text-right">Deenta Ku Taalla ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/20 text-xs text-black">
                {patients.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="py-3 px-4 font-bold text-black">{idx + 1}</td>
                    <td className="py-3 px-4 font-black text-black">{p.id.slice(-6).toUpperCase()}</td>
                    <td className="py-3 px-4 font-black text-black">{p.name}</td>
                    <td className="py-3 px-4 font-bold text-black">{p.phone}</td>
                    <td className="py-3 px-4 font-bold text-black">{p.age} Yrs / {p.gender || 'N/A'}</td>
                    <td className="py-3 px-4 text-right font-black text-black">${(p.balance || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-black font-black text-black text-xs">
                  <td colSpan={5} className="py-4 px-4 text-right uppercase tracking-wider">Wadarta Guud (Total Outstanding Debt):</td>
                  <td className="py-4 px-4 text-right text-black text-base font-black">${totalDebt.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Signatures */}
          <div className="mt-12 pt-6 border-t-2 border-black flex justify-between items-center text-xs text-black font-bold">
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

