
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, Package, DollarSign, Wallet, Stethoscope, Store, RotateCcw, Plus, Search, Image as ImageIcon, Tag, Percent } from 'lucide-react';
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

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const calculateDiscountValue = () => {
    const sub = calculateSubtotal();
    if (discountType === 'percent') {
      return (sub * (Number(discount) || 0)) / 100;
    }
    return Number(discount) || 0;
  };

  const calculateTotal = () => {
    const sub = calculateSubtotal();
    const discountVal = calculateDiscountValue();
    return Math.max(0, sub - discountVal);
  };

  const handleCheckout = async (method: string) => {
    if (isProcessing || cart.length === 0) return;
    setIsProcessing(true);
    
    const finalTotal = calculateTotal();
    const transactionId = `INV-${Date.now().toString().slice(-6)}`;
    const finalAmount = isRefundMode ? -Math.abs(finalTotal) : finalTotal;
    
    const inv: Invoice = { 
      id: transactionId, 
      patientName: mode === 'services' ? 'Clinical Walk-in' : 'Pharmacy Client', 
      date: new Date().toISOString().split('T')[0], 
      amount: finalAmount, 
      discount: discount, 
      totalPaid: finalAmount, 
      status: isRefundMode ? 'Refunded' : 'Paid', 
      type: mode === 'services' ? 'Dental' : 'Pharmacy', 
      method: method,
      isRefund: isRefundMode 
    };

    const itemsToDeduct = cart.map(c => ({
      id: c.id,
      quantity: isRefundMode ? -c.quantity : c.quantity,
      currentStock: inventory.find(i => i.id === c.id)?.stock || 0
    }));
    
    try {
      const success = await addTransaction(inv, activeTab === 'inventory' ? itemsToDeduct : []);
      if (success) {
          setLastTransaction({ ...inv, items: [...cart], transactionId, total: finalAmount });
          setShowReceipt(true);
          setCart([]); 
          setDiscount(0);
          setIsRefundMode(false);
      }
    } catch (e) {
      alert("Cillad ayaa dhacday!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`h-full flex flex-col lg:flex-row bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden relative transition-all ${isRefundMode ? 'border-rose-400 bg-rose-50/10' : ''}`}>
      {showReceipt && lastTransaction && mode === 'pos' && <InvoiceReceipt {...lastTransaction} t={t} onClose={() => setShowReceipt(false)} />}
      {showReceipt && lastTransaction && mode === 'services' && <InvoiceComponent {...lastTransaction} onClose={() => setShowReceipt(false)} t={t} />}

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white backdrop-blur-xl bg-white/90">
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl ${isRefundMode ? 'bg-rose-600' : (mode === 'services' ? 'bg-emerald-600' : 'bg-blue-600')}`}>
                 {isRefundMode ? <RotateCcw className="w-6 h-6" /> : (mode === 'services' ? <Stethoscope className="w-6 h-6" /> : <Store className="w-6 h-6" />)}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{isRefundMode ? 'Refund Terminal' : (mode === 'services' ? 'Clinical Services' : 'Pharmacy POS')}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isRefundMode ? 'Processing Return' : 'Ready for Transaction'}</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                />
              </div>
              <button onClick={() => setIsRefundMode(!isRefundMode)} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${isRefundMode ? 'bg-rose-600 text-white' : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50'}`}>
                <RotateCcw className="w-4 h-4" /> Refund Mode
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {(activeTab === 'services' ? clinicalServices : inventory)
              .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(item => (
                <div key={item.id} onClick={() => addToCart(item)} className={`bg-white p-6 rounded-[2rem] border border-slate-100 cursor-pointer transition-all hover:shadow-2xl hover:border-blue-500 active:scale-95 group relative overflow-hidden ${(!isRefundMode && (item as Product).stock === 0) ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${activeTab === 'services' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                      {(item as Product).image ? (
                        <img src={(item as Product).image} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        activeTab === 'services' ? <Stethoscope className="w-6 h-6" /> : <Package className="w-6 h-6" />
                      )}
                   </div>
                   <h3 className="font-black text-slate-800 text-sm mb-1 leading-tight">{item.name}</h3>
                   <div className="flex justify-between items-end mt-4">
                      <span className="text-xl font-black text-slate-900">{currency}{item.price}</span>
                      {activeTab === 'inventory' && <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${(item as Product).stock < 10 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>Stock: {(item as Product).stock}</span>}
                   </div>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout Sidebar */}
      <div className="w-full lg:w-[450px] bg-white border-l border-slate-100 flex flex-col shadow-2xl z-10">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Checkout Basket</h3>
           <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-lg ${isRefundMode ? 'bg-rose-600' : 'bg-blue-600'}`}>{cart.length}</div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
               <ShoppingBag className="w-32 h-32 mb-6 stroke-1" />
               <p className="font-black uppercase tracking-[0.2em] text-[10px]">Your basket is empty</p>
             </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-xl">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-blue-600 border border-slate-200 overflow-hidden shadow-sm">
                      {item.image ? (
                        <img src={item.image} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs">x{item.quantity}</div>
                      )}
                    </div>
                    <div>
                       <p className="font-black text-slate-900 text-sm truncate w-32">{item.name}</p>
                       <p className="text-[10px] font-bold text-blue-600">{item.quantity} x {currency}{item.price.toFixed(2)}</p>
                    </div>
                 </div>
                 <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))
          )}
        </div>

        <div className={`p-8 border-t border-slate-200 space-y-6 ${isRefundMode ? 'bg-rose-50/30' : 'bg-slate-50/30'}`}>
          {/* Discount Controls - Now very clearly editable manually */}
          {!isRefundMode && cart.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Tag className="w-3 h-3 text-blue-600" /> Manually Enter Discount
                </span>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setDiscountType('percent')}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${discountType === 'percent' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Percent className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => setDiscountType('flat')}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${discountType === 'flat' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {currency}
                  </button>
                </div>
              </div>
              <div className="relative group">
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={discount === 0 ? '' : discount}
                  onChange={(e) => setDiscount(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder={`Enter ${discountType === 'percent' ? 'percentage %' : 'amount ' + currency}...`}
                  className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-blue-500 py-4 pl-5 pr-14 rounded-2xl outline-none font-black text-base transition-all placeholder:text-slate-300"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-lg pointer-events-none group-focus-within:text-blue-500 transition-colors">
                  {discountType === 'percent' ? '%' : currency}
                </span>
              </div>
              {discount > 0 && (
                <div className="mt-3 px-1 text-[10px] font-bold text-blue-500 italic">
                  Total deduction will be: {currency}{calculateDiscountValue().toFixed(2)}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4 px-2">
             <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                <span>Subtotal</span>
                <span>{currency}{calculateSubtotal().toFixed(2)}</span>
             </div>
             {!isRefundMode && discount > 0 && (
                <div className="flex justify-between items-center text-rose-500 text-xs font-bold uppercase tracking-widest animate-in fade-in">
                   <span>Manual Discount ({discountType === 'percent' ? `${discount}%` : currency})</span>
                   <span>-{currency}{calculateDiscountValue().toFixed(2)}</span>
                </div>
             )}
             <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Grand Total</span>
                <span className={`text-4xl font-black ${isRefundMode ? 'text-rose-600' : 'text-blue-700'}`}>{isRefundMode ? '-' : ''}{currency}{calculateTotal().toFixed(2)}</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => handleCheckout('Cash')} disabled={cart.length === 0 || isProcessing} className="py-5 bg-white border-2 border-slate-200 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm flex flex-col items-center gap-2">
                <DollarSign className="w-5 h-5" /> Cash Payment
             </button>
             <button onClick={() => handleCheckout('EVC-Plus')} disabled={cart.length === 0 || isProcessing} className={`py-5 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all flex flex-col items-center gap-2 ${isRefundMode ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                <Wallet className="w-5 h-5" /> Mobile Money
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSView;
