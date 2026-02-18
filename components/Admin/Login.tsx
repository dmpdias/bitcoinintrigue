
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Bitcoin, Send, ShieldCheck, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Check your email for the login link!' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] p-10">
        <div className="text-center mb-10">
            <div className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Bitcoin size={32} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Command Access</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Intrigue Intelligence Bureau</p>
        </div>

        {message ? (
            <div className={`p-6 border-2 mb-6 animate-fade-in ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <div className="flex items-center gap-3 mb-2">
                    {message.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
                    <span className="font-black uppercase text-xs">{message.type === 'success' ? 'Transmission Sent' : 'Access Denied'}</span>
                </div>
                <p className="text-sm font-serif">{message.text}</p>
                {message.type === 'success' && (
                    <button onClick={() => setMessage(null)} className="mt-4 text-[10px] font-black uppercase underline">Try different email</button>
                )}
            </div>
        ) : (
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Admin Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@bitcoinintrigue.io"
                            className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 focus:border-brand-600 outline-none font-bold transition-all"
                        />
                    </div>
                </div>

                <button 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-black uppercase py-5 flex items-center justify-center gap-3 hover:bg-brand-600 transition-colors shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                    Send Magic Link
                </button>
                
                <p className="text-[9px] text-center text-slate-400 font-serif leading-relaxed px-4">
                    "Access is restricted to authorized personnel only. All login attempts are logged in the sovereign database."
                </p>
            </form>
        )}
      </div>
    </div>
  );
};
