import React from 'react';

const TEAM = [
  {
    name: "Marcus Thorne",
    role: "Chief Storyteller",
    bio: "Ex-Financial Journalist who turns complex market data into stories you actually want to read.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Elena V.",
    role: "Jargon Slayer",
    bio: "Former Tech Editor ensuring every word in our newsletter is beginner-friendly and jargon-free.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Julian Chen",
    role: "Global Scout",
    bio: "Investigative Researcher finding stories from remittance shops in El Salvador to mining farms in Texas.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Sarah Jenkins",
    role: "The Teacher",
    bio: "Former Educator crafting daily lessons to help you grow 1% smarter every single day.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
  }
];

export const MeetTheTeam: React.FC = () => {
  return (
    <section className="py-12 md:py-24 bg-paper border-t border-slate-900 relative overflow-hidden">
       {/* Background Noise */}
       <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 md:mb-20 gap-4">
            <div>
                <div className="inline-block bg-brand-200 text-slate-900 text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-2 border border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    Who We Are
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9]">
                    The Intel <span className="text-brand-600">Squad</span>
                </h2>
            </div>
            
            <div className="max-w-xs">
                <p className="text-sm md:text-base font-serif text-slate-800 leading-relaxed mb-2">
                    Teachers, storytellers, and researchers.
                </p>
                <div className="h-1 w-12 bg-slate-900"></div>
            </div>
        </div>

        {/* Horizontal Scroll Container (One at a time strategy) */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-8 -mx-4 px-8 sm:mx-0 sm:px-0 md:justify-center hide-scrollbar">
            {TEAM.map((member, index) => (
                <div key={index} className="snap-center shrink-0 w-[75vw] sm:w-[300px] flex flex-col items-center text-center group">
                    
                    {/* Minimalist Circular Image */}
                    <div className="w-48 h-48 rounded-full overflow-hidden mb-6 relative bg-brand-600 border-none transition-transform duration-300 group-hover:scale-105">
                         {/* Circle Background Effect */}
                         <div className="absolute inset-0 bg-brand-600 mix-blend-multiply opacity-100 z-0"></div>
                         <img 
                            src={member.image} 
                            alt={member.name} 
                            className="w-full h-full object-cover mix-blend-multiply filter grayscale contrast-125 group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-500 relative z-10" 
                         />
                    </div>

                    {/* Name */}
                    <h3 className="font-sans font-black text-2xl text-slate-900 mb-2 leading-none">
                        {member.name}
                    </h3>

                    {/* Content */}
                    <div className="font-serif text-slate-700 text-sm leading-relaxed max-w-xs mx-auto">
                         <p className="mb-2 font-bold text-brand-600 text-xs uppercase tracking-widest">
                            {member.role}
                         </p>
                         <p className="opacity-90 leading-relaxed">
                            {member.bio}
                         </p>
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