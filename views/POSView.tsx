
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, Package, DollarSign, Wallet, Stethoscope, Store, RotateCcw, Plus, Search, Image as ImageIcon, Tag, Percent, ReceiptText, CheckCircle2 } from 'lucide-react';
import { CartItem, ClinicalService, Product, Invoice } from '../types';
import { InvoiceReceipt } from '../components/InvoiceReceipt';
import { Invoice as InvoiceComponent } from '../components/Invoice';
import { useData } from '../context/DataContext';

interface Props {
  currency: string;
  t: (key: string) => string;
  mode?: 'pos' | 'services';
}

const POSView: React.FC<Props> = ({ currency, t, mode = 'pos' }) => {
  const { inventory, clinicalServices, addTransaction } = useData();
  
  const [activeTab, setActiveTab] = useState<'inventory' | 'services'>(mode === 'services' ? 'services' : 'inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [isVatEnabled, setIsVatEnabled] = useState(true); // New state for VAT toggle
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefundMode, setIsRefundMode] = useState(false); 

  useEffect(() => {
    setActiveTab(mode === 'services' ? 'services' : 'inventory');
  }, [mode]);

  const addToCart = (item: Product | ClinicalService) => {
    const isService = activeTab === 'services';
    const product = item as Product;
    
    if (!isService && !isRefundMode && product.stock !== undefined && product.stock <= 0) {
      alert("Xog: Alaabtan ma jirto (Out of stock)");
      return;
    }
    
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      if (!isService && !isRefundMode && product.stock !== undefined && existing.quantity >= product.stock) return;
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { 
        id: item.id, 
        name: item.name, 
        price: item.price, 
        stock: (item as Product).stock ?? 9999, 
        category: (item as Product).category || 'Service', 
        expiryDate: (item as Product).expiryDate || '',
        image: (item as Product).image || '',
        quantity: 1 
      }]);
    }
  };

  const removeFromCart = (id: string) => setCart(cart.filter(i => i.id !== id));
  
  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (activeTab !== 'services' && !isRefundMode && item.stock !== undefined && newQty > item.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const calculateDiscountValue = () => {
    const sub = calculateSubtotal();
    if (discountType === 'percent') {
      return (sub * (Number(discount) || 0)) / 100;
    }
    return Number(discount) || 0;
  };

  const calculateVAT = () => {
    if (!isVatEnabled) return 0; // Return 0 if VAT is toggled off
    const taxableAmount = calculateSubtotal() - calculateDiscountValue();
    return taxableAmount * 0.05; // 5% VAT
  };

  const calculateTotal = () => {
    const net = calculateSubtotal() - calculateDiscountValue();
    return net + calculateVAT();
  };

  const handleCheckout = async (method: string) => {
    if (cart.length === 0 || isProcessing) return;
    setIsProcessing(true);

    const subtotal = calculateSubtotal();
    const disc = calculateDiscountValue();
    const vat = calculateVAT();
    const grandTotal = subtotal - disc + vat;

    const invoice: Invoice = {
      id: `${isRefundMode ? 'REF' : 'INV'}-${Date.now().toString().slice(-8)}`,
      patientName: 'Walk-in Customer',
      date: new Date().toISOString().split('T')[0],
      amount: isRefundMode ? -Math.abs(grandTotal) : grandTotal,
      vat: isRefundMode ? -Math.abs(vat) : vat,
      discount: disc,
      totalPaid: isRefundMode ? -Math.abs(grandTotal) : grandTotal,
      status: 'Paid',
      type: activeTab === 'services' ? 'Dental' : 'Pharmacy',
      method: method,
      isRefund: isRefundMode
    };

    const itemsToDeduct = activeTab === 'services' ? [] : cart.map(item => ({
      id: item.id,
      quantity: isRefundMode ? -item.quantity : item.quantity,
      currentStock: item.stock || 0
    }));

    const success = await addTransaction(invoice, itemsToDeduct);

    if (success) {
      setLastTransaction({ ...invoice, items: [...cart] });
      setShowReceipt(true);
      setCart([]);
      setDiscount(0);
      setIsRefundMode(false);
    } else {
      alert("Checkout failed. Check your connection.");
    }
    setIsProcessing(false);
  };

  const items = activeTab === 'inventory' ? inventory : clinicalServices;
  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      {showReceipt && lastTransaction && (
        lastTransaction.type === 'Pharmacy' 
        ? <InvoiceReceipt 
            items={lastTransaction.items} 
            total={lastTransaction.amount} 
            vat={lastTransaction.vat}
            paidAmount={lastTransaction.totalPaid} 
            date={lastTransaction.date} 
            transactionId={lastTransaction.id} 
            method={lastTransaction.method} 
            onClose={() => setShowReceipt(false)} 
          />
        : <InvoiceComponent 
            items={lastTransaction.items} 
            total={lastTransaction.amount} 
            vat={lastTransaction.vat}
            date={lastTransaction.date} 
            transactionId={lastTransaction.id} 
            method={lastTransaction.method} 
            onClose={() => setShowReceipt(false)} 
            t={t} 
          />
      )}

      {/* Catalog Area */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => { setActiveTab('inventory'); setCart([]); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <Store className="w-4 h-4" /> Pharmacy
            </button>
            <button onClick={() => { setActiveTab('services'); setCart([]); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'services' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <Stethoscope className="w-4 h-4" /> Clinical
            </button>
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl text-xs font-bold outline-none transition-all" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 no-scrollbar">
          {filteredItems.map(item => (
            <button key={item.id} onClick={() => addToCart(item)} className="bg-slate-50 p-4 rounded-3xl border border-transparent hover:border-blue-500 hover:bg-white transition-all text-left flex flex-col h-full group">
               <div className="aspect-square bg-white rounded-2xl mb-4 border border-slate-100 overflow-hidden flex items-center justify-center">
                  {(item as Product).image ? <img src={(item as Product).image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <ImageIcon className="w-8 h-8 text-slate-200" />}
               </div>
               <div className="flex-1">
                 <h4 className="font-black text-slate-900 text-sm leading-tight mb-1 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(item as Product).category || 'Service'}</p>
               </div>
               <div className="mt-4 flex items-center justify-between">
                  <span className="font-black text-slate-900">${item.price.toFixed(2)}</span>
                  {activeTab === 'inventory' && (
                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${(item as Product).stock < 10 ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                      Stock: {(item as Product).stock}
                    </span>
                  )}
               </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-full lg:w-96 bg-slate-900 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-8 flex justify-between items-center">
          <div>
            <h3 className="text-white font-black text-xl tracking-tight">Checkout</h3>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{isRefundMode ? 'Refund Reversal' : 'New Transaction'}</p>
            </div>
          </div>
          <button onClick={() => setIsRefundMode(!isRefundMode)} className={`p-3 rounded-2xl transition-all ${isRefundMode ? 'bg-rose-500 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`} title="Toggle Refund Mode">
             <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 space-y-4 no-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-12">
               <ShoppingBag className="w-16 h-16 text-white mb-4" />
               <p className="text-white font-black uppercase tracking-widest text-xs">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col gap-3">
                 <div className="flex justify-between items-start">
                    <div className="overflow-hidden">
                       <h5 className="text-white font-black text-sm truncate">{item.name}</h5>
                       <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">${item.price.toFixed(2)} / unit</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-600 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                 </div>
                 <div className="flex justify-between items-center">
                    <div className="flex items-center bg-white/5 rounded-xl p-1 gap-4">
                       <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-white hover:bg-white/10">-</button>
                       <span className="text-white font-black text-xs">{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-white hover:bg-white/10">+</button>
                    </div>
                    <span className="text-white font-black text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                 </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-white/5 border-t border-white/5 space-y-4">
          <div className="flex gap-4">
             <div className="flex-1 relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type="number" placeholder="Discount" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold outline-none focus:border-blue-500" />
             </div>
             <button onClick={() => setDiscountType(discountType === 'percent' ? 'flat' : 'percent')} className="px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-blue-400 text-[10px] font-black uppercase tracking-widest">
                {discountType === 'percent' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
             </button>
          </div>

          <div className="space-y-2 py-4">
             <div className="flex justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-rose-400 text-[10px] font-black uppercase tracking-widest">
                <span>Discount</span>
                <span>-${calculateDiscountValue().toFixed(2)}</span>
             </div>
             
             {/* VAT Toggle Control */}
             <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setIsVatEnabled(!isVatEnabled)}
                     className={`w-8 h-4 rounded-full relative transition-all ${isVatEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                   >
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isVatEnabled ? 'left-4.5' : 'left-0.5'}`}></div>
                   </button>
                   <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Apply VAT (5%)</span>
                </div>
                <span className={`text-emerald-400 text-[10px] font-black uppercase tracking-widest ${!isVatEnabled && 'opacity-30'}`}>
                   +${calculateVAT().toFixed(2)}
                </span>
             </div>

             <div className="h-px bg-white/5 my-2"></div>
             <div className="flex justify-between items-center text-white">
                <span className="text-sm font-black uppercase tracking-widest">Grand Total</span>
                <span className="text-3xl font-black">${calculateTotal().toFixed(2)}</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button disabled={cart.length === 0 || isProcessing} onClick={() => handleCheckout('Cash')} className="py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                <Wallet className="w-4 h-4" /> Cash
             </button>
             <button disabled={cart.length === 0 || isProcessing} onClick={() => handleCheckout('EVC-Plus')} className="py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                <ReceiptText className="w-4 h-4" /> EVC-Plus
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSView;
