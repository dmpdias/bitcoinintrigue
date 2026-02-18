import React from 'react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "I bought a tiny bit of Bitcoin on a whim and had no idea what I'd bought. Now I actually understand it.",
      name: "Maria",
      role: "31, Teacher",
      img: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      quote: "I read it on my lunch break. It's the only newsletter I don't delete.",
      name: "James",
      role: "28, Graphic Designer",
      img: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      quote: "I finally stopped feeling stupid when Bitcoin came up in conversation.",
      name: "Priya",
      role: "36, HR Manager",
      img: "https://randomuser.me/api/portraits/women/44.jpg"
    }
  ];

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-[#EBE8E0] border-t border-slate-900 relative overflow-hidden">
      {/* Background Texture Pattern - subtle dots */}
      <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply" style={{backgroundImage: "radial-gradient(#9ca3af 1px, transparent 1px)", backgroundSize: "16px 16px"}}></div>

      <div className="max-w-[1400px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header - Unified Design */}
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 sm:mb-10 md:mb-14 lg:mb-20 gap-4 md:gap-6">
            <div>
                <div className="inline-block bg-brand-200 text-slate-900 text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-2 border border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] xs:shadow-[1.5px_1.5px_0px_0px_rgba(15,23,42,1)] sm:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    WHAT READERS ARE SAYING
                </div>
                <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9]">
                    Real people. Plain English. No prior knowledge required.
                </h2>
            </div>

            <div className="max-w-md">
                <div className="h-0.5 xs:h-1 w-12 bg-slate-900"></div>
            </div>
        </div>

        {/* Horizontal Scroll Container - Optimized for mobile */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 xs:gap-4 sm:gap-5 md:gap-6 pb-4 xs:pb-6 -mx-3 px-3 xs:-mx-4 xs:px-4 sm:mx-0 sm:px-0 md:justify-center hide-scrollbar">
            {testimonials.map((t, i) => (
                <div key={i} className="snap-center shrink-0 w-[80vw] xs:w-[85vw] sm:w-[340px] md:w-[380px] aspect-square bg-[#FDFBF7] flex flex-col p-4 xs:p-5 sm:p-6 md:p-8 relative shadow-sm border border-transparent hover:border-slate-200 transition-colors">

                    {/* Quote Mark */}
                    <div className="text-5xl xs:text-6xl sm:text-7xl font-serif text-[#E5E2D9] leading-none absolute top-2 xs:top-3 left-3 xs:left-4 sm:left-6 select-none font-bold">
                        "
                    </div>

                    <div className="relative z-10 mt-5 xs:mt-6 sm:mt-8 mb-4 xs:mb-5 sm:mb-6 flex-grow flex flex-col justify-center">
                        <p className="font-sans text-slate-900 text-xs xs:text-sm sm:text-base md:text-lg leading-relaxed font-medium line-clamp-5">
                            {t.quote}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 xs:gap-3 sm:gap-4 mt-auto pt-0 relative z-10">
                        <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden grayscale border border-slate-200 shrink-0">
                            <img
                                src={t.img}
                                alt={t.name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                            <div className="font-black text-slate-900 text-xs sm:text-base md:text-lg leading-none mb-0.5 xs:mb-1 line-clamp-1">{t.name}</div>
                            <div className="text-[7px] xs:text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide leading-tight line-clamp-2">{t.role}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};