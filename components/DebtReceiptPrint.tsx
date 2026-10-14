import React from 'react';
import { Patient } from '../types';
import { DhoolLogo } from './DhoolLogo';
import { Printer, Download, X } from 'lucide-react';

interface DebtReceiptPrintProps {
  patient: Patient;
  amountPaid: number;
  remainingBalance: number;
  date: string;
  receiptId: string;
  method: string;
  onClose: () => void;
}

declare const html2pdf: any;

export const DebtReceiptPrint: React.FC<DebtReceiptPrintProps> = ({ 
  patient,
  amountPaid,
  remainingBalance,
  date,
  receiptId,
  method,
  onClose 
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('debt-receipt-content');
    if (!element) return;
    const opt = {
      margin: 8,
      filename: `Dhool_DebtReceipt_${patient.name.replace(/\s+/g, '_')}_${date}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all'] }
    };

    if (typeof html2pdf !== 'undefined') {
       html2pdf().set(opt).from(element).save();
    } else {
       alert("PDF library loading... please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static overflow-y-auto">
      <div className="bg-white w-full max-w-xl h-auto rounded-2xl shadow-2xl overflow-hidden flex flex-col border-2 border-slate-300 print:border-none print:shadow-none print:w-full print:max-w-none my-auto">
        
        {/* Controls Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center print:hidden text-white">
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint} 
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow transition-all cursor-pointer"
              title="Print Receipt"
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

        {/* Receipt Document Content */}
        <div 
          id="debt-receipt-content" 
          className="print-sheet-active flex-1 overflow-y-auto p-8 sm:p-10 bg-white text-black print:overflow-hidden print:p-0"
          style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
        >
          
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-black border-dashed mb-6">
            <div className="flex justify-center mb-3">
              <DhoolLogo className="w-16 h-16" />
            </div>
            <h1 className="text-3xl font-black text-black tracking-tighter leading-none mb-1">DHOOL</h1>
            <p className="text-[10px] font-black tracking-[0.3em] text-black uppercase mb-3">Dental Clinic & Pharmacy</p>
            <h2 className="text-2xl font-black text-black uppercase">Official Payment Receipt</h2>
            <p className="text-xs font-bold text-black mt-1">Receipt #: {receiptId}</p>
            <p className="text-xs font-bold text-black">Date: {date}</p>
          </div>

          {/* Patient Info */}
          <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-black/10">
            <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Received From (Bukaanka)</p>
            <p className="text-xl font-black text-black mb-1">{patient.name}</p>
            <p className="text-xs font-bold text-black">Phone: {patient.phone} | ID: #{patient.id.slice(-6).toUpperCase()}</p>
          </div>

          {/* Payment Detail */}
          <div className="mb-6 border-2 border-black rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-5 py-3 border-b-2 border-black flex justify-between items-center">
              <span className="text-[10px] font-black text-black uppercase tracking-widest">Payment For</span>
              <span className="text-[10px] font-black text-black uppercase tracking-widest">Amount</span>
            </div>
            <div className="px-5 py-4 flex justify-between items-center border-b border-black/20 bg-white">
              <span className="font-black text-black text-base">Debt Settlement (Lacag Bixin Deyn)</span>
              <span className="font-black text-black text-2xl">${amountPaid.toFixed(2)}</span>
            </div>
            <div className="px-5 py-3 flex justify-between items-center bg-slate-50">
              <span className="text-xs font-bold text-black">Payment Method</span>
              <span className="text-xs font-black text-black uppercase">{method}</span>
            </div>
          </div>

          {/* Balance Detail */}
          <div className="flex justify-between items-center mb-8 p-5 bg-slate-50 rounded-xl border-2 border-black">
            <div>
              <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Remaining Balance (Deenta Harta)</p>
              <p className="text-xs font-bold text-black">Amount still owed to clinic</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-black">${remainingBalance.toFixed(2)}</p>
            </div>
          </div>

          {/* Footer / Signature */}
          <div className="mt-8 pt-6 border-t-2 border-black text-center">
            <div className="flex justify-between items-end mb-6">
              <div className="text-left w-36">
                <div className="border-b-2 border-black pb-2 mb-2"></div>
                <p className="text-[9px] font-black text-black uppercase tracking-widest">Patient Signature</p>
              </div>
              <div className="text-right w-36">
                <div className="border-b-2 border-black pb-2 mb-2"></div>
                <p className="text-[9px] font-black text-black uppercase tracking-widest">Cashier / Staff Stamp</p>
              </div>
            </div>
            <p className="text-[10px] font-black text-black uppercase tracking-widest">Thank you for choosing Dhool Dental Clinic</p>
          </div>
        </div>
      </div>
    </div>
  );
};

