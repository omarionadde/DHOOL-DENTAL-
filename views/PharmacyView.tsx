import React, { useState, useMemo } from 'react';
import { 
  Package, Search, Plus, Trash2, X, Camera, Image as ImageIcon, 
  Edit2, AlertTriangle, AlertCircle, Clock, CheckCircle2, 
  FileSpreadsheet, MessageSquare, Truck, DollarSign, TrendingUp, Filter, ShieldAlert
} from 'lucide-react';
import { Medicine, Supplier } from '../types';
import { useData } from '../context/DataContext';
import { WhatsAppModal } from '../components/WhatsAppModal';
import { getSupplierReorderWhatsAppMessage } from '../utils/whatsappHelper';
import { exportMedicineStockToExcel } from '../utils/excelExporter';

const PharmacyView: React.FC = () => {
  const { inventory, suppliers, addNewMedicine, updateMed, deleteMed } = useData();

  // Active Tab: 'inventory' | 'expiry' | 'low-stock' | 'valuation'
  const [activeTab, setActiveTab] = useState<'inventory' | 'expiry' | 'low-stock' | 'valuation'>('inventory');

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // WhatsApp Supplier Reorder State
  const [whatsAppData, setWhatsAppData] = useState<{ phone: string; patientName: string; message: string; title: string } | null>(null);
  const [reorderMed, setReorderMed] = useState<Medicine | null>(null);
  const [reorderQuantity, setReorderQuantity] = useState(50);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');

  const [formData, setFormData] = useState({ 
    name: '', 
    stock: '', 
    price: '', 
    costPrice: '',
    expiry: '', 
    category: 'General',
    supplierId: '',
    image: '' 
  });

  const now = new Date();

  // Expiry & Stock Calculations
  const analyzedInventory = useMemo(() => {
    return inventory.map(m => {
      let expiryStatus: 'expired' | 'critical' | 'warning' | 'valid' = 'valid';
      let daysRemaining = 9999;

      if (m.expiryDate) {
        const exp = new Date(m.expiryDate);
        daysRemaining = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysRemaining < 0) {
          expiryStatus = 'expired';
        } else if (daysRemaining <= 30) {
          expiryStatus = 'critical';
        } else if (daysRemaining <= 90) {
          expiryStatus = 'warning';
        } else {
          expiryStatus = 'valid';
        }
      }

      const isLowStock = m.stock <= 10;
      const isOutOfStock = m.stock <= 0;

      return {
        ...m,
        expiryStatus,
        daysRemaining,
        isLowStock,
        isOutOfStock
      };
    });
  }, [inventory]);

  // Key KPI numbers
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const totalUnits = inventory.reduce((sum, m) => sum + (m.stock || 0), 0);
    const expiredCount = analyzedInventory.filter(m => m.expiryStatus === 'expired').length;
    const expiringSoonCount = analyzedInventory.filter(m => m.expiryStatus === 'critical' || m.expiryStatus === 'warning').length;
    const lowStockCount = analyzedInventory.filter(m => m.isLowStock).length;
    const totalCostValue = inventory.reduce((sum, m) => sum + (m.stock * (m.costPrice || m.price * 0.7)), 0);
    const totalRetailValue = inventory.reduce((sum, m) => sum + (m.stock * m.price), 0);
    const potentialProfit = Math.max(0, totalRetailValue - totalCostValue);

    return {
      totalItems,
      totalUnits,
      expiredCount,
      expiringSoonCount,
      lowStockCount,
      totalCostValue,
      totalRetailValue,
      potentialProfit
    };
  }, [inventory, analyzedInventory]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    inventory.forEach(m => { if (m.category) set.add(m.category); });
    return Array.from(set);
  }, [inventory]);

  // Filtered Inventory based on active tab & search
  const displayedItems = useMemo(() => {
    let items = analyzedInventory;

    if (activeTab === 'expiry') {
      items = items.filter(m => m.expiryStatus === 'expired' || m.expiryStatus === 'critical' || m.expiryStatus === 'warning');
      // Sort: Expired first, then critical, then warning
      items.sort((a, b) => a.daysRemaining - b.daysRemaining);
    } else if (activeTab === 'low-stock') {
      items = items.filter(m => m.isLowStock);
      // Sort: lowest stock first
      items.sort((a, b) => a.stock - b.stock);
    }

    if (categoryFilter !== 'all') {
      items = items.filter(m => m.category === categoryFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || m.id.toLowerCase().includes(q));
    }

    return items;
  }, [analyzedInventory, activeTab, categoryFilter, searchTerm]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
      name: '', 
      stock: '', 
      price: '', 
      costPrice: '',
      expiry: '', 
      category: 'General', 
      supplierId: suppliers[0]?.id || '',
      image: '' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (m: Medicine) => {
    setEditingId(m.id);
    setFormData({ 
      name: m.name, 
      stock: m.stock.toString(), 
      price: m.price.toString(), 
      costPrice: m.costPrice ? m.costPrice.toString() : (m.price * 0.7).toFixed(2),
      expiry: m.expiryDate, 
      category: m.category, 
      supplierId: m.supplierId || '',
      image: m.image || '' 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      await updateMed(editingId, {
        name: formData.name,
        stock: parseInt(formData.stock) || 0,
        price: parseFloat(formData.price) || 0,
        costPrice: parseFloat(formData.costPrice) || 0,
        expiryDate: formData.expiry,
        category: formData.category,
        supplierId: formData.supplierId,
        image: formData.image
      });
    } else {
      const m: Medicine = {
        id: `MED-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        name: formData.name,
        stock: parseInt(formData.stock) || 0,
        price: parseFloat(formData.price) || 0,
        costPrice: parseFloat(formData.costPrice) || 0,
        expiryDate: formData.expiry,
        category: formData.category,
        supplierId: formData.supplierId,
        image: formData.image
      };
      await addNewMedicine(m);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMed(id);
    setDeleteConfirm(null);
  };

  // Launch WhatsApp Reorder Modal to Supplier
  const handleOpenReorderModal = (med: Medicine) => {
    setReorderMed(med);
    setReorderQuantity(50);
    const assignedSupplier = suppliers.find(s => s.id === med.supplierId) || suppliers[0];
    setSelectedSupplierId(assignedSupplier?.id || '');

    const message = getSupplierReorderWhatsAppMessage({
      supplierName: assignedSupplier?.name || 'Alaab-qeybiye',
      medicineName: med.name,
      currentStock: med.stock,
      requestedQuantity: 50
    });

    setWhatsAppData({
      phone: assignedSupplier?.phone || '',
      patientName: assignedSupplier?.name || 'Supplier',
      message,
      title: `Dalab Dawo - ${med.name}`
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Farmasiga & Stock-ga (Pharmacy & Inventory)</h1>
              <p className="text-slate-500 font-medium text-sm">Maamulka dawooyinka, digniinta dhicitaanka (Expiry Alerts), iyo dalbashada stock-ga yar.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Excel Export buttons */}
          <button
            onClick={() => exportMedicineStockToExcel(displayedItems, activeTab === 'expiry' ? 'expired' : activeTab === 'low-stock' ? 'low-stock' : 'all')}
            className="flex items-center gap-2 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            title="Dhoofso Excel Warbixinta Dawooyinka"
          >
            <FileSpreadsheet className="w-4 h-4" /> Dhoofso Excel
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Ku dar Dawo Cusub
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Medicines */}
        <div 
          onClick={() => setActiveTab('inventory')}
          className={`p-6 rounded-3xl border shadow-sm transition-all cursor-pointer ${
            activeTab === 'inventory' ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20' : 'bg-white border-slate-200/80 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Medications</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mt-3">{stats.totalItems}</h3>
          <p className="text-[11px] font-bold text-slate-500 mt-1">{stats.totalUnits} xabbo oo stock ah</p>
        </div>

        {/* Expired / Expiring Alert Card */}
        <div 
          onClick={() => setActiveTab('expiry')}
          className={`p-6 rounded-3xl border shadow-sm transition-all cursor-pointer ${
            activeTab === 'expiry' ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-500/20' : 'bg-white border-slate-200/80 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-rose-600">Digniinta Dhicitaanka</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <h3 className="text-3xl font-black text-rose-600">{stats.expiredCount}</h3>
            <span className="text-xs font-bold text-rose-600">dhacay</span>
            <span className="text-xs font-bold text-slate-400">/</span>
            <span className="text-sm font-black text-amber-600">{stats.expiringSoonCount}</span>
            <span className="text-xs font-bold text-amber-600">dhacaya</span>
          </div>
          <p className="text-[11px] font-bold text-rose-600 mt-1">Guji si aad u aragto kuwa dhacay</p>
        </div>

        {/* Low Stock Alert Card */}
        <div 
          onClick={() => setActiveTab('low-stock')}
          className={`p-6 rounded-3xl border shadow-sm transition-all cursor-pointer ${
            activeTab === 'low-stock' ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-500/20' : 'bg-white border-slate-200/80 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600">Stock-ga Yar (&lt; 10)</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-amber-700 mt-3">{stats.lowStockCount}</h3>
          <p className="text-[11px] font-bold text-amber-600 mt-1">U baahan dib-u-dalbasho degdeg ah</p>
        </div>

        {/* Total Stock Valuation */}
        <div 
          onClick={() => setActiveTab('valuation')}
          className={`p-6 rounded-3xl border shadow-sm transition-all cursor-pointer ${
            activeTab === 'valuation' ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200/80 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Qiimaha Stock-ga ($)</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-emerald-700 mt-3">${stats.totalRetailValue.toFixed(2)}</h3>
          <p className="text-[11px] font-bold text-emerald-600 mt-1">Qiimaha iibka guud ee hadda yaalla</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" /> Dhammaan Daawooyinka ({inventory.length})
        </button>

        <button
          onClick={() => setActiveTab('expiry')}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'expiry'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Daawooyinka Dhacaya & Dhacay ({stats.expiredCount + stats.expiringSoonCount})
        </button>

        <button
          onClick={() => setActiveTab('low-stock')}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'low-stock'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'text-amber-700 hover:bg-amber-50'
          }`}
        >
          <Clock className="w-4 h-4" /> Stock-ga Go'aya & Dalbashada ({stats.lowStockCount})
        </button>

        <button
          onClick={() => setActiveTab('valuation')}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'valuation'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Qiimaynta & Faa'iidada
        </button>
      </div>

      {/* Valuation Summary Card when tab is active */}
      {activeTab === 'valuation' && (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl animate-in fade-in">
          <h3 className="text-xl font-black tracking-tight mb-2 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-400" /> Xisaabinta Qiimaha Guud ee Stock-ga (Inventory Valuation)
          </h3>
          <p className="text-slate-300 text-xs font-medium max-w-2xl mb-6">
            Kani waa qiimaynta maaliyadeed ee dhammaan dawooyinka iyo qalabka yaalla farmasiga, qiimaha soo iibsiga, iyo faa'iidada la filayo marka la iibiyo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Cost Investment</span>
              <h4 className="text-2xl font-black text-white mt-1">${stats.totalCostValue.toFixed(2)}</h4>
              <p className="text-[10px] text-slate-400 mt-1">Lacagta ku baxeysa soo iibsiga</p>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Total Retail Value</span>
              <h4 className="text-2xl font-black text-emerald-400 mt-1">${stats.totalRetailValue.toFixed(2)}</h4>
              <p className="text-[10px] text-slate-400 mt-1">Wadarta lacagta laga helayo iibka</p>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400">Projected Gross Profit</span>
              <h4 className="text-2xl font-black text-indigo-400 mt-1">${stats.potentialProfit.toFixed(2)}</h4>
              <p className="text-[10px] text-slate-400 mt-1">Faa'iidada guud ee la filayo ({stats.totalCostValue > 0 ? ((stats.potentialProfit / stats.totalCostValue) * 100).toFixed(1) : 0}%)</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Raadi magaca daawada, qaybta ama ID-ga..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl font-black text-xs text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">Dhammaan Qaybaha</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Sawir</th>
                <th className="py-4 px-6">Magaca Daawada</th>
                <th className="py-4 px-6">Stock Level</th>
                <th className="py-4 px-6">Qiimaha Iibka</th>
                <th className="py-4 px-6">Soo Iibsiga (Cost)</th>
                <th className="py-4 px-6">Dhicitaanka (Expiry)</th>
                <th className="py-4 px-6 text-right">Hawlaha (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 font-bold">
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    Wax dawooyin ah lagama helin shaxdan.
                  </td>
                </tr>
              ) : (
                displayedItems.map((m) => {
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Visual */}
                      <td className="py-4 px-6">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {m.image ? (
                            <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                      </td>

                      {/* Name & Category */}
                      <td className="py-4 px-6">
                        <div className="font-black text-slate-900 text-base leading-tight">{m.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {m.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            #{m.id}
                          </span>
                        </div>
                      </td>

                      {/* Stock Level with Progress Bar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${m.stock <= 0 ? 'bg-slate-300' : m.stock <= 10 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${Math.min(100, (m.stock / 100) * 100)}%` }} 
                            />
                          </div>
                          <span className={`font-black text-sm ${m.stock <= 0 ? 'text-rose-600 font-black' : m.stock <= 10 ? 'text-amber-600 font-black' : 'text-slate-800'}`}>
                            {m.stock}
                          </span>
                        </div>
                        {m.stock <= 10 && (
                          <span className="inline-block mt-1 text-[10px] font-black text-rose-600 uppercase tracking-widest">
                            {m.stock <= 0 ? 'Out of Stock' : 'Low Stock'}
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 font-black text-slate-900">
                        ${m.price.toFixed(2)}
                      </td>

                      {/* Cost */}
                      <td className="py-4 px-6 text-xs font-bold text-slate-500">
                        ${m.costPrice ? m.costPrice.toFixed(2) : (m.price * 0.7).toFixed(2)}
                      </td>

                      {/* Expiry Badge */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className="font-mono text-xs font-black text-slate-700 block">
                            {m.expiryDate || 'N/A'}
                          </span>
                          {m.expiryStatus === 'expired' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                              <AlertTriangle className="w-3 h-3" /> Dhacay ({Math.abs(m.daysRemaining)}d)
                            </span>
                          )}
                          {m.expiryStatus === 'critical' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                              <Clock className="w-3 h-3" /> Dhacaya ({m.daysRemaining}d)
                            </span>
                          )}
                          {m.expiryStatus === 'warning' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                              <Clock className="w-3 h-3" /> {m.daysRemaining} maalmood
                            </span>
                          )}
                          {m.expiryStatus === 'valid' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                              ✓ Valid
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reorder from Supplier via WhatsApp */}
                          <button
                            onClick={() => handleOpenReorderModal(m)}
                            className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Ka dalbo Alaab-qeybiye (WhatsApp Reorder)"
                          >
                            <Truck className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Wax ka beddel"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          {deleteConfirm === m.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-2xl border border-rose-100">
                              <button
                                onClick={() => handleDelete(m.id)}
                                className="px-2.5 py-1 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-rose-700"
                              >
                                Hubi
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2.5 py-1 text-slate-500 hover:text-slate-700 text-[10px] font-black uppercase tracking-wider"
                              >
                                Maya
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(m.id)}
                              className="p-2 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Tirtir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MEDICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingId ? 'Wax ka beddel Daawada' : 'Ku dar Dawo Cusub'}
                </h3>
                <p className="text-xs font-bold text-slate-400">Geli macluumaadka buuxa ee daawada ama qalabka</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Magaca Daawada (Medicine Name) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tusaale: Amoxicillin 500mg, Paracetamol..."
                  className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                />
              </div>

              {/* Category & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Qaybta (Category)
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Antibiotics, Painkiller..."
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Stock Level (Tirada Yaalla) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="100"
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Price & Cost Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Qiimaha Iibka / Retail ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="5.00"
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Qiimaha Soo Iibsiga / Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={e => setFormData(prev => ({ ...prev, costPrice: e.target.value }))}
                    placeholder="3.50"
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Expiry Date & Supplier */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Taariikhda Dhicitaanka (Expiry) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiry}
                    onChange={e => setFormData(prev => ({ ...prev, expiry: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Alaab-qeybiye (Supplier)
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={e => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-sm text-slate-800 outline-none"
                  >
                    <option value="">-- Dooro Supplier --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Sawirka Daawada
                </label>
                <div className="flex items-center gap-4">
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="w-14 h-14 object-cover rounded-xl border border-slate-200" />
                  )}
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-3.5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-100 transition-all font-bold text-xs text-slate-600">
                    <Camera className="w-4 h-4 text-slate-400" /> Dooro Sawir
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
              >
                {editingId ? 'Keydi Wax Ka Beddelka' : 'Keydi Daawada'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP SUPPLIER REORDER MODAL */}
      {whatsAppData && (
        <WhatsAppModal
          isOpen={true}
          phone={whatsAppData.phone}
          patientName={whatsAppData.patientName}
          defaultMessage={whatsAppData.message}
          title={whatsAppData.title}
          onClose={() => setWhatsAppData(null)}
        />
      )}
    </div>
  );
};

export default PharmacyView;
