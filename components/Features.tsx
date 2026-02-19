import React from 'react';
import { BookOpen, Globe, MessageCircle, ArrowRight } from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-paper relative overflow-hidden">
      {/* Decorative Background Texture - subtle dots pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{backgroundImage: "radial-gradient(#9ca3af 0.8px, transparent 0.8px)", backgroundSize: "14px 14px"}}></div>
      <div className="hidden sm:block absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="hidden md:block absolute bottom-0 right-0 w-96 h-96 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header - Unified Design */}
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 sm:mb-8 md:mb-12 lg:mb-20 gap-4 md:gap-6">
            <div>
                <div className="inline-block bg-brand-200 text-slate-900 text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-2 border border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] xs:shadow-[1.5px_1.5px_0px_0px_rgba(15,23,42,1)] sm:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    THE MISSION
                </div>
                <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9]">
                    WHY <span className="text-brand-600">INTRIGUE?</span>
                </h2>
            </div>

            <div className="max-w-md">
                <p className="text-xs xs:text-sm sm:text-base font-serif text-slate-800 leading-relaxed mb-1.5 xs:mb-2">
                    We turn complex crypto drama into simple human stories you'll actually enjoy reading.
                </p>
                <div className="h-0.5 xs:h-1 w-12 bg-slate-900"></div>
            </div>
        </div>

        {/* Mobile-First Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-10">

            {/* Card 1 */}
            <div className="group bg-[#fdfbf7] hover:bg-white p-3 xs:p-4 sm:p-6 md:p-8 border-2 border-slate-200 hover:border-brand-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.06)] xs:shadow-[3px_3px_0px_0px_rgba(15,23,42,0.08)] hover:shadow-[4px_4px_0px_0px_rgba(234,88,12,0.5)] md:hover:shadow-[8px_8px_0px_0px_rgba(234,88,12,0.7)] transition-all duration-300 transform hover:-translate-y-0.5 md:hover:-translate-y-1 rounded-sm">
                <div className="w-9 h-9 xs:w-11 xs:h-11 md:w-16 md:h-16 rounded-full bg-slate-900 text-white flex items-center justify-center mb-2 xs:mb-3 md:mb-6 group-hover:bg-brand-600 transition-colors shrink-0">
                     <MessageCircle size={18} className="xs:w-[20px] xs:h-[20px] md:w-8 md:h-8" strokeWidth={2} />
                </div>
                <h3 className="font-sans font-black text-[13px] xs:text-sm sm:text-lg md:text-2xl mb-1.5 xs:mb-2 md:mb-4 text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
                    No "Crypto-Bro" Speak
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium text-[12px] xs:text-sm md:text-base mb-2 xs:mb-3 md:mb-6">
                    We speak English, not hype. If we have to use a technical term, we explain it simply right there in the sentence.
                </p>
                <div className="flex items-center gap-2 text-[7px] xs:text-[8px] md:text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-600 transition-colors mt-auto">
                    Clear & Simple <ArrowRight size={10} className="xs:w-2.5 xs:h-2.5 md:w-4 md:h-4" />
                </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-[#fdfbf7] hover:bg-white p-3 xs:p-4 sm:p-6 md:p-8 border-2 border-slate-200 hover:border-brand-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.06)] xs:shadow-[3px_3px_0px_0px_rgba(15,23,42,0.08)] hover:shadow-[4px_4px_0px_0px_rgba(234,88,12,0.5)] md:hover:shadow-[8px_8px_0px_0px_rgba(234,88,12,0.7)] transition-all duration-300 transform hover:-translate-y-0.5 md:hover:-translate-y-1 rounded-sm">
                <div className="w-9 h-9 xs:w-11 xs:h-11 md:w-16 md:h-16 rounded-full bg-slate-900 text-white flex items-center justify-center mb-2 xs:mb-3 md:mb-6 group-hover:bg-brand-600 transition-colors shrink-0">
                    <Globe size={18} className="xs:w-[20px] xs:h-[20px] md:w-8 md:h-8" strokeWidth={2} />
                </div>
                <h3 className="font-sans font-black text-[13px] xs:text-sm sm:text-lg md:text-2xl mb-1.5 xs:mb-2 md:mb-4 text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
                    Beyond the Charts
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium text-[12px] xs:text-sm md:text-base mb-2 xs:mb-3 md:mb-6">
                    Bitcoin isn't just lines on a chart. It's El Salvador adoption, Wall Street power plays, and real geopolitics. We cover the world.
                </p>
                <div className="flex items-center gap-2 text-[7px] xs:text-[8px] md:text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-600 transition-colors mt-auto">
                    Big Picture <ArrowRight size={10} className="xs:w-2.5 xs:h-2.5 md:w-4 md:h-4" />
                </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-[#fdfbf7] hover:bg-white p-3 xs:p-4 sm:p-6 md:p-8 border-2 border-slate-200 hover:border-brand-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.06)] xs:shadow-[3px_3px_0px_0px_rgba(15,23,42,0.08)] hover:shadow-[4px_4px_0px_0px_rgba(234,88,12,0.5)] md:hover:shadow-[8px_8px_0px_0px_rgba(234,88,12,0.7)] transition-all duration-300 transform hover:-translate-y-0.5 md:hover:-translate-y-1 rounded-sm">
                <div className="w-9 h-9 xs:w-11 xs:h-11 md:w-16 md:h-16 rounded-full bg-slate-900 text-white flex items-center justify-center mb-2 xs:mb-3 md:mb-6 group-hover:bg-brand-600 transition-colors shrink-0">
                    <BookOpen size={18} className="xs:w-[20px] xs:h-[20px] md:w-8 md:h-8" strokeWidth={2} />
                </div>
                <h3 className="font-sans font-black text-[13px] xs:text-sm sm:text-lg md:text-2xl mb-1.5 xs:mb-2 md:mb-4 text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
                    One Thing Smarter Every Day
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium text-[12px] xs:text-sm md:text-base mb-2 xs:mb-3 md:mb-6">
                    Every article teaches you one thing. In a month, you'll be the most interesting person at the table when Bitcoin comes up.
                </p>
                <div className="flex items-center gap-2 text-[7px] xs:text-[8px] md:text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-600 transition-colors mt-auto">
                    Learn Daily <ArrowRight size={10} className="xs:w-2.5 xs:h-2.5 md:w-4 md:h-4" />
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};