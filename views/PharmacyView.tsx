
import React, { useState } from 'react';
import { Package, Search, Plus, Trash2, X, Camera, Image as ImageIcon, Edit2 } from 'lucide-react';
import { Medicine } from '../types';
import { useData } from '../context/DataContext';

const PharmacyView: React.FC = () => {
  const { inventory, addNewMedicine, updateMed, deleteMed } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    stock: '', 
    price: '', 
    expiry: '', 
    category: 'General',
    image: '' 
  });

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
    setFormData({ name: '', stock: '', price: '', expiry: '', category: 'General', image: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (m: Medicine) => {
    setEditingId(m.id);
    setFormData({ 
        name: m.name, 
        stock: m.stock.toString(), 
        price: m.price.toString(), 
        expiry: m.expiryDate, 
        category: m.category, 
        image: m.image || '' 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
        await updateMed(editingId, {
            name: formData.name,
            stock: parseInt(formData.stock),
            price: parseFloat(formData.price),
            expiryDate: formData.expiry,
            category: formData.category,
            image: formData.image
        });
    } else {
        const m: Medicine = {
            id: `MED-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            name: formData.name,
            stock: parseInt(formData.stock),
            price: parseFloat(formData.price),
            expiryDate: formData.expiry,
            category: formData.category,
            image: formData.image
        };
        await addNewMedicine(m);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    await deleteMed(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Farmasiga Dhool</h1>
          <p className="text-slate-500 font-medium">Maamul dawooyinka iyo qalabka caafimaad.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20">
          <Plus className="w-4 h-4" /> New Medication
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl text-sm outline-none transition-all font-bold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Visual</th>
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5">Stock Level</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5">Expiry</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
                      {m.image ? <img src={m.image} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-slate-300" />}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="font-black text-slate-900 text-lg leading-tight">{m.name}</div>
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">{m.category}</div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${m.stock < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${Math.min(100, (m.stock/150)*100)}%`}} />
                      </div>
                      <span className={`font-black text-sm ${m.stock < 10 ? 'text-rose-600' : 'text-slate-700'}`}>{m.stock}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 font-black text-slate-900">${m.price.toFixed(2)}</td>
                  <td className="px-8 py-4">
                    <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.expiryDate}</span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(m)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl relative">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingId ? 'Edit Medicine' : 'Add Medicine'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 relative">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                {formData.image ? <img src={formData.image} className="w-full h-40 object-contain rounded-2xl" /> : <div className="flex flex-col items-center gap-3"><Camera className="w-7 h-7 text-slate-400" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sawirka Daawada</p></div>}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price ($)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px]">
                  {editingId ? 'Update Medicine' : 'Add to Database'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyView;
