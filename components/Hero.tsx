
import React, { useState } from 'react';
import { Bitcoin, Check, AlertCircle } from 'lucide-react';
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
    <section className="relative pt-6 xs:pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-4 xs:pb-6 sm:pb-8 md:pb-10 lg:pb-12 overflow-hidden bg-paper">
      <div className="max-w-[1400px] mx-auto w-full px-3 xs:px-4 sm:px-6 lg:px-8">

        <div className="max-w-3xl mx-auto">
          {/* Badge Label */}
          <div className="mb-4 xs:mb-5 sm:mb-6 md:mb-8 animate-fade-in" style={{ animationDelay: '0.05s', opacity: 0, animationFillMode: 'forwards' }}>
            <span className="inline-block bg-slate-900 text-white text-[10px] font-sans font-black uppercase px-3 py-1.5 tracking-widest rounded-sm">
              Bitcoin News
            </span>
          </div>

          {/* Headline with one word in orange */}
          <h1 className="font-sans font-black text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-slate-900 mb-3 xs:mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-[0.85] tracking-tighter uppercase animate-slide-up">
            Bitcoin.<br /> Translated.<br /> For <span className="text-brand-600">INTRIGUE.</span>
          </h1>

          {/* Benefit statement */}
          <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-slate-900 font-bold mb-3 xs:mb-4 sm:mb-5 md:mb-6 leading-snug animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            No jargon. No hype. Just clarity.
          </p>

          {/* Description */}
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-slate-700 font-normal mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12 leading-relaxed max-w-2xl animate-fade-in" style={{ animationDelay: '0.15s', opacity: 0, animationFillMode: 'forwards' }}>
            Every day, we explain exactly what's happening in crypto — in plain English, with no jargon.
          </p>

          {/* CTA Form */}
          <div className="w-full max-w-md animate-fade-in z-20 flex-shrink-0 mb-12 xs:mb-14 sm:mb-16 md:mb-20" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              {status === 'success' ? (
                  <div className="flex h-12 xs:h-14 sm:h-16 md:h-18 lg:h-20 items-center px-4 xs:px-5 sm:px-7 md:px-8 bg-brand-50 border-2 border-slate-900 rounded-md shadow-lg w-full animate-fade-in gap-3">
                      <Check className="text-brand-600 shrink-0 flex-none" size={24} />
                      <span className="font-black text-slate-900 text-xs xs:text-sm sm:text-base md:text-lg uppercase tracking-wide">Thanks! Check your inbox.</span>
                  </div>
              ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3 xs:gap-3.5 sm:gap-4 w-full">
                      <div className={`flex h-12 xs:h-14 sm:h-16 md:h-18 lg:h-20 border-2 bg-white rounded-md overflow-hidden shadow-lg hover:shadow-xl hover:border-brand-400 focus-within:shadow-xl focus-within:border-brand-600 transition-all duration-300 ${status === 'error' ? 'border-red-500' : 'border-slate-900'}`}>
                          <input
                              type="email"
                              value={email}
                              onChange={(e) => {
                                  setEmail(e.target.value);
                                  if(status === 'error') setStatus('idle');
                              }}
                              disabled={status === 'loading'}
                              placeholder="your@email.com"
                              className="flex-grow px-4 xs:px-5 sm:px-6 h-full bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 text-xs xs:text-sm sm:text-base md:text-lg font-medium min-w-0"
                          />
                          <button type="submit" disabled={status === 'loading'} className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-black uppercase text-xs xs:text-sm sm:text-base md:text-lg px-6 xs:px-7 sm:px-8 md:px-10 h-full transition-all whitespace-nowrap flex items-center justify-center shrink-0">
                              {status === 'loading' ? (
                                  <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                  <span>
                                      <span className="hidden xs:inline">Try It Out</span>
                                      <span className="xs:hidden">Start</span>
                                  </span>
                              )}
                          </button>
                      </div>
                      {status === 'error' && (
                          <p className="text-red-600 text-xs xs:text-sm font-bold flex items-center gap-2 animate-fade-in leading-tight">
                              <AlertCircle size={16} className="shrink-0 flex-none" />
                              <span>Check your email and try again.</span>
                          </p>
                      )}
                  </form>
              )}

              {status !== 'success' && (
                  <p className="text-xs xs:text-sm font-semibold text-slate-600 mt-3 xs:mt-4 sm:mt-5 flex items-center gap-2 leading-tight">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0 flex-none"></span>
                  <span>100% FREE. NO SPAM. UNSUBSCRIBE ANYTIME.</span>
                  </p>
              )}
          </div>

          {/* Bitcoin Icon Badge */}
          <div className="relative mb-8 xs:mb-10 sm:mb-12 md:mb-16 animate-fade-in" style={{ animationDelay: '0.25s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-slate-900 flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-brand-600 transition-all duration-300">
              <Bitcoin className="text-white w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" />
            </div>
          </div>
        </div>

        <div className="mt-4 xs:mt-6 sm:mt-10 md:mt-14 lg:mt-16 pt-6 xs:pt-8 sm:pt-10 md:pt-12 lg:pt-16 border-t-2 border-slate-200">
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
