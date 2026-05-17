import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Search, Info, CreditCard, ChevronDown } from 'lucide-react';
import { DebtReceiptPrint } from '../components/DebtReceiptPrint';
import { Patient } from '../types';

export default function DebtManagementView() {
  const { patients, processPatientPayment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Receipt state
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const indebtedPatients = useMemo(() => {
    return patients
      .filter(p => (p.balance || 0) > 0)
      .filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.phone.includes(searchTerm)
      )
      .sort((a, b) => (b.balance || 0) - (a.balance || 0));
  }, [patients, searchTerm]);

  const totalDebt = useMemo(() => {
    return patients.reduce((sum, p) => sum + (p.balance || 0), 0);
  }, [patients]);

  const handlePayment = async () => {
    if (!selectedPatient || !paymentAmount || isNaN(Number(paymentAmount))) return;
    
    setIsProcessing(true);
    const amountNum = Number(paymentAmount);
    
    try {
      await processPatientPayment(selectedPatient.id, amountNum, paymentMethod);
      
      const remaining = (selectedPatient.balance || 0) - amountNum;
      
      setReceiptData({
        patient: selectedPatient,
        amountPaid: amountNum,
        remainingBalance: remaining,
        date: new Date().toISOString().split('T')[0],
        receiptId: `REC-${Date.now().toString().slice(-6)}`,
        method: paymentMethod
      });
      
      setShowReceipt(true);
      setSelectedPatient(null);
      setPaymentAmount('');
    } catch (e) {
      console.error(e);
      alert('Error processing payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Debt Management</h1>
           <p className="text-slate-500 font-medium mt-1">Track and collect outstanding patient balances</p>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</p>
            <p className="text-3xl font-black text-rose-500">${totalDebt.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Patient List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="bg-slate-50 p-3 rounded-xl"><Search className="w-5 h-5 text-slate-400" /></div>
            <input 
              type="text" 
              placeholder="Search by patient name or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 font-medium placeholder:font-normal"
            />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex-1">
            {indebtedPatients.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Info className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No debts found</h3>
                <p className="text-slate-500">All patients have cleared their balances.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {indebtedPatients.map(patient => (
                  <div key={patient.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-900">{patient.name}</h4>
                      <p className="text-xs text-slate-500">{patient.phone}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</p>
                        <p className="font-black text-rose-500 text-lg">${(patient.balance || 0).toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedPatient(patient);
                          setPaymentAmount((patient.balance || 0).toString());
                        }}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                      >
                        Settle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Payment Form */}
        <div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sticky top-6">
             <h3 className="text-xl font-black text-slate-900 mb-6">Receive Payment</h3>
             
             {!selectedPatient ? (
               <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-2xl">
                 <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                 <p className="text-sm font-bold text-slate-500">Select a patient from the list to process their payment.</p>
               </div>
             ) : (
               <div className="space-y-6">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paying Patient</p>
                   <p className="font-black text-lg text-slate-900">{selectedPatient.name}</p>
                   <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-2 mb-1">Current Balance</p>
                   <p className="font-black text-xl text-rose-600">${(selectedPatient.balance || 0).toFixed(2)}</p>
                 </div>

                 <div>
                   <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Payment Amount ($)</label>
                   <div className="relative">
                     <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
                     <input 
                       type="number"
                       value={paymentAmount}
                       onChange={e => setPaymentAmount(e.target.value)}
                       className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 pl-8 pr-4 font-black text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                     />
                   </div>
                   {Number(paymentAmount) > (selectedPatient.balance || 0) && (
                     <p className="text-xs text-amber-500 font-medium mt-2">Amount exceeds current balance.</p>
                   )}
                 </div>

                 <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Payment Method</label>
                    <div className="relative">
                      <select 
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="w-full appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="Cash">Cash</option>
                        <option value="EVC Plus">EVC Plus</option>
                        <option value="eDahab">eDahab</option>
                        <option value="Premier Bank">Premier Bank</option>
                        <option value="IBS Bank">IBS Bank</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setSelectedPatient(null)}
                      className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handlePayment}
                      disabled={isProcessing || !paymentAmount}
                      className="flex-[2] px-4 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
                    >
                      {isProcessing ? 'Processing...' : 'Confirm Payment'}
                    </button>
                  </div>
               </div>
             )}
          </div>
        </div>

      </div>

      {showReceipt && receiptData && (
        <DebtReceiptPrint 
          {...receiptData}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
