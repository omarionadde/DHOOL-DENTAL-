
import React, { useState } from 'react';
import { Stethoscope, Search, Plus, Trash2, X, Edit2, DollarSign, Activity } from 'lucide-react';
import { ClinicalService } from '../types';
import { useData } from '../context/DataContext';

const ClinicalServicesView: React.FC = () => {
  const { clinicalServices, addNewService, removeService } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    price: '', 
    category: 'Dental'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const s: ClinicalService = {
        id: `SRV-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category
    };
    await addNewService(s);
    setIsModalOpen(false);
    setFormData({ name: '', price: '', category: 'Dental' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ma hubtaa inaad tirtirto adeegan?')) return;
    await removeService(id);
  };

  const filteredServices = clinicalServices.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Procedures</h1>
          <p className="text-slate-500 font-medium">Add or manage dental treatments and clinical service pricing.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Add New Procedure
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Procedures</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{clinicalServices.length}</h2>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Price</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
            ${clinicalServices.length > 0 
              ? (clinicalServices.reduce((a, b) => a + b.price, 0) / clinicalServices.length).toFixed(2) 
              : '0.00'}
          </h2>
        </div>
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100">
          <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Categories</p>
          <h2 className="text-3xl font-black tracking-tighter">{new Set(clinicalServices.map(s => s.category)).size}</h2>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search procedures or categories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-sm outline-none transition-all font-bold shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Procedure Name</th>
                <th className="px-10 py-6">Category</th>
                <th className="px-10 py-6">Unit Price</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Stethoscope className="w-20 h-20 mb-4" />
                      <p className="font-black uppercase tracking-widest text-xs">No services found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredServices.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-lg leading-tight">{s.name}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {s.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-10 py-6 font-black text-slate-900 text-xl">${s.price.toFixed(2)}</td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2">
                          <button onClick={() => handleDelete(s.id)} className="p-4 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-[1.5rem] transition-all">
                              <Trash2 className="w-5 h-5" />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl relative">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">New Procedure</h2>
                <p className="text-slate-500 font-medium text-sm">Define clinical service and pricing.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Service Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all border border-transparent focus:border-blue-500" placeholder="e.g. Tooth Extraction" />
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold text-sm appearance-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all border border-transparent focus:border-blue-500">
                    <option value="Dental">Dental</option>
                    <option value="Surgical">Surgical</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Imaging">Imaging</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Base Price ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all border border-transparent focus:border-blue-500" placeholder="0.00" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all">
                    Register Procedure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalServicesView;
