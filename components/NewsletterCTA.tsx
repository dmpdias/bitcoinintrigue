import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';

export const NewsletterCTA: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
        setStatus('error');
        return;
    }
    
    setStatus('success');
    setEmail('');
  };

  return (
    <section className="bg-brand-700 relative overflow-hidden py-12 md:py-24">
        {/* Map Texture Overlay */}
        <div 
            className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
            }}
        ></div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                
                {/* Left Text */}
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                    <h2 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl text-white uppercase leading-[0.9] mb-4">
                        Smart money reads Intrigue.
                    </h2>
                    <p className="text-brand-100 font-bold text-lg md:text-xl opacity-90 max-w-lg mx-auto lg:mx-0">
                        Join the 45,000+ investors who start their day with clarity, not chaos.
                    </p>
                </div>

                {/* Right Form */}
                <div className="w-full lg:w-1/2 max-w-xl">
                    <p className="text-white mb-3 text-base md:text-lg font-medium text-center lg:text-left">Don't get left behind.</p>
                    
                    {/* Mobile-First Stacked Form */}
                    {status === 'success' ? (
                         <div className="flex h-12 md:h-14 items-center px-6 bg-white shadow-2xl rounded-sm animate-fade-in">
                            <Check className="text-brand-600 mr-3" size={24} />
                            <span className="font-black text-slate-900 text-sm sm:text-base uppercase tracking-wide">Thanks for subscribing!</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col sm:flex-row h-auto sm:h-14 bg-transparent sm:bg-white shadow-none sm:shadow-2xl gap-3 sm:gap-0">
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if(status === 'error') setStatus('idle');
                                    }}
                                    placeholder="Your email address..." 
                                    className={`w-full h-12 sm:h-full flex-grow px-4 md:px-6 bg-white sm:bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 text-base md:text-lg rounded-sm sm:rounded-none ${status === 'error' ? 'border-2 border-red-500 sm:border-0' : ''}`}
                                />
                                <button type="submit" className="w-full sm:w-auto h-12 sm:h-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-base md:text-lg px-8 transition-colors whitespace-nowrap rounded-sm sm:rounded-none">
                                    Join Free
                                </button>
                            </div>
                            {status === 'error' && (
                                <p className="text-white text-[10px] md:text-xs font-bold flex items-center gap-1.5 mt-2 animate-fade-in bg-red-500/20 py-1 px-2 inline-block rounded">
                                    <AlertCircle size={12} />
                                    Please enter a valid email address (e.g. name@domain.com)
                                </p>
                            )}
                        </form>
                    )}
                    
                     {status !== 'success' && (
                        <p className="mt-3 text-[10px] font-bold text-white/70 uppercase tracking-widest text-center lg:text-left">
                            No Spam. No Noise. Unsubscribe Any Time.
                        </p>
                     )}
                </div>

            </div>
        </div>
    </section>
  );
};