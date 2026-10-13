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

export const Invoice: React.FC<InvoiceProps> = ({ 
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
      margin: 10,
      filename: `Dhool_Clinical_Invoice_${transactionId.slice(-6)}.pdf`,
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
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm print:bg-white print:p-0 print:static overflow-y-auto">
      <div className="bg-white w-full max-w-4xl h-auto rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:h-auto flex flex-col border-2 border-slate-300 print:border-none my-auto">
        
        {/* Document Header Controls (Hidden on print) */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center print:hidden text-white">
           <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-slate-300">Invoice #{transactionId.slice(-6)}</span>
              <div className="h-4 w-px bg-slate-700"></div>
              <button 
                onClick={handlePrint} 
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                title="Print Invoice"
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
             className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md shadow-rose-900/40 transition-all cursor-pointer"
             title="Close window"
           >
             <X className="w-4 h-4" /> Close / Xidh
           </button>
        </div>

        {/* Main Document Area */}
        <div id="invoice-content" className="flex-1 overflow-y-auto p-10 sm:p-12 bg-white text-black print:overflow-visible">
          
          <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <DhoolLogo className="w-16 h-16" />
                <div>
                   <h1 className="text-4xl font-black text-black tracking-tighter leading-none">DHOOL</h1>
                   <p className="text-[10px] font-black tracking-[0.3em] text-black uppercase mt-1">Dental Clinic & Pharmacy</p>
                </div>
              </div>
              <div className="text-xs text-black font-bold space-y-0.5">
                 <p>Waaberi District, Via Liberia</p>
                 <p>Mogadishu, Somalia</p>
                 <p>Tel: +252 61 972 6662</p>
                 <p>Email: health@dhoolclinic.so</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-black text-black uppercase tracking-tight mb-3">INVOICE</h2>
              <div className="space-y-1.5 text-xs text-black font-black">
                 <div className="flex justify-end gap-3"><span className="uppercase tracking-widest text-[10px]">Date:</span> <span>{date}</span></div>
                 <div className="flex justify-end gap-3"><span className="uppercase tracking-widest text-[10px]">Invoice ID:</span> <span>#{transactionId}</span></div>
                 <div className="flex justify-end gap-3"><span className="uppercase tracking-widest text-[10px]">Payment Method:</span> <span className="uppercase">{method}</span></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-8 bg-slate-50 p-6 rounded-xl border border-black/10">
             <div>
                <h3 className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-2 border-b border-black pb-1">Billed To</h3>
                <p className="text-2xl font-black text-black">{patientName || 'Clinical Walk-in'}</p>
                <p className="text-xs text-black font-bold mt-1">Patient Registry #{patientName ? patientName.slice(0,3).toUpperCase() : 'WALK'}99</p>
             </div>
             <div>
                <h3 className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-2 border-b border-black pb-1">Clinic Notice</h3>
                <p className="text-xs text-black font-bold leading-relaxed">Official clinical and pharmaceutical invoice for the treatments and medicines provided below. Please retain for your medical history records.</p>
             </div>
          </div>

          <table className="w-full text-left mb-8 border-collapse">
            <thead className="bg-slate-100 text-black text-[10px] font-black uppercase tracking-widest border-y-2 border-black">
              <tr>
                <th className="px-4 py-3">Treatment / Medicine Details</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/20 text-xs text-black">
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-4">
                    <p className="font-black text-black text-sm">{item.name}</p>
                    <p className="text-[9px] font-bold text-black uppercase tracking-wider">{item.category}</p>
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-black">{item.quantity}</td>
                  <td className="px-4 py-4 font-bold text-black">${item.price.toFixed(2)}</td>
                  <td className="px-4 py-4 text-right font-black text-black">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-12">
             <div className="w-full max-w-xs space-y-2.5 bg-slate-50 p-5 rounded-xl border border-black/10">
                <div className="flex justify-between items-center text-black font-bold uppercase tracking-widest text-[10px]">
                   <span>Taxable Amount (Net)</span>
                   <span>${(total - (vat || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-black font-bold uppercase tracking-widest text-[10px]">
                   <span>VAT (5%)</span>
                   <span>${(vat || 0).toFixed(2)}</span>
                </div>
                <div className="h-px bg-black"></div>
                <div className="flex justify-between items-center">
                   <span className="text-xs font-black text-black uppercase tracking-wider">Grand Total</span>
                   <span className="text-2xl font-black text-black">${total.toFixed(2)}</span>
                </div>
                {paidAmount > 0 && (
                   <div className="flex justify-between items-center text-black font-bold uppercase tracking-widest text-[10px]">
                      <span>Amount Received</span>
                      <span>${paidAmount.toFixed(2)}</span>
                   </div>
                )}
                <div className="h-px bg-black"></div>
                <div className="flex justify-between items-center">
                   <span className="text-xs font-black text-black uppercase tracking-wider">Net Balance</span>
                   <span className="text-lg font-black text-black">${balance.toFixed(2)}</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-16 border-t-2 border-black pt-8 mt-8">
             <div className="text-center">
                <div className="h-10 border-b-2 border-black mb-2"></div>
                <p className="text-[10px] font-black text-black uppercase tracking-widest">Attending Dental Surgeon</p>
             </div>
             <div className="text-center">
                <div className="h-10 border-b-2 border-black mb-2"></div>
                <p className="text-[10px] font-black text-black uppercase tracking-widest">Pharmacy Officer Stamp</p>
             </div>
          </div>

          <div className="mt-12 pt-6 border-t border-black text-center">
             <p className="text-xs font-black text-black uppercase tracking-[0.3em]">Your Smile is Our Mission • Dhool Dental Clinic</p>
          </div>
        </div>

      </div>
    </div>
  );
};

