import React, { useState } from 'react';
import { Check, TrendingUp, BookOpen, Globe, AlertCircle } from 'lucide-react';

export const NewsletterPage: React.FC = () => {
  // Hero Form State
  const [heroEmail, setHeroEmail] = useState('');
  const [heroStatus, setHeroStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Footer Form State
  const [footerEmail, setFooterEmail] = useState('');
  const [footerStatus, setFooterStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubscribe = (e: React.FormEvent, email: string, setStatus: (s: any) => void, clearEmail: () => void) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
        setStatus('error');
        return;
    }
    
    setStatus('success');
    clearEmail();
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

  // Duplicate list for seamless scrolling
  const marqueeList = [...companies, ...companies];

  return (
    <div className="min-h-screen bg-paper relative overflow-hidden">
       {/* Global noise overlay */}
       <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>

      {/* Hero Section */}
      <section className="pt-12 md:pt-24 pb-16 px-4 relative z-10">
        <div className="max-w-[1400px] mx-auto text-center">
            
            <div className="inline-block bg-brand-200 text-slate-900 text-[10px] md:text-xs font-black uppercase tracking-widest px-2 py-1 mb-6 border border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                Free Daily Briefing
            </div>

            <h1 className="font-sans font-black text-5xl sm:text-6xl md:text-8xl text-slate-900 mb-8 leading-[0.9] tracking-tighter uppercase">
                Bitcoin, <br className="hidden md:block" />
                <span className="text-brand-600">Translated.</span>
            </h1>

            <p className="text-lg md:text-2xl text-slate-800 font-serif mb-10 max-w-2xl mx-auto leading-relaxed">
                Join <span className="font-bold bg-brand-200 px-1 border-b-2 border-slate-900">45,000+ smart investors</span> who start their day with our 5-minute explanation of Bitcoin, the world, and your wallet.
            </p>

            {/* Main Conversion Form */}
            <div className="max-w-xl mx-auto mb-16 relative z-10">
                {heroStatus === 'success' ? (
                     <div className="flex h-12 sm:h-16 items-center justify-center bg-brand-50 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-fade-in">
                        <Check className="text-brand-600 mr-3" size={28} />
                        <span className="font-black text-slate-900 text-lg uppercase tracking-wide">You're on the list!</span>
                    </div>
                ) : (
                    <form onSubmit={(e) => handleSubscribe(e, heroEmail, setHeroStatus, () => setHeroEmail(''))}>
                        <div className={`flex flex-col sm:flex-row h-auto sm:h-16 border-2 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(234,88,12,1)] transition-all duration-300 ${heroStatus === 'error' ? 'border-red-500' : 'border-slate-900'}`}>
                            <input 
                                type="email" 
                                value={heroEmail}
                                onChange={(e) => {
                                    setHeroEmail(e.target.value);
                                    if(heroStatus === 'error') setHeroStatus('idle');
                                }}
                                placeholder="Enter your email address..." 
                                className="flex-grow px-4 md:px-6 h-12 sm:h-full bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 text-base md:text-lg font-medium min-w-0 border-b-2 sm:border-b-0 border-slate-100 sm:border-none"
                            />
                            <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-black uppercase text-sm md:text-lg px-6 md:px-10 h-12 sm:h-full transition-colors whitespace-nowrap sm:border-l-2 border-slate-900">
                                Join Free
                            </button>
                        </div>
                        {heroStatus === 'error' && (
                            <p className="text-red-600 text-[10px] md:text-xs font-bold flex items-center justify-center gap-1.5 mt-2 animate-fade-in">
                                <AlertCircle size={12} />
                                Please enter a valid email address (e.g. name@domain.com)
                            </p>
                        )}
                    </form>
                )}
                {heroStatus !== 'success' && (
                    <p className="mt-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                        <Check size={14} className="text-brand-600" strokeWidth={3} />
                        No Spam. Unsubscribe anytime.
                    </p>
                )}
            </div>
        </div>
      </section>

      {/* Social Proof / Trust Banner - MARQUEE */}
      <div className="border-y border-slate-900 bg-brand-50 py-10 mb-20 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
             <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Read by curious minds at</p>
             
             <div className="overflow-hidden relative w-full">
                <div className="flex animate-scroll whitespace-nowrap gap-16 items-center opacity-60 grayscale w-max">
                     {marqueeList.map((company, index) => (
                        <span key={index} className={`text-xl md:text-2xl text-slate-800 ${company.style}`}>
                            {company.name}
                        </span>
                     ))}
                </div>
             </div>
        </div>
      </div>

      {/* Value Props Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative z-10">
        
        {/* Header - Unified Design */}
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 md:mb-20 gap-6">
            <div>
                <div className="inline-block bg-brand-200 text-slate-900 text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-2 border border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    The Method
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9]">
                    Why <span className="text-brand-600">Subscribe?</span>
                </h2>
            </div>
            
            <div className="max-w-md">
                <p className="text-sm md:text-base font-serif text-slate-800 leading-relaxed mb-2">
                    Three reasons why this is the only crypto newsletter you need.
                </p>
                <div className="h-1 w-12 bg-slate-900"></div>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
                {/* Item 1 */}
                <div className="flex gap-5 group">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center shrink-0 group-hover:shadow-[6px_6px_0px_0px_rgba(234,88,12,1)] group-hover:-translate-y-1 transition-all">
                        <TrendingUp className="text-brand-600" size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 uppercase leading-none mt-2">Simple Stories</h3>
                        <p className="text-slate-700 leading-relaxed font-medium text-sm md:text-base">
                            We monitor the charts so you don't have to. We tell you <span className="italic font-serif bg-brand-100 px-1">why</span> the price is moving in plain English stories, not complicated graphs.
                        </p>
                    </div>
                </div>

                {/* Item 2 */}
                <div className="flex gap-5 group">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center shrink-0 group-hover:shadow-[6px_6px_0px_0px_rgba(234,88,12,1)] group-hover:-translate-y-1 transition-all">
                        <BookOpen className="text-brand-600" size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 uppercase leading-none mt-2">Daily Lessons</h3>
                        <p className="text-slate-700 leading-relaxed font-medium text-sm md:text-base">
                            Each email teaches you one new concept—like "Mining" or "Cold Storage"—in a way that your grandma would understand.
                        </p>
                    </div>
                </div>

                {/* Item 3 */}
                <div className="flex gap-5 group">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center shrink-0 group-hover:shadow-[6px_6px_0px_0px_rgba(234,88,12,1)] group-hover:-translate-y-1 transition-all">
                        <Globe className="text-brand-600" size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 uppercase leading-none mt-2">Global Context</h3>
                        <p className="text-slate-700 leading-relaxed font-medium text-sm md:text-base">
                            We bring you stories from El Salvador to Wall Street, showing you how Bitcoin is changing the world, not just the stock market.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Visual - Stylized Email Preview */}
            <div className="relative pl-4 pt-4">
                <div className="absolute top-0 right-0 w-full h-full bg-slate-900 rounded-sm -z-10 translate-x-2 translate-y-2"></div>
                <div className="bg-white border-2 border-slate-900 rounded-sm p-6 md:p-8 shadow-none relative">
                    <div className="flex items-center justify-between border-b-2 border-slate-100 pb-6 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold">B</div>
                            <span className="font-black text-lg">Bitcoin Intrigue</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today, 7:00 AM</span>
                    </div>
                    
                    <div className="space-y-4 opacity-80">
                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                        <div className="bg-brand-50 border border-brand-100 p-4 rounded-sm mt-6">
                            <p className="text-center font-serif text-slate-800 text-lg leading-relaxed">"Imagine Bitcoin prices like a seesaw. Last week, investors got nervous..."</p>
                        </div>
                        <div className="h-4 bg-slate-100 rounded w-full mt-6"></div>
                        <div className="h-4 bg-slate-100 rounded w-4/5"></div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                         <div className="inline-block bg-brand-600 text-white font-bold uppercase text-xs px-4 py-2 rounded-sm">Read Full Story</div>
                    </div>
                    
                    {/* Badge */}
                    <div className="absolute -bottom-6 -left-6 bg-brand-200 border-2 border-slate-900 text-slate-900 px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rotate-3">
                        5 Minute Read
                    </div>
                </div>
            </div>

        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-slate-900 py-16 md:py-24 px-4 mb-0 relative overflow-hidden">
          {/* Pattern */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px"}}></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
              <div className="inline-block bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-6 border border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                  Subscriber Love
              </div>
              <h2 className="text-2xl md:text-4xl font-serif text-white leading-relaxed mb-10">
                  <span className="text-brand-600 text-6xl float-left mr-2 leading-[0]">“</span>
                  I used to feel stupid when people talked about crypto. Bitcoin Intrigue is the only newsletter that explains it without making me feel like I need a PhD.
              </h2>
              <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-full border-2 border-brand-600"></div>
                  <div className="text-left">
                      <div className="font-bold uppercase tracking-wider text-white">James P.</div>
                      <div className="text-brand-400 text-xs font-bold uppercase tracking-widest">Beginner Investor</div>
                  </div>
              </div>
          </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-600 py-16 md:py-24 px-4 border-t border-slate-900">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-black text-3xl sm:text-5xl uppercase mb-8 text-white leading-none">
                Ready to finally <br/>
                <span className="text-slate-900">understand Bitcoin?</span>
            </h2>
            
            {footerStatus === 'success' ? (
                 <div className="flex h-12 sm:h-14 items-center justify-center bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] animate-fade-in">
                    <Check className="text-brand-600 mr-3" size={24} />
                    <span className="font-black text-slate-900 text-base sm:text-lg uppercase tracking-wide">Thanks for subscribing!</span>
                </div>
            ) : (
                <form onSubmit={(e) => handleSubscribe(e, footerEmail, setFooterStatus, () => setFooterEmail(''))}>
                    <div className={`flex flex-col sm:flex-row h-auto sm:h-14 bg-white border-2  shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] gap-0 ${footerStatus === 'error' ? 'border-red-500' : 'border-slate-900'}`}>
                        <input 
                            type="email" 
                            value={footerEmail}
                            onChange={(e) => {
                                setFooterEmail(e.target.value);
                                if(footerStatus === 'error') setFooterStatus('idle');
                            }}
                            placeholder="Your email address" 
                            className="flex-grow px-4 md:px-6 h-12 sm:h-full bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                        />
                        <button type="submit" className="bg-slate-900 text-white font-black uppercase px-8 h-12 sm:h-full hover:bg-slate-800 transition-colors whitespace-nowrap">
                            Join Free
                        </button>
                    </div>
                    {footerStatus === 'error' && (
                        <p className="text-white text-[10px] md:text-xs font-bold flex items-center justify-center gap-1.5 mt-4 bg-red-600 inline-block px-3 py-1 rounded">
                            <AlertCircle size={12} />
                            Please enter a valid email address (e.g. name@domain.com)
                        </p>
                    )}
                </form>
            )}
            {footerStatus !== 'success' && (
                <p className="mt-4 text-xs font-bold text-brand-100 uppercase tracking-widest">100% Free. Unsubscribe anytime.</p>
            )}
          </div>
      </section>

    </div>
  );
};