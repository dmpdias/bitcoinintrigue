
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
    <section className="relative pt-3 xs:pt-4 sm:pt-8 md:pt-16 lg:pt-20 pb-6 md:pb-8 lg:pb-12 overflow-hidden bg-paper">
      <div className="max-w-[1400px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-2 xs:gap-3 sm:gap-5 md:gap-6 lg:gap-8 items-center">

          <div className="w-full lg:col-span-6 order-1 lg:order-2 relative h-[220px] xs:h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center lg:justify-end z-0 mt-4 xs:mt-2 sm:mt-0 lg:mt-0">
            {/* Illustration - Mobile optimized */}
            <div className="relative w-full h-full max-w-sm lg:max-w-none flex items-center justify-center px-2 xs:px-0">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1200&auto=format&fit=crop"
                alt="Person reading Bitcoin Intrigue with coffee and phone"
                className="w-full h-full object-contain drop-shadow-xl rounded-lg"
              />
            </div>

            {/* Zero Jargon Badge - Mobile optimized position */}
            <div className="absolute bottom-6 right-4 xs:bottom-8 xs:right-6 sm:bottom-10 sm:right-8 md:bottom-12 md:right-10 lg:bottom-auto lg:top-1/3 lg:right-[-40px] lg:transform lg:-translate-y-1/2 bg-white border-2 border-slate-900 rounded-full w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 flex items-center justify-center z-30 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] xs:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-float">
                <div className="text-center">
                    <Award size={12} className="mx-auto mb-0.5 text-slate-900 xs:w-3 xs:h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                    <div className="font-black text-[6px] xs:text-[7px] sm:text-[8px] md:text-[10px] lg:text-xs leading-none uppercase">Zero<br/>Jargon</div>
                </div>
            </div>
          </div>
          
          <div className="w-full lg:col-span-6 flex flex-col items-start text-left z-10 order-2 lg:order-1 mt-0 lg:mt-0">
            <div className="mb-2 md:mb-4 lg:mb-6 inline-block">
                <span className="font-bold text-slate-900 text-[11px] sm:text-sm md:text-base lg:text-lg tracking-tight border-b-2 border-dotted border-slate-400 pb-0.5">
                    FOR ANYONE WHO BOUGHT BITCOIN AND ISN'T SURE WHAT HAPPENS NEXT
                </span>
            </div>

            <h1 className="font-sans font-black text-[1.75rem] xs:text-3xl sm:text-5xl md:text-6xl xl:text-7xl text-slate-900 mb-2 xs:mb-3 sm:mb-5 md:mb-6 lg:mb-8 leading-[0.95] xs:leading-[0.9] tracking-tighter uppercase animate-slide-up">
              Bitcoin. <br className="hidden xs:block"/> Translated <br className="hidden xs:block"/> for humans.
            </h1>

            <p className="text-[13px] xs:text-sm sm:text-base md:text-lg lg:text-xl text-slate-800 font-medium mb-3 xs:mb-4 sm:mb-6 lg:mb-8 max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              You bought some. Now what? Every day, we tell you exactly what's happening — in plain English, no charts, no jargon.
            </p>

            <div className="w-full animate-fade-in z-20" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
                {status === 'success' ? (
                    <div className="flex h-10 sm:h-12 md:h-14 items-center px-4 sm:px-6 bg-brand-50 border border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] sm:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm max-w-lg animate-fade-in">
                        <Check className="text-brand-600 mr-2 sm:mr-3 shrink-0" size={20} />
                        <span className="font-black text-slate-900 text-[10px] sm:text-sm md:text-base uppercase tracking-wide">Thanks for subscribing!</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-lg w-full">
                        <div className={`flex h-10 sm:h-12 md:h-14 border bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] sm:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[3px_3px_0px_0px_rgba(234,88,12,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(234,88,12,1)] transition-shadow duration-300 rounded-sm overflow-hidden ${status === 'error' ? 'border-red-500' : 'border-slate-900'}`}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if(status === 'error') setStatus('idle');
                                }}
                                disabled={status === 'loading'}
                                placeholder="your@email.com"
                                className="flex-grow px-2.5 sm:px-4 h-full bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm md:text-base min-w-0"
                            />
                            <button type="submit" disabled={status === 'loading'} className="bg-brand-600 hover:bg-brand-700 text-white font-black uppercase text-[9px] sm:text-xs md:text-sm lg:text-base px-3 sm:px-5 md:px-8 h-full transition-colors whitespace-nowrap flex items-center justify-center shrink-0">
                                {status === 'loading' ? <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="hidden xs:inline">Read Today's Story</span>}
                                {!status || status === 'loading' ? null : (status === 'loading' ? null : <span className="xs:hidden">Read</span>)}
                            </button>
                        </div>
                        {status === 'error' && (
                            <p className="text-red-600 text-[9px] sm:text-[10px] md:text-xs font-bold flex items-center gap-1 animate-fade-in">
                                <AlertCircle size={12} className="shrink-0" />
                                <span>Check your email and try again.</span>
                            </p>
                        )}
                    </form>
                )}

                {status !== 'success' && (
                    <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-900 uppercase tracking-wide mt-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0"></span>
                    <span>No Spam. No Noise. Unsubscribe Any Time.</span>
                    </p>
                )}
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
