import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, Phone, User } from 'lucide-react';
import { openWhatsApp, cleanSomaliPhoneNumber } from '../utils/whatsappHelper';

interface WhatsAppModalProps {
  initialPhone: string;
  patientName: string;
  initialMessage: string;
  title?: string;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  initialPhone,
  patientName,
  initialMessage,
  title = "Dir Fariin WhatsApp (Send WhatsApp)",
  onClose
}) => {
  const [phone, setPhone] = useState(initialPhone || '');
  const [message, setMessage] = useState(initialMessage || '');
  const [copied, setCopied] = useState(false);

  const cleanPhone = cleanSomaliPhoneNumber(phone);

  const handleSend = () => {
    if (!message.trim()) return;
    openWhatsApp(phone, message);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[220] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30">
              <MessageSquare className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight">{title}</h3>
              <p className="text-[10px] text-slate-400 font-bold">Dhool WhatsApp Gateway</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                <User className="w-3 h-3" /> Bukaanka (Patient)
              </label>
              <p className="font-black text-sm text-slate-900">{patientName || 'Clinical Walk-in'}</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                <Phone className="w-3 h-3" /> Taleefanka (Phone)
              </label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 061 972 6662"
                className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 font-black text-xs text-slate-900 outline-none focus:border-[#25D366]"
              />
              {cleanPhone && (
                <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
                  Formatted: +{cleanPhone}
                </span>
              )}
            </div>
          </div>

          {/* Editable Message Box */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Qoraalka Fariinta (Message Content)
              </label>
              <button 
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                {copied ? (
                  <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" /> La koobiyeeyay</span>
                ) : (
                  <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Koobi Qoraalka</span>
                )}
              </button>
            </div>
            <textarea 
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 font-medium text-xs text-slate-900 leading-relaxed outline-none focus:border-[#25D366] transition-all resize-none"
              placeholder="Geli fariinta aad rabto inaad u dirto..."
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-2xl transition-all"
            >
              Ka Noqo (Cancel)
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="flex-1 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" /> Dir WhatsApp
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
