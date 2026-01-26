
import React, { useState } from 'react';
import { CreditCard, Search, FileText, Download, Filter, DollarSign, TrendingUp, Clock, Printer } from 'lucide-react';
import { Invoice } from '../types';
import { Invoice as InvoiceComponent } from '../components/Invoice';
import { InvoiceReceipt } from '../components/InvoiceReceipt';
import { useData } from '../context/DataContext';

const BillingView: React.FC = () => {
  const { invoices } = useData();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  return (
    <div className="space-y-6">
      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        selectedInvoice.type === 'Pharmacy' 
        ? <InvoiceReceipt 
            items={[{ id: '1', name: 'Pharmacy Items', price: selectedInvoice.amount, quantity: 1, stock: 0, category: 'General', expiryDate: '' }]} // Simplified view for historic
            total={selectedInvoice.amount}
            transactionId={selectedInvoice.id}
            date={selectedInvoice.date}
            method={selectedInvoice.method}
            onClose={() => setSelectedInvoice(null)}
          />
        : <InvoiceComponent 
            items={[{ id: '1', name: 'Clinical Procedure', price: selectedInvoice.amount, quantity: 1, stock: 0, category: 'Service', expiryDate: '' }]} // Simplified view for historic
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
          <h1 className="text-2xl font-bold text-slate-900">Billing & Finance</h1>
          <p className="text-slate-500">Manage patient invoices and clinic revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <DollarSign className="w-4 h-4" /> New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-2 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">THIS MONTH</span>
          </div>
          <p className="text-emerald-100 text-sm font-medium">Total Paid</p>
          <h3 className="text-3xl font-bold mt-1">
             ${invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0).toLocaleString()}
          </h3>
        </div>
        <div className="bg-amber-500 p-6 rounded-2xl text-white shadow-lg shadow-amber-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-2 rounded-lg"><Clock className="w-6 h-6" /></div>
            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">UNPAID</span>
          </div>
          <p className="text-amber-100 text-sm font-medium">Outstanding Balances</p>
          <h3 className="text-3xl font-bold mt-1">
             ${invoices.filter(i => i.status === 'Pending').reduce((acc, i) => acc + i.amount, 0).toLocaleString()}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><FileText className="w-6 h-6" /></div>
            <span className="text-xs font-bold text-slate-400">VOLUME</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Invoices Issued</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">{invoices.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by invoice # or patient..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50">Pending Only</button>
            <button className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50"><Filter className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{inv.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{inv.patientName}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{inv.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inv.type === 'Dental' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {inv.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">${inv.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${inv.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <span className={`text-xs font-semibold ${inv.status === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedInvoice(inv)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="View & Print">
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingView;
