import React from 'react';
import { BookOpen, Globe, MessageCircle, ArrowRight } from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <section className="py-12 md:py-24 bg-paper relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header - Unified Design */}
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 md:mb-20 gap-6">
            <div>
                <div className="inline-block bg-brand-200 text-slate-900 text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-2 border border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    The Mission
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9]">
                    Why <span className="text-brand-600">Intrigue?</span>
                </h2>
            </div>
            
            <div className="max-w-md">
                <p className="text-sm md:text-base font-serif text-slate-800 leading-relaxed mb-2">
                    We turn complex crypto drama into simple human stories you'll actually enjoy reading.
                </p>
                <div className="h-1 w-12 bg-slate-900"></div>
            </div>
        </div>

        {/* Mobile-First Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            
            {/* Card 1 */}
            <div className="group bg-white p-6 md:p-8 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_0px_rgba(234,88,12,1)] hover:border-brand-600 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-900 text-white flex items-center justify-center mb-4 md:mb-6 group-hover:bg-brand-600 transition-colors">
                     <MessageCircle size={24} className="md:w-8 md:h-8" strokeWidth={2} />
                </div>
                <h3 className="font-sans font-black text-xl md:text-2xl mb-3 md:mb-4 text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
                    No "Crypto-Bro" Speak
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium text-sm md:text-base mb-4 md:mb-6">
                    We speak English, not hype. If we have to use a technical term, we explain it simply right there in the sentence.
                </p>
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-600 transition-colors mt-auto">
                    Clear & Simple <ArrowRight size={14} />
                </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-white p-6 md:p-8 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_0px_rgba(234,88,12,1)] hover:border-brand-600 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-900 text-white flex items-center justify-center mb-4 md:mb-6 group-hover:bg-brand-600 transition-colors">
                    <Globe size={24} className="md:w-8 md:h-8" strokeWidth={2} />
                </div>
                <h3 className="font-sans font-black text-xl md:text-2xl mb-3 md:mb-4 text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
                    Beyond the Charts
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium text-sm md:text-base mb-4 md:mb-6">
                    Bitcoin isn't just lines on a chart. It's El Salvador adoption, Wall Street power plays, and real geopolitics. We cover the world.
                </p>
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-600 transition-colors mt-auto">
                    Big Picture <ArrowRight size={14} />
                </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-white p-6 md:p-8 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_0px_rgba(234,88,12,1)] hover:border-brand-600 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-900 text-white flex items-center justify-center mb-4 md:mb-6 group-hover:bg-brand-600 transition-colors">
                    <BookOpen size={24} className="md:w-8 md:h-8" strokeWidth={2} />
                </div>
                <h3 className="font-sans font-black text-xl md:text-2xl mb-3 md:mb-4 text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
                    Get 1% Smarter
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium text-sm md:text-base mb-4 md:mb-6">
                    Every issue includes one bite-sized lesson. In 30 days, you'll go from "what is a blockchain?" to explaining it at parties.
                </p>
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-600 transition-colors mt-auto">
                    Learn Daily <ArrowRight size={14} />
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};