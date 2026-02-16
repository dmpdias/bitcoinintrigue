import React from 'react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "Indispensable and insightful, Bitcoin Intrigue delivers a wealth of global intelligence straight to my inbox. It offers a nuanced understanding of world affairs that I really look forward to reading!",
      name: "Allan S.",
      role: "Head of Comms, Vinson & Elkins",
      img: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      quote: "I read Intrigue everyday as part of my morning commute into the city. As part of a global treasury team, I need to know how global events are going to impact my day before it begins.",
      name: "Omar L.",
      role: "Assistant Vice President, Citi",
      img: "https://randomuser.me/api/portraits/men/86.jpg"
    },
    {
      quote: "As a former US Diplomat, I love Intrigue because it gives me high-level analysis in a more enjoyable, digestible format unlike so many government briefings I used to read.",
      name: "Lisa W.",
      role: "Former US Diplomat",
      img: "https://randomuser.me/api/portraits/women/44.jpg"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-[#EBE8E0] border-t border-slate-900 relative overflow-hidden">
      {/* Background Texture Pattern - subtle dots */}
      <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply" style={{backgroundImage: "radial-gradient(#9ca3af 1px, transparent 1px)", backgroundSize: "16px 16px"}}></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header - Unified Design */}
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 md:mb-20 gap-6">
            <div>
                <div className="inline-block bg-brand-200 text-slate-900 text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-2 border border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    Subscriber Love
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9]">
                    Take it from <span className="text-brand-600">Them!</span>
                </h2>
            </div>
            
            <div className="max-w-md">
                <p className="text-sm md:text-base font-serif text-slate-800 leading-relaxed mb-2">
                    Real reviews from real subscribers.
                </p>
                <div className="h-1 w-12 bg-slate-900"></div>
            </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 md:justify-center hide-scrollbar">
            {testimonials.map((t, i) => (
                <div key={i} className="snap-center shrink-0 w-[85vw] sm:w-[360px] md:w-[400px] aspect-square bg-[#FDFBF7] flex flex-col p-8 relative shadow-sm border border-transparent hover:border-slate-200 transition-colors">
                    
                    {/* Quote Mark */}
                    <div className="text-7xl font-serif text-[#E5E2D9] leading-none absolute top-4 left-6 select-none font-bold">
                        “
                    </div>

                    <div className="relative z-10 mt-8 mb-6 flex-grow flex flex-col justify-center">
                        <p className="font-sans text-slate-900 text-lg leading-relaxed font-medium">
                            {t.quote}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mt-auto pt-0 relative z-10">
                        <div className="w-14 h-14 rounded-full overflow-hidden grayscale border border-slate-200">
                            <img 
                                src={t.img} 
                                alt={t.name} 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="text-left">
                            <div className="font-black text-slate-900 text-xl leading-none mb-1">{t.name}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide leading-tight">{t.role}</div>
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