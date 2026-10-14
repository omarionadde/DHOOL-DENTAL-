import React from 'react';
import { CartItem } from '../types';
import { DhoolLogo } from './DhoolLogo';
import { Printer, Download, X } from 'lucide-react';

interface InvoiceProps {
  items: CartItem[];
  total: number;
  vat?: number;
  paidAmount?: number;
  balance?: number;
  date: string;
  transactionId: string;
  method: string;
  patientName?: string;
  onClose: () => void;
  t?: (key: string) => string;
}

declare const html2pdf: any;

export const InvoiceReceipt: React.FC<InvoiceProps> = ({ 
  items, 
  total = 0, 
  vat = 0,
  paidAmount = 0, 
  balance = 0, 
  date, 
  transactionId, 
  method, 
  patientName, 
  onClose,
  t = (k: string) => k
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;
    const opt = {
      margin: 5,
      filename: `Dhool_Receipt_${transactionId.slice(-6)}.pdf`,
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

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm print:bg-white print:p-0 print:static overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none border-2 border-slate-300 print:border-none my-auto">
        
        {/* Top Controls Bar */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center print:hidden text-white">
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint} 
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" /> Print / Daabac
            </button>
            <button 
              onClick={handleDownloadPDF} 
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
              title="PDF"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> PDF
            </button>
          </div>
          <button 
            onClick={onClose} 
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1 shadow transition-all cursor-pointer"
            title="Close Receipt"
          >
            <X className="w-4 h-4" /> Close / Xidh
          </button>
        </div>

        {/* Receipt Content Area */}
        <div 
          id="invoice-content" 
          className="print-sheet-active print-sheet-receipt p-6 text-black font-mono text-[11px] bg-white leading-tight"
          style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
        >
          
          <div className="flex flex-col items-center justify-center mb-4 border-b-2 border-dashed border-black pb-4">
            <DhoolLogo className="w-16 h-16 mb-2" />
            <div className="text-center">
              <h2 className="text-xl font-black text-black tracking-tighter uppercase leading-none">DHOOL</h2>
              <p className="text-[8px] font-black tracking-[0.2em] text-black uppercase mt-1">Dental Clinic & Pharmacy</p>
              <p className="text-[8px] text-black font-bold mt-1 uppercase">Waaberi District, Via Liberia</p>
              <p className="text-[8px] text-black font-bold uppercase">Tel: +252 61 972 6662</p>
            </div>
          </div>

          <div className="mb-4 space-y-1 text-black">
            <div className="flex justify-between">
              <span className="font-bold">Date:</span>
              <span className="font-black">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Receipt #:</span>
              <span className="font-black">#{transactionId.slice(-6)}</span>
            </div>
            {patientName && (
              <div className="flex justify-between border-t border-dashed border-black/30 pt-1 mt-1">
                <span className="font-bold">Patient:</span>
                <span className="font-black truncate max-w-[150px]">{patientName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-bold">Method:</span>
              <span className="font-black uppercase">{method}</span>
            </div>
          </div>

          <div className="border-t-2 border-b-2 border-dashed border-black py-2 mb-4">
            <table className="w-full text-black">
              <thead>
                <tr className="text-left text-black font-black text-[9px] uppercase tracking-wider border-b border-black/20 pb-1">
                  <th className="pb-1">Item Description</th>
                  <th className="pb-1 text-center">Qty</th>
                  <th className="pb-1 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-black/20">
                {items.map((item, index) => (
                  <tr key={index} className="align-top">
                    <td className="py-2 pr-2">
                      <div className="flex items-start gap-2">
                        {item.image && (
                          <img src={item.image} className="w-6 h-6 rounded object-cover border border-black/20 shrink-0" alt="" />
                        )}
                        <span className="font-black">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2 text-center font-bold">{item.quantity}</td>
                    <td className="py-2 text-right font-black">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1 border-b-2 border-dashed border-black pb-3 mb-4 text-black">
             <div className="flex justify-between font-bold">
                <span>Subtotal (Net)</span>
                <span>${(total - (vat || 0)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
                <span>VAT (5%)</span>
                <span>${(vat || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black pt-1 border-t-2 border-dashed border-black mt-1">
              <span>GRAND TOTAL</span>
              <span>${(Number(total) || 0).toFixed(2)}</span>
            </div>
            {paidAmount > 0 && (
              <div className="flex justify-between font-bold">
                <span>Amount Received</span>
                <span>${(Number(paidAmount) || 0).toFixed(2)}</span>
              </div>
            )}
            {(Number(balance) || 0) > 0 && (
              <div className="flex justify-between font-black border-t border-dashed border-black pt-1 mt-1">
                <span>Balance Due</span>
                <span>${(Number(balance) || 0).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="text-center space-y-1.5 mt-4 text-black">
            <div className="w-full flex justify-center py-1">
               <div className="w-24 h-0.5 bg-black rounded-full"></div>
            </div>
            <p className="font-black uppercase tracking-widest text-[9px]">Your Smile is our Mission</p>
            <p className="text-[8px] font-bold">Thank you for choosing Dhool Clinic</p>
          </div>
        </div>

        {/* Bottom Controls Bar */}
        <div className="p-3 bg-slate-50 flex gap-2 print:hidden border-t border-slate-200">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 text-black font-black bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors text-xs uppercase"
          >
            Close
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 py-2.5 text-slate-950 font-black bg-emerald-500 rounded-xl hover:bg-emerald-600 shadow flex items-center justify-center gap-1.5 text-xs uppercase"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>

      </div>
    </div>
  );
};

