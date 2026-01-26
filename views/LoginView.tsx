
import React, { useState } from 'react';
import { Lock, Mail, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { DhoolLogo } from '../components/DhoolLogo';

interface Props {
  onLogin: (email: string, pass: string) => Promise<boolean>;
}

const LoginView: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    attemptLogin(email, password);
  };

  const attemptLogin = async (e: string, p: string) => {
    setIsLoading(true);
    setError('');
    setStatus('Authenticating & Syncing Profile...');
    
    try {
      const success = await onLogin(e, p);
      if (!success) {
        setError('Login failed. Check internet or credentials.');
        setStatus('');
      } else {
        setStatus('Welcome back! Loading Dashboard...');
      }
    } catch (err) {
      setError('Connection failed. Please check your internet.');
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] w-full max-w-md relative z-10 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-white p-3 rounded-2xl shadow-lg mb-4">
            <DhoolLogo className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Dhool Clinic</h1>
          <p className="text-slate-400 font-medium mt-1 text-sm">Secure Clinical Access Terminal</p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-300 text-sm font-bold">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {status && !error && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-300 text-sm font-bold">
            <CheckCircle className="w-5 h-5" />
            {status}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-blue-500 focus:bg-slate-800 transition-all font-bold placeholder:text-slate-600"
                placeholder="admin@dhool.com"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-blue-500 focus:bg-slate-800 transition-all font-bold placeholder:text-slate-600"
                placeholder="••••••••"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Verifying...' : 'Log In'}
            {!isLoading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">
            Emergency / Offline Access:
          </p>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 inline-block w-full">
            <p className="text-emerald-400 text-xs font-mono font-bold">admin@dhool.com</p>
            <p className="text-emerald-400 text-xs font-mono font-bold">admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
