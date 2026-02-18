
import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Rocket, 
  Database, 
  Lock, 
  Globe, 
  Mail, 
  Twitter,
  ArrowRight,
  ExternalLink,
  Zap,
  ShieldCheck,
  Server,
  DatabaseZap
} from 'lucide-react';
import { supabaseConfig } from '../../services/supabaseClient';

export const ProductionChecklist: React.FC = () => {
  const [configView, setConfigView] = useState<string | null>(null);

  const tasks = [
    { 
      id: 'supabase', 
      name: 'Cloud Database', 
      status: 'done', 
      icon: Database, 
      desc: 'Migrate from browser storage to Supabase (Postgres).',
      link: 'https://supabase.com'
    },
    { 
      id: 'auth', 
      name: 'Admin Auth', 
      status: 'pending', 
      icon: Lock, 
      desc: 'Enable secure login for the Command Center.',
      link: 'https://supabase.com/auth'
    },
    { 
      id: 'resend', 
      name: 'Resend API', 
      status: 'pending', 
      icon: Mail, 
      desc: 'Connect your verified domain to fire real emails.',
      link: 'https://resend.com'
    },
    { 
      id: 'twitter', 
      name: 'X API v2', 
      status: 'pending', 
      icon: Twitter, 
      desc: 'Automate thread posting via Twitter Developer Portal.',
      link: 'https://developer.x.com'
    },
    { 
      id: 'domain', 
      name: 'Custom Domain', 
      status: 'warning', 
      icon: Globe, 
      desc: 'Point bitcoinintrigue.io to your Vercel/Netlify host.',
      link: '#'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-600 text-white rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Rocket size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase leading-none">MVP Launch Pad</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Infrastructure Readiness</p>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end">
             <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Launch Score</div>
             <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className={`w-6 h-2 border border-slate-900 ${i === 1 ? 'bg-brand-600' : 'bg-slate-100'}`}></div>
                ))}
             </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {tasks.map((task) => (
              <button 
                key={task.id}
                onClick={() => setConfigView(task.id)}
                className={`w-full flex items-start gap-4 p-4 border-2 transition-all text-left ${configView === task.id ? 'border-brand-600 bg-brand-50' : 'border-slate-50 hover:border-slate-100'}`}
              >
                <div className={`mt-1 ${task.status === 'done' ? 'text-green-500' : task.status === 'warning' ? 'text-amber-500' : 'text-slate-200'}`}>
                  {task.status === 'done' ? <CheckCircle2 size={20} /> : task.status === 'warning' ? <AlertTriangle size={20} /> : <Circle size={20} />}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <task.icon size={14} className="text-slate-400" />
                    <h4 className="font-black uppercase text-xs text-slate-900">{task.name}</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 font-serif mt-1">{task.desc}</p>
                </div>
                <ArrowRight size={14} className="text-slate-300 mt-1" />
              </button>
            ))}
          </div>

          <div className="bg-slate-50 border-2 border-slate-900 p-6 flex flex-col">
            {configView === 'supabase' ? (
                <div className="h-full flex flex-col animate-fade-in">
                    <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
                        <DatabaseZap size={16} className="text-brand-600" /> 
                        Cloud Bridge Active
                    </h3>
                    <div className="space-y-4 flex-grow">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-sm">
                            <p className="text-[10px] font-black uppercase text-green-700 mb-1 flex items-center gap-2">
                                <ShieldCheck size={12} /> Connected to {supabaseConfig.projectId}
                            </p>
                            <p className="text-[9px] text-green-600 leading-relaxed italic">
                                All newsletter issues, AI agent instructions, and subscriber lists are now synchronized with your live Postgres database.
                            </p>
                        </div>
                    </div>
                </div>
            ) : configView ? (
                <div className="h-full flex flex-col animate-fade-in">
                    <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
                        <Zap size={16} className="text-brand-600" /> 
                        {tasks.find(t => t.id === configView)?.name} Setup
                    </h3>
                    <p className="text-xs text-slate-500 font-serif mb-6">This service will be integrated after Phase 1 stabilization.</p>
                    <a 
                        href={tasks.find(t => t.id === configView)?.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="mt-auto flex items-center justify-center gap-2 bg-slate-100 text-slate-900 border border-slate-200 font-black uppercase text-[10px] py-3 hover:bg-white transition-colors"
                    >
                        Visit Service <ExternalLink size={12} />
                    </a>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                    <Server size={48} className="mb-4 text-slate-300" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Select a service to configure production bridge</p>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-slate-900 p-6 flex items-center gap-4">
            <div className="p-2 bg-green-50 text-green-600"><ShieldCheck size={24} /></div>
            <div>
                <div className="text-[10px] font-black uppercase text-slate-400">Storage Mode</div>
                <div className="font-black text-sm uppercase">Cloud Sync</div>
            </div>
        </div>
        <div className="bg-white border-2 border-slate-900 p-6 flex items-center gap-4">
            <div className="p-2 bg-amber-50 text-amber-600"><Lock size={24} /></div>
            <div>
                <div className="text-[10px] font-black uppercase text-slate-400">Admin Security</div>
                <div className="font-black text-sm uppercase">Unsecured (Phase 2)</div>
            </div>
        </div>
        <div className="bg-white border-2 border-slate-900 p-6 flex items-center gap-4">
            <div className="p-2 bg-purple-50 text-purple-600"><Mail size={24} /></div>
            <div>
                <div className="text-[10px] font-black uppercase text-slate-400">Distro Engine</div>
                <div className="font-black text-sm uppercase">Ready</div>
            </div>
        </div>
      </div>
    </div>
  );
};
