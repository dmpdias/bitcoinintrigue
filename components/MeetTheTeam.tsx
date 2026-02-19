import React from 'react';

const TEAM = [
  {
    name: "Uncle Ray",
    role: "Chief Storyteller",
    bio: "Explains Bitcoin the way a smart friend does. Casually. With specific details. Slightly amused by the whole thing.",
    image: "/avatars/uncle-ray.svg"
  },
  {
    name: "Grandma June",
    role: "The Memory Keeper",
    bio: "She's been through every crash, every boom, and every headline that said it was all over. She puts today in perspective.",
    image: "/avatars/grandma-june.svg"
  },
  {
    name: "Cousin Marco",
    role: "Global Scout",
    bio: "Finds the Bitcoin stories happening in the real world — not just on charts. This week Lagos. Next week Texas.",
    image: "/avatars/cousin-marco.svg"
  },
  {
    name: "Auntie Claire",
    role: "The Patient Explainer",
    bio: "Former teacher. Allergic to jargon. Starts with the thing you already know, then bridges to the thing you don't.",
    image: "/avatars/auntie-claire.svg"
  },
  {
    name: "Big Brother Dan",
    role: "The Honest Reviewer",
    bio: "Tests the wallets, exchanges, and tools you might actually use. No agenda. No affiliate links. Just the truth.",
    image: "/avatars/big-brother-dan.svg"
  },
  {
    name: "Little Sister Sofia",
    role: "Your Reality Check",
    bio: "She bought Bitcoin three months ago. If she'd close the tab, it doesn't publish. She's the quality gate.",
    image: "/avatars/little-sister-sofia.svg"
  }
];

export const MeetTheTeam: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-[#fdfbf7] border-t border-slate-900 relative overflow-hidden">
       {/* Background Noise */}
       <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header Section */}
        <div className="mb-6 sm:mb-10 md:mb-14 lg:mb-20">
            <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                <div className="inline-block bg-brand-200 text-slate-900 text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-2 xs:mb-2.5 sm:mb-3 border border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] xs:shadow-[1.5px_1.5px_0px_0px_rgba(15,23,42,1)] sm:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    WHO WE ARE
                </div>
                <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9] mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                    The Bitcoin Intrigue <span className="text-brand-600">Family</span>
                </h2>
                <p className="text-xs xs:text-sm sm:text-base md:text-lg font-serif text-slate-700 leading-relaxed max-w-2xl">
                    Six different angles on the same story. No jargon. No hype. Just honest explanations from people who actually get it.
                </p>
                <div className="h-0.5 xs:h-1 w-12 bg-brand-600 mt-3 sm:mt-4 md:mt-6"></div>
            </div>
        </div>

        {/* Mobile Horizontal Scroller - Enhanced */}
        <div className="block sm:hidden -mx-3 xs:-mx-4 px-3 xs:px-4 mb-6 xs:mb-8">
          <div className="flex gap-3 xs:gap-4 overflow-x-auto snap-x snap-mandatory pb-3 xs:pb-4 hide-scrollbar">
            {TEAM.map((member, index) => (
                <div key={index} className="flex flex-col items-center text-center group shrink-0 w-[75px] xs:w-[95px]">
                    {/* Square Image with enhanced hover */}
                    <div className="w-full aspect-square mb-2.5 xs:mb-3 relative overflow-hidden border-2 border-slate-900 bg-[#fdfbf7] transition-all duration-300 shadow-[1.5px_1.5px_0px_0px_rgba(15,23,42,0.8)] group-hover:shadow-[2px_2px_0px_0px_rgba(234,88,12,0.6)] group-hover:border-brand-600 group-hover:-translate-y-1 rounded-sm">
                         <img
                            src={member.image}
                            alt={member.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                         />
                    </div>
                    {/* Name */}
                    <h3 className="font-sans font-black text-[10px] xs:text-[11px] text-slate-900 mb-1 xs:mb-1.5 leading-tight line-clamp-2">
                        {member.name}
                    </h3>
                    {/* Role */}
                    <p className="font-bold text-brand-600 text-[7px] xs:text-[8px] uppercase tracking-widest leading-tight line-clamp-2">
                        {member.role}
                    </p>
                    {/* Bio - shown on mobile for better engagement */}
                    <p className="font-serif text-slate-700 text-[7px] xs:text-[8px] leading-tight mt-1 xs:mt-1.5 opacity-75 line-clamp-2 hidden xs:block">
                        {member.bio}
                    </p>
                </div>
            ))}
          </div>
        </div>

        {/* Desktop Grid - Enhanced */}
        <div className="hidden sm:grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 lg:gap-6">
            {TEAM.map((member, index) => (
                <div key={index} className="flex flex-col items-center text-center group">

                    {/* Square Image with Brand Border - Cream background */}
                    <div className="w-full aspect-square mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 relative overflow-hidden border-2 xs:border-2 sm:border-2 md:border-3 border-slate-900 bg-[#fdfbf7] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[2px_2px_0px_0px_rgba(234,88,12,0.3)] xs:group-hover:shadow-[3px_3px_0px_0px_rgba(234,88,12,0.4)] group-hover:border-brand-600 shadow-[1px_1px_0px_0px_rgba(15,23,42,0.9)] xs:shadow-[2px_2px_0px_0px_rgba(15,23,42,0.95)] sm:shadow-[2.5px_2.5px_0px_0px_rgba(15,23,42,1)] md:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rounded-sm">
                         <img
                            src={member.image}
                            alt={member.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                         />
                    </div>

                    {/* Name */}
                    <h3 className="font-sans font-black text-[10px] xs:text-xs sm:text-sm md:text-base text-slate-900 mb-0.5 xs:mb-1 leading-tight line-clamp-2">
                        {member.name}
                    </h3>

                    {/* Role */}
                    <p className="mb-1 xs:mb-1.5 sm:mb-2 font-bold text-brand-600 text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs uppercase tracking-widest leading-tight line-clamp-2">
                        {member.role}
                    </p>

                    {/* Bio */}
                    <p className="font-serif text-slate-700 text-[7px] xs:text-[8px] sm:text-xs md:text-sm leading-tight xs:leading-relaxed opacity-85 line-clamp-3 xs:line-clamp-none">
                        {member.bio}
                    </p>
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