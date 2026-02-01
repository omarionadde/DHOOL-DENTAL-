
import React from 'react';
import { CartItem } from '../types';
import { DhoolLogo } from './DhoolLogo';

interface InvoiceProps {
  items: CartItem[];
  total: number;
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
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm print:bg-white print:p-0 print:static">
      <div className="bg-white w-full max-w-4xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:h-auto flex flex-col">
        
        {/* Document Header Controls (Hidden on print) */}
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center print:hidden">
           <div className="flex gap-2">
              <button onClick={handleDownloadPDF} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 flex items-center gap-2 font-bold text-xs uppercase tracking-widest"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Download PDF</button>
              <button onClick={handlePrint} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 flex items-center gap-2 font-bold text-xs uppercase tracking-widest"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg> Print Copy</button>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-rose-50 text-rose-500 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>

        {/* Main Document Area */}
        <div id="invoice-content" className="flex-1 overflow-y-auto p-12 bg-white print:overflow-visible">
          
          <div className="flex justify-between items-start border-b-4 border-blue-600 pb-10 mb-10">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <DhoolLogo className="w-16 h-16" />
                <div>
                   <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">DHOOL</h1>
                   <p className="text-[10px] font-black tracking-[0.3em] text-emerald-600 uppercase mt-1">Dental Clinic & Pharmacy</p>
                </div>
              </div>
              <div className="text-xs text-slate-500 font-medium space-y-1">
                 <p>Waaberi District, Via Liberia</p>
                 <p>Mogadishu, Somalia</p>
                 <p>Tel: +252 61 972 6662</p>
                 <p>Email: health@dhoolclinic.so</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-5xl font-black text-slate-100 uppercase tracking-tighter mb-4">Invoice</h2>
              <div className="space-y-2 text-sm">
                 <div className="flex justify-end gap-4"><span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Date:</span> <span className="font-black text-slate-900">{date}</span></div>
                 <div className="flex justify-end gap-4"><span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Invoice ID:</span> <span className="font-black text-slate-900">#{transactionId}</span></div>
                 <div className="flex justify-end gap-4"><span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Method:</span> <span className="font-black text-blue-600 uppercase">{method}</span></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-20 mb-12">
             <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Billed To</h3>
                <p className="text-2xl font-black text-slate-900">{patientName || 'Clinical Walk-in'}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Dhool Patient Registry #{patientName ? patientName.slice(0,3).toUpperCase() : 'WALK'}99</p>
             </div>
             <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Clinic Information</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">This document serves as an official clinical and pharmaceutical record for the items and services listed below. Please retain this invoice for your medical history records.</p>
             </div>
          </div>

          <table className="w-full text-left mb-10">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">Treatment / Medicine Details</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4">Unit Price</th>
                <th className="px-6 py-4 text-right rounded-tr-xl">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                       {item.image && (
                         <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden shrink-0">
                           <img src={item.image} className="w-full h-full object-cover" alt="" />
                         </div>
                       )}
                       <div>
                         <p className="font-black text-slate-900">{item.name}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center font-bold text-slate-700">{item.quantity}</td>
                  <td className="px-6 py-6 font-bold text-slate-700">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-6 text-right font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-20">
             <div className="w-full max-w-xs space-y-4">
                <div className="flex justify-between items-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                   <span>Total Outstanding</span>
                   <span>${total.toFixed(2)}</span>
                </div>
                {paidAmount > 0 && (
                   <div className="flex justify-between items-center text-emerald-600 font-bold uppercase tracking-widest text-[10px]">
                      <span>Amount Received</span>
                      <span>-${paidAmount.toFixed(2)}</span>
                   </div>
                )}
                <div className="h-px bg-slate-100"></div>
                <div className="flex justify-between items-center">
                   <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Net Balance</span>
                   <span className="text-3xl font-black text-blue-600">${balance.toFixed(2)}</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-20 border-t border-slate-100 pt-10 mt-10">
             <div className="text-center">
                <div className="h-10 border-b border-slate-200 mb-2"></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dr. Mohamed Abdi</p>
             </div>
             <div className="text-center">
                <div className="h-10 border-b border-slate-200 mb-2"></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pharmacy Officer Stamp</p>
             </div>
          </div>

          <div className="mt-20 pt-10 border-t border-slate-50 text-center">
             <p className="text-xs font-black text-slate-300 uppercase tracking-[0.4em]">Your Smile is Our Mission</p>
          </div>
        </div>

      </div>
    </div>
  );
};
