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
      margin: 10,
      filename: `Dhool_DebtReceipt_${patient.name.replace(/\s+/g, '_')}_${date}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
       html2pdf().set(opt).from(element).save();
    } else {
       alert("PDF library loading... please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <style type="text/css" media="print">
        {`
          @page { size: A4 portrait; margin: 10mm; }
          body, html { width: 100%; height: auto; }
          .print-full-page { width: 100% !important; height: auto !important; min-height: 0 !important; max-height: none !important; overflow: visible !important; }
          .print-hidden { display: none !important; }
        `}
      </style>
      <div className="bg-white w-full max-w-xl h-auto rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto print-full-page">
        
        {/* Controls */}
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center print:hidden">
          <div className="flex gap-2">
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Document Content */}
        <div id="debt-receipt-content" className="flex-1 overflow-y-auto p-10 bg-white print:overflow-visible">
          
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-slate-200 border-dashed mb-8">
            <div className="flex justify-center mb-4">
              <DhoolLogo className="w-14 h-14" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">DHOOL</h1>
            <p className="text-[9px] font-black tracking-[0.3em] text-emerald-600 uppercase mb-4">Dental Clinic</p>
            <h2 className="text-xl font-bold text-slate-800">Official Payment Receipt</h2>
            <p className="text-[10px] text-slate-500 mt-1">Receipt #: {receiptId}</p>
            <p className="text-[10px] text-slate-500">Date: {date}</p>
          </div>

          {/* Patient Info */}
          <div className="mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Received From</p>
            <p className="text-lg font-black text-slate-900 mb-1">{patient.name}</p>
            <p className="text-xs text-slate-500">Phone: {patient.phone}</p>
          </div>

          {/* Payment Detail */}
          <div className="mb-8 border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment For</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</span>
            </div>
            <div className="px-5 py-4 flex justify-between items-center border-b border-slate-100">
              <span className="font-bold text-slate-700">Debt Settlement</span>
              <span className="font-black text-emerald-600 text-lg">${amountPaid.toFixed(2)}</span>
            </div>
            <div className="px-5 py-3 flex justify-between items-center bg-slate-50">
              <span className="text-xs font-bold text-slate-500">Payment Method</span>
              <span className="text-xs font-black text-slate-700 uppercase">{method}</span>
            </div>
          </div>

          {/* Balance Detail */}
          <div className="flex justify-between items-center mb-10 p-5 bg-blue-50 rounded-xl border border-blue-100">
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Remaining Balance</p>
              <p className="text-xs text-blue-600/80">Amount still owed</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-blue-700">${remainingBalance.toFixed(2)}</p>
            </div>
          </div>

          {/* Footer / Signature */}
          <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <div className="flex justify-between items-end mb-6">
              <div className="text-left w-32">
                <div className="border-b border-slate-300 pb-2 mb-2"></div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Patient Signature</p>
              </div>
              <div className="text-right w-32">
                <div className="border-b border-slate-300 pb-2 mb-2"></div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cashier / Staff</p>
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thank you for your payment</p>
          </div>
        </div>
      </div>
    </div>
  );
};
