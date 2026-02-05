
import React from 'react';
import { CartItem } from '../types';
import { DhoolLogo } from './DhoolLogo';

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
      margin: 0,
      filename: `Dhool_Receipt_${transactionId.slice(-6)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
       html2pdf().set(opt).from(element).save();
    } else {
       alert("PDF library loading... please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm print:bg-white print:p-0 print:static">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none">
        
        {/* Receipt Content Area */}
        <div id="invoice-content" className="p-6 text-gray-800 font-mono text-[11px] bg-white leading-tight">
          
          <div className="flex flex-col items-center justify-center mb-4 border-b-2 border-dashed border-gray-300 pb-4">
            <DhoolLogo className="w-16 h-16 mb-2" />
            <div className="text-center">
              <h2 className="text-xl font-black text-blue-600 tracking-tighter uppercase leading-none">DHOOL</h2>
              <p className="text-[8px] font-black tracking-[0.2em] text-emerald-600 uppercase mt-1">Dental Clinic & Pharmacy</p>
              <p className="text-[7px] text-gray-400 mt-1 uppercase">Waaberi District, Via Liberia</p>
              <p className="text-[7px] text-gray-400 uppercase">Tel: +252 61 972 6662</p>
            </div>
          </div>

          <div className="mb-4 space-y-1">
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-bold">{date}</span>
            </div>
            <div className="flex justify-between">
              <span>Receipt:</span>
              <span className="font-bold">#{transactionId.slice(-6)}</span>
            </div>
            {patientName && (
              <div className="flex justify-between border-t border-dashed border-gray-100 pt-1 mt-1">
                <span>Patient:</span>
                <span className="font-bold truncate max-w-[150px]">{patientName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Method:</span>
              <span className="font-bold">{method}</span>
            </div>
          </div>

          <div className="border-t border-b border-dashed border-gray-300 py-2 mb-4">
            <table className="w-full">
              <thead>
                <tr className="text-left opacity-60 text-[8px] uppercase tracking-widest">
                  <th className="pb-1">Item Description</th>
                  <th className="pb-1 text-center">Qty</th>
                  <th className="pb-1 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-gray-100">
                {items.map((item, index) => (
                  <tr key={index} className="align-top">
                    <td className="py-2 pr-2">
                      <div className="flex items-start gap-2">
                        {item.image && (
                          <img src={item.image} className="w-6 h-6 rounded object-cover border border-gray-100 shrink-0" alt="" />
                        )}
                        <span className="font-bold">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1 border-b border-dashed border-gray-300 pb-3 mb-4">
             <div className="flex justify-between opacity-70">
                <span>Subtotal (Net)</span>
                <span>${(total - (vat || 0)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between opacity-70">
                <span>VAT (5%)</span>
                <span>${(vat || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black pt-1 border-t border-dashed border-gray-100 mt-1">
              <span>GRAND TOTAL</span>
              <span>${(Number(total) || 0).toFixed(2)}</span>
            </div>
            {paidAmount > 0 && (
              <div className="flex justify-between opacity-70">
                <span>Amount Received</span>
                <span>${(Number(paidAmount) || 0).toFixed(2)}</span>
              </div>
            )}
            {(Number(balance) || 0) > 0 && (
              <div className="flex justify-between text-red-600 font-bold border-t border-dashed border-red-100 pt-1 mt-1">
                <span>Balance Due</span>
                <span>${(Number(balance) || 0).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="text-center space-y-2 mt-6">
            <div className="w-full flex justify-center py-2">
               <div className="w-24 h-1 bg-slate-100 rounded-full"></div>
            </div>
            <p className="font-bold uppercase tracking-widest text-[8px] text-gray-400">Your Smile is our Mission</p>
            <p className="text-[7px] italic text-gray-300">Thank you for choosing Dhool Clinic</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex gap-3 print:hidden border-t border-gray-100 flex-col sm:flex-row">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-gray-600 font-bold bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          
          <button 
            onClick={handleDownloadPDF}
            className="flex-1 py-3 text-gray-700 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            PDF
          </button>

          <button 
            onClick={handlePrint}
            className="flex-1 py-3 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            Print
          </button>
        </div>

      </div>
    </div>
  );
};
