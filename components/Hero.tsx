
import React, { useState } from 'react';
import { Award, Star, Inbox, Clock, Battery, Wifi, Bitcoin, Menu, Check, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';

export const Hero: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
        setStatus('error');
        return;
    }
    
    setStatus('loading');
    try {
      await storageService.saveSubscriber({
        email: email,
        status: 'active',
        source: 'homepage_hero'
      });
      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const companies = [
    { name: "Apple", style: "font-semibold" },
    { name: "Google", style: "font-bold" },
    { name: "Whole Foods", style: "font-serif italic" },
    { name: "AIRBNB", style: "font-black tracking-widest uppercase" },
    { name: "Tesla", style: "font-bold tracking-wider" },
    { name: "Coinbase", style: "font-sans font-black text-brand-700" },
    { name: "Amazon", style: "font-bold" },
    { name: "Microsoft", style: "font-semibold" },
    { name: "Nvidia", style: "font-black uppercase" },
    { name: "Meta", style: "font-bold tracking-tight" },
  ];

  const marqueeList = [...companies, ...companies];

  return (
    <section className="relative pt-2 xs:pt-3 sm:pt-6 md:pt-8 lg:pt-20 pb-4 xs:pb-5 sm:pb-8 md:pb-8 lg:pb-12 overflow-hidden bg-paper">
      <div className="max-w-[1400px] mx-auto px-2 xs:px-3 sm:px-6 lg:px-8">

        <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-5 md:gap-6 lg:gap-8 items-start lg:items-center">

          {/* Content Column - Always First */}
          <div className="flex flex-col items-start text-left z-10 order-1 pt-0 min-w-0">
            <div className="mb-1.5 xs:mb-2 sm:mb-3 md:mb-4 lg:mb-6 inline-block">
                <span className="font-bold text-slate-900 text-[7px] xs:text-[8px] sm:text-xs md:text-sm lg:text-lg tracking-tight border-b-2 border-dotted border-slate-200 pb-0.5 leading-tight">
                    YOU BOUGHT BITCOIN. NOW WHAT?
                </span>
            </div>

            <h1 className="font-sans font-black text-[1.25rem] xs:text-xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl text-slate-900 mb-1.5 xs:mb-2 sm:mb-4 md:mb-6 lg:mb-8 leading-[0.85] xs:leading-[0.85] tracking-tighter uppercase animate-slide-up">
              Bitcoin. <br/> Translated. <br className="hidden xs:block"/> For Humans.
            </h1>

            <p className="text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-slate-800 font-medium mb-2.5 xs:mb-3 sm:mb-6 md:mb-8 lg:mb-8 leading-snug sm:leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              Every day, we tell you exactly what's happening — in plain English, no charts, no jargon.
            </p>

            <div className="w-full animate-fade-in z-20 flex-shrink-0" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
                {status === 'success' ? (
                    <div className="flex h-9 xs:h-10 sm:h-12 md:h-14 items-center px-3 xs:px-4 sm:px-6 bg-brand-50 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] xs:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] sm:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm w-full animate-fade-in">
                        <Check className="text-brand-600 mr-2 xs:mr-2.5 sm:mr-3 shrink-0" size={18} />
                        <span className="font-black text-slate-900 text-[9px] xs:text-[10px] sm:text-sm md:text-base uppercase tracking-wide line-clamp-1">Thanks for subscribing!</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 xs:gap-2 sm:gap-2 w-full">
                        <div className={`flex h-9 xs:h-10 sm:h-12 md:h-14 border-2 bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] xs:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] sm:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[3px_3px_0px_0px_rgba(234,88,12,1)] xs:hover:shadow-[4px_4px_0px_0px_rgba(234,88,12,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(234,88,12,1)] focus-within:border-brand-600 transition-all duration-300 rounded-sm overflow-hidden ${status === 'error' ? 'border-red-500' : 'border-slate-900'}`}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if(status === 'error') setStatus('idle');
                                }}
                                disabled={status === 'loading'}
                                placeholder="your@email.com"
                                className="flex-grow px-2 xs:px-3 sm:px-4 h-full bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-350 text-[10px] xs:text-xs sm:text-sm md:text-base min-w-0"
                            />
                            <button type="submit" disabled={status === 'loading'} className="bg-brand-600 hover:bg-brand-700 text-white font-black uppercase text-[9px] xs:text-xs sm:text-sm lg:text-base px-3 xs:px-4 sm:px-6 md:px-8 h-full transition-colors whitespace-nowrap flex items-center justify-center shrink-0 gap-1">
                                {status === 'loading' ? (
                                    <div className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="hidden xs:inline">Subscribe</span>
                                        <span className="xs:hidden">Go</span>
                                        <span className="hidden xs:inline">→</span>
                                    </>
                                )}
                            </button>
                        </div>
                        {status === 'error' && (
                            <p className="text-red-600 text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-bold flex items-center gap-1 animate-fade-in leading-tight">
                                <AlertCircle size={11} className="shrink-0 flex-none" />
                                <span>Check your email and try again.</span>
                            </p>
                        )}
                    </form>
                )}

                {status !== 'success' && (
                    <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-tight mt-2 xs:mt-2.5 sm:mt-3 flex items-center gap-1 leading-tight">
                    <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-green-500 rounded-full animate-pulse shrink-0 flex-none"></span>
                    <span>No spam. Unsubscribe anytime.</span>
                    </p>
                )}
            </div>
          </div>

          {/* Image Column - Responsive sizing */}
          <div className="relative w-full h-[160px] xs:h-[180px] sm:h-[280px] md:h-[350px] lg:h-[500px] xl:h-[600px] flex items-center justify-center lg:justify-end z-0 order-2">
            {/* Illustration - Responsive */}
            <div className="relative w-full h-full flex items-center justify-center px-1 xs:px-1.5 sm:px-0">
              <img
                src="/avatars/replicate-prediction-ce00rqqqehrmw0cwesmaaknxq8-removebg-preview.png"
                alt="Person reading Bitcoin Intrigue with coffee and phone"
                className="w-full h-full object-contain drop-shadow-lg sm:drop-shadow-xl rounded-sm sm:rounded-lg"
              />
            </div>

          </div>
        </div>

        <div className="mt-6 sm:mt-10 md:mt-16 lg:mt-20 pt-4 sm:pt-6 md:pt-8 lg:pt-10 border-t border-slate-300">
            <div className="flex flex-col items-center md:flex-row md:items-center gap-2 md:gap-12 lg:gap-16 overflow-hidden">
                <span className="font-bold text-slate-900 text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap z-10 bg-paper md:pr-4 text-center md:text-left">
                    Read by 1,000+ people who just wanted to understand what they bought.
                </span>
                <div className="flex-grow overflow-hidden relative w-full mask-gradient">
                    <div className="flex animate-scroll whitespace-nowrap gap-8 md:gap-12 items-center opacity-60 grayscale w-max">
                        {marqueeList.map((company, index) => (
                            <div key={index} className={`text-xs sm:text-sm md:text-base lg:text-xl text-slate-700 ${company.style}`}>
                                {company.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};
