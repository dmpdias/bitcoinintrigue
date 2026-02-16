import React, { useEffect } from 'react';
import { Users, Mail, Building2, Wallet, ArrowRight } from 'lucide-react';
import { NewsletterCTA } from './NewsletterCTA';

export const AdvertisePage: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-paper relative font-sans text-slate-900">
      
      {/* 1. Hero Section */}
      <header className="pt-20 pb-16 md:pt-32 md:pb-24 px-4 text-center border-b border-slate-900 bg-paper relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
        <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="inline-block bg-slate-900 text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1 mb-6 shadow-[4px_4px_0px_0px_rgba(234,88,12,1)]">
                Partnerships
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
                Reach the <br/> <span className="text-brand-600">Smart Money.</span>
            </h1>
            <p className="text-xl md:text-3xl font-serif max-w-4xl mx-auto leading-relaxed text-slate-800">
                Connect with 45,000+ investors, founders, and decision-makers who actually read our emails every morning.
            </p>
        </div>
      </header>

      {/* 2. Trusted By Marquee */}
      <div className="border-b border-slate-900 bg-white py-12 overflow-hidden">
         <p className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Trusted by Industry Leaders</p>
         <div className="flex justify-center gap-12 md:gap-24 flex-wrap px-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Coinbase', 'Ledger', 'Kraken', 'Binance', 'Trezor', 'BlockFi'].map((name, i) => (
                <div key={i} className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">{name}</div>
            ))}
         </div>
      </div>

      {/* 3. Audience Demographics */}
      <section className="py-20 px-4 border-b border-slate-900 bg-paper relative">
        <div className="max-w-[1200px] mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
                
                {/* Left: Narrative */}
                <div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase mb-8 leading-[0.9]">Who Reads <br/><span className="text-brand-600">Intrigue?</span></h2>
                    <p className="font-serif text-lg md:text-xl leading-relaxed text-slate-800 mb-8">
                        Our audience isn't just "crypto bros". It's the professionals building the infrastructure and the high-net-worth investors funding it. They turn to us for signal, not noise.
                    </p>
                    
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between text-xs font-black uppercase mb-2 tracking-widest">
                                <span>C-Suite & Founders</span>
                                <span>35%</span>
                            </div>
                            <div className="w-full h-4 bg-white border border-slate-900 p-0.5">
                                <div className="h-full bg-slate-900 w-[35%] relative group">
                                     <div className="absolute -top-8 left-full -ml-4 bg-slate-900 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Decision Makers</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-black uppercase mb-2 tracking-widest">
                                <span>Institutional Investors</span>
                                <span>28%</span>
                            </div>
                            <div className="w-full h-4 bg-white border border-slate-900 p-0.5">
                                <div className="h-full bg-brand-600 w-[28%] relative group"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-black uppercase mb-2 tracking-widest">
                                <span>Developers & Tech</span>
                                <span>22%</span>
                            </div>
                            <div className="w-full h-4 bg-white border border-slate-900 p-0.5">
                                <div className="h-full bg-slate-900 w-[22%]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Stats Grid */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-6 md:p-8 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-transform">
                        <Mail className="w-8 h-8 mb-4 text-brand-600" />
                        <div className="text-4xl md:text-6xl font-black text-slate-900 mb-2">48%</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Open Rate</div>
                    </div>
                    <div className="bg-white p-6 md:p-8 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-transform">
                        <Users className="w-8 h-8 mb-4 text-brand-600" />
                        <div className="text-4xl md:text-6xl font-black text-slate-900 mb-2">45k+</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Subscribers</div>
                    </div>
                    <div className="bg-white p-6 md:p-8 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-transform">
                        <Wallet className="w-8 h-8 mb-4 text-brand-600" />
                        <div className="text-3xl md:text-5xl font-black text-slate-900 mb-2">$150k+</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Avg HHI</div>
                    </div>
                    <div className="bg-white p-6 md:p-8 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-transform">
                        <Building2 className="w-8 h-8 mb-4 text-brand-600" />
                        <div className="text-3xl md:text-5xl font-black text-slate-900 mb-2">Top 1%</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Global Rank</div>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* 5. Request Form */}
      <section className="py-20 md:py-32 px-4 relative">
        <div className="max-w-[800px] mx-auto">
            <div className="bg-white p-8 md:p-12 border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-brand-600"></div>
                
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-black uppercase text-slate-900 mb-4">Request Media Kit</h2>
                    <p className="font-serif text-slate-600">Tell us about your brand. We'll send you our 2024 deck.</p>
                </div>

                <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500">Name</label>
                            <input type="text" className="w-full bg-stone-50 border-2 border-slate-200 p-4 focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium text-slate-900 rounded-sm" placeholder="Jane Doe" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500">Work Email</label>
                            <input type="email" className="w-full bg-stone-50 border-2 border-slate-200 p-4 focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium text-slate-900 rounded-sm" placeholder="jane@company.com" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500">Company Website</label>
                        <input type="url" className="w-full bg-stone-50 border-2 border-slate-200 p-4 focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium text-slate-900 rounded-sm" placeholder="https://company.com" />
                    </div>
                    <button className="w-full bg-slate-900 text-white font-black uppercase py-5 mt-6 hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 text-lg shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                        Get The Data <ArrowRight size={20} strokeWidth={3} />
                    </button>
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase mt-4">
                        We respect your inbox. No spam, ever.
                    </p>
                </form>
            </div>
        </div>
      </section>
      
      <NewsletterCTA />
    </div>
  );
};