
import React, { useState } from 'react';
import { CreditCard, Search, FileText, Download, Filter, DollarSign, TrendingUp, Clock, Printer, RotateCcw } from 'lucide-react';
import { Invoice, StaffUser } from '../types';
import { Invoice as InvoiceComponent } from '../components/Invoice';
import { InvoiceReceipt } from '../components/InvoiceReceipt';
import { useData } from '../context/DataContext';

interface Props {
  user: StaffUser;
}

const BillingView: React.FC<Props> = ({ user }) => {
  const { invoices, addTransaction, updateInvoiceStatus } = useData();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isProcessingRefund, setIsProcessingRefund] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRefund = async (originalInv: Invoice) => {
    // Validate if already refunded
    if (originalInv.isRefund || originalInv.status === 'Refunded') {
      alert("Biilkan mar hore ayaa laga laabtay!");
      return;
    }

    if (!confirm(`Ma hubtaa inaad ka laabato biilka #${originalInv.id}? Tani waxay abuuri doontaa biil lid ku ah (Reversal).`)) {
      return;
    }

    setIsProcessingRefund(originalInv.id);
    
    const refundInv: Invoice = {
      id: `REF-${originalInv.id}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      patientName: originalInv.patientName,
      date: new Date().toISOString().split('T')[0],
      amount: -Math.abs(originalInv.amount),
      discount: 0,
      totalPaid: -Math.abs(originalInv.amount),
      status: 'Refunded',
      type: originalInv.type,
      method: originalInv.method,
      isRefund: true
    };

    try {
      // 1. Create the reversal transaction
      const success = await addTransaction(refundInv, []);
      
      // 2. Mark the original invoice as Refunded to prevent duplicate actions
      if (success) {
        await updateInvoiceStatus(originalInv.id, 'Refunded');
        alert("Waa laga laabtay biilkii si guul leh!");
      }
    } catch (e) {
      console.error("Refund error:", e);
      alert("Cillad ayaa dhacday xilliga laabashada.");
    } finally {
      setIsProcessingRefund(null);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        selectedInvoice.type === 'Pharmacy' 
        ? <InvoiceReceipt 
            items={[{ id: '1', name: 'Pharmacy Items (Historic)', price: Math.abs(selectedInvoice.amount), quantity: 1, stock: 0, category: 'General', expiryDate: '' }]}
            total={selectedInvoice.amount}
            transactionId={selectedInvoice.id}
            date={selectedInvoice.date}
            method={selectedInvoice.method}
            onClose={() => setSelectedInvoice(null)}
          />
        : <InvoiceComponent 
            items={[{ id: '1', name: 'Clinical Procedure (Historic)', price: Math.abs(selectedInvoice.amount), quantity: 1, stock: 0, category: 'Service', expiryDate: '' }]}
            total={selectedInvoice.amount}
            date={selectedInvoice.date}
            transactionId={selectedInvoice.id}
            method={selectedInvoice.method}
            patientName={selectedInvoice.patientName}
            onClose={() => setSelectedInvoice(null)}
            t={(k) => k}
          />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Billing & Finance</h1>
          <p className="text-slate-500 font-medium">Manage patient invoices and clinic revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
             <DollarSign className="w-4 h-4" /> Financial Core
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp className="w-20 h-20" /></div>
          <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest">Gross Revenue</p>
          <h3 className="text-4xl font-black mt-1 tracking-tighter">
             ${invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0).toLocaleString()}
          </h3>
        </div>
        <div className="bg-rose-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-rose-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Clock className="w-20 h-20" /></div>
          <p className="text-rose-100 text-[10px] font-black uppercase tracking-widest">Total Refunds</p>
          <h3 className="text-4xl font-black mt-1 tracking-tighter">
             ${Math.abs(invoices.filter(i => i.status === 'Refunded' || i.isRefund).reduce((acc, i) => acc + (i.amount < 0 ? i.amount : 0), 0)).toLocaleString()}
          </h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><FileText className="w-20 h-20" /></div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Transactions</p>
          <h3 className="text-4xl font-black mt-1 text-slate-900 tracking-tighter">{invoices.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by invoice # or patient..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
          <div className="flex gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest items-center">
             Showing {filteredInvoices.length} results
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Invoice #</th>
                <th className="px-8 py-5">Patient</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className={`hover:bg-slate-50/50 transition-all ${inv.isRefund ? 'bg-rose-50/30' : ''}`}>
                  <td className="px-8 py-5 font-mono text-[10px] font-black text-slate-400">#{inv.id.slice(-8)}</td>
                  <td className="px-8 py-5 font-black text-slate-900 text-sm leading-tight">{inv.patientName}</td>
                  <td className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{inv.date}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                      inv.type === 'Dental' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {inv.type}
                    </span>
                  </td>
                  <td className={`px-8 py-5 font-black text-sm ${inv.amount < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${inv.status === 'Paid' ? 'bg-emerald-500' : inv.status === 'Refunded' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${inv.status === 'Paid' ? 'text-emerald-700' : inv.status === 'Refunded' ? 'text-rose-700' : 'text-amber-700'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedInvoice(inv)} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all" title="View & Print">
                          <Printer className="w-5 h-5" />
                        </button>
                        {user.role === 'Admin' && !inv.isRefund && inv.status !== 'Refunded' && (
                          <button 
                            onClick={() => handleRefund(inv)} 
                            disabled={isProcessingRefund === inv.id}
                            className={`p-3 rounded-2xl transition-all ${isProcessingRefund === inv.id ? 'text-slate-200 cursor-not-allowed opacity-50' : 'text-slate-300 hover:text-rose-600 hover:bg-rose-50'}`} 
                            title="Ka laabo biilkan (Refund/Reverse)"
                          >
                            <RotateCcw className={`w-5 h-5 ${isProcessingRefund === inv.id ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-slate-400 font-bold italic">
                    No matching invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingView;
