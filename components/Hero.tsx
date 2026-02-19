
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
    <section className="relative min-h-screen flex flex-col justify-between pt-4 xs:pt-6 sm:pt-8 md:pt-16 lg:pt-20 pb-6 xs:pb-8 sm:pb-10 md:pb-12 lg:pb-16 overflow-hidden bg-paper">
      <div className="max-w-[1400px] mx-auto w-full px-2 xs:px-3 sm:px-6 lg:px-8 flex flex-col flex-grow">

        <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-5 md:gap-6 lg:gap-8 items-start lg:items-center flex-grow">

          {/* Content Column - Always First */}
          <div className="flex flex-col items-start text-left z-10 order-1 pt-0 min-w-0 justify-center">

            <h1 className="font-sans font-black text-[1.5rem] xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-slate-900 mb-3 xs:mb-4 sm:mb-6 md:mb-8 lg:mb-10 leading-[0.8] tracking-tighter uppercase animate-slide-up">
              Bitcoin.<br/> Translated.<br className="hidden xs:block"/> For Humans.
            </h1>

            <p className="text-[12px] xs:text-sm sm:text-base md:text-lg lg:text-xl text-slate-800 font-medium mb-1.5 xs:mb-2 sm:mb-3 leading-snug sm:leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              No jargon. No hype. Just clarity.
            </p>

            <p className="text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-slate-700 font-normal mb-4 xs:mb-5 sm:mb-8 md:mb-10 lg:mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
              Every day, we explain exactly what's happening in crypto. Plain English. No charts. No jargon.
            </p>

            <div className="w-full animate-fade-in z-20 flex-shrink-0" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
                {status === 'success' ? (
                    <div className="flex h-10 xs:h-11 sm:h-13 md:h-14 lg:h-16 items-center px-3 xs:px-4 sm:px-6 md:px-8 bg-brand-50 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] xs:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] sm:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] rounded-sm w-full animate-fade-in">
                        <Check className="text-brand-600 mr-2 xs:mr-3 sm:mr-4 shrink-0" size={22} />
                        <span className="font-black text-slate-900 text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg uppercase tracking-wide line-clamp-1">Thanks for subscribing! Check your inbox.</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2 xs:gap-2.5 sm:gap-3 w-full">
                        <div className={`flex h-10 xs:h-11 sm:h-13 md:h-14 lg:h-16 border-2 bg-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] xs:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] sm:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] hover:shadow-[4px_4px_0px_0px_rgba(234,88,12,1)] xs:hover:shadow-[5px_5px_0px_0px_rgba(234,88,12,1)] sm:hover:shadow-[7px_7px_0px_0px_rgba(234,88,12,1)] focus-within:ring-2 focus-within:ring-brand-400 focus-within:ring-offset-2 transition-all duration-200 rounded-sm overflow-hidden ${status === 'error' ? 'border-red-500' : 'border-slate-900'}`}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if(status === 'error') setStatus('idle');
                                }}
                                disabled={status === 'loading'}
                                placeholder="your@email.com"
                                className="flex-grow px-3 xs:px-4 sm:px-5 md:px-6 h-full bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg font-medium min-w-0"
                            />
                            <button type="submit" disabled={status === 'loading'} className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-black uppercase text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg px-4 xs:px-5 sm:px-7 md:px-10 h-full transition-all whitespace-nowrap flex items-center justify-center shrink-0 gap-1.5 sm:gap-2">
                                {status === 'loading' ? (
                                    <div className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="hidden xs:inline">Get Today's</span>
                                        <span className="xs:hidden">Start</span>
                                        <span className="hidden sm:inline">Story</span>
                                        <span className="hidden xs:inline">→</span>
                                    </>
                                )}
                            </button>
                        </div>
                        {status === 'error' && (
                            <p className="text-red-600 text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-bold flex items-center gap-1.5 animate-fade-in leading-tight">
                                <AlertCircle size={14} className="shrink-0 flex-none" />
                                <span>Check your email and try again.</span>
                            </p>
                        )}
                    </form>
                )}

                {status !== 'success' && (
                    <p className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-semibold text-slate-600 tracking-tight mt-2.5 xs:mt-3 sm:mt-4 flex items-center gap-1.5 leading-tight">
                    <span className="w-2 h-2 xs:w-2 xs:h-2 bg-green-500 rounded-full animate-pulse shrink-0 flex-none"></span>
                    <span>No spam. Unsubscribe anytime.</span>
                    </p>
                )}
            </div>
          </div>

          {/* Image Column - Responsive sizing */}
          <div className="relative w-full h-[200px] xs:h-[240px] sm:h-[320px] md:h-[400px] lg:h-[500px] xl:h-[600px] flex items-center justify-center lg:justify-end z-0 order-2 justify-self-center">
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

        <div className="mt-8 xs:mt-10 sm:mt-14 md:mt-20 lg:mt-24 pt-6 xs:pt-8 sm:pt-10 md:pt-12 lg:pt-16 border-t-2 border-slate-200">
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
