import React, { useEffect } from 'react';
import { MeetTheTeam } from './MeetTheTeam';
import { NewsletterCTA } from './NewsletterCTA';
import { Target, Shield, Zap, Globe, Check, X } from 'lucide-react';

export const AboutPage: React.FC = () => {
    
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-paper relative">
      {/* Hero */}
      <section className="pt-16 pb-12 md:pt-32 md:pb-20 px-4 relative overflow-hidden border-b border-slate-900">
         <div className="max-w-[1400px] mx-auto text-center relative z-10">
            <div className="inline-block bg-brand-200 text-slate-900 text-[10px] md:text-xs font-black uppercase tracking-widest px-2 py-1 mb-6 border border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                OUR MISSION
            </div>
            <h1 className="font-sans font-black text-5xl sm:text-6xl md:text-8xl text-slate-900 mb-8 leading-[0.9] tracking-tighter uppercase">
                Bitcoin without <br/>
                <span className="text-brand-600">the Hype.</span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-800 font-serif mb-10 max-w-3xl mx-auto leading-relaxed">
                Most Bitcoin content is written for people who are already obsessed with Bitcoin. Traders. Developers. People who have a "portfolio." We write for everyone else — the curious, the cautious, and the people who just want to know what they bought.
            </p>
         </div>
      </section>

      {/* The Problem / Solution */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-900">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                
                {/* The Noise */}
                <div className="p-8 bg-stone-100 border-2 border-slate-200 relative overflow-hidden group hover:border-slate-300 transition-colors">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')]"></div>
                    <h3 className="font-black text-2xl text-slate-400 uppercase mb-6 flex items-center gap-3 relative z-10">
                        <span className="w-3 h-3 bg-slate-400 rounded-full"></span> The Noise
                    </h3>
                    <ul className="space-y-5 font-serif text-slate-500 relative z-10">
                        <li className="flex gap-4 items-start">
                            <X className="shrink-0 mt-1" size={18} />
                            <span>100-page technical whitepapers that no one reads</span>
                        </li>
                        <li className="flex gap-4 items-start">
                            <X className="shrink-0 mt-1" size={18} />
                            <span>"To the moon" hype bros and fear-mongering</span>
                        </li>
                        <li className="flex gap-4 items-start">
                            <X className="shrink-0 mt-1" size={18} />
                            <span>Anxiety-inducing charts and volatility</span>
                        </li>
                    </ul>
                </div>

                {/* The Signal */}
                <div className="p-8 bg-brand-50 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] relative transform md:-rotate-1 hover:rotate-0 transition-transform duration-300">
                     <h3 className="font-black text-2xl text-slate-900 uppercase mb-6 flex items-center gap-3">
                        <span className="w-3 h-3 bg-brand-600 rounded-full animate-pulse"></span> The Intrigue Way
                    </h3>
                    <ul className="space-y-5 font-serif text-slate-900 font-medium">
                        <li className="flex gap-4 items-start">
                            <div className="bg-brand-600 text-white rounded-full p-0.5 mt-0.5"><Check size={12} strokeWidth={3} /></div>
                            <span>5-minute daily reads for normal people</span>
                        </li>
                        <li className="flex gap-4 items-start">
                            <div className="bg-brand-600 text-white rounded-full p-0.5 mt-0.5"><Check size={12} strokeWidth={3} /></div>
                            <span>Calm, rational analysis rooted in facts</span>
                        </li>
                        <li className="flex gap-4 items-start">
                             <div className="bg-brand-600 text-white rounded-full p-0.5 mt-0.5"><Check size={12} strokeWidth={3} /></div>
                            <span>Plain English explanations of complex topics</span>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black uppercase text-slate-900 tracking-tight">What We Believe</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8">
                {[
                    { icon: Target, title: "Signal Over Noise", desc: "Hundreds of Bitcoin stories happen every day. Most of them don't matter to you. We read everything and tell you the one thing that does." },
                    { icon: Shield, title: "Journalists, Not Influencers", desc: "We don't hold Bitcoin. We don't have affiliate deals. We verify sources and we don't get paid to say nice things about products." },
                    { icon: Globe, title: "The World, Not Just The Charts", desc: "Bitcoin is happening in El Salvador, in Lagos, in Brussels, in a garage in Texas. We cover all of it — not just the price." },
                    { icon: Zap, title: "We Respect Your Time", desc: "You're busy. Five minutes. One story. We get to the point and we stop." }
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center text-center group">
                        <div className="w-20 h-20 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center mb-6 group-hover:shadow-[6px_6px_0px_0px_rgba(234,88,12,1)] group-hover:border-brand-600 transition-all duration-300">
                            <item.icon size={32} strokeWidth={1.5} className="text-slate-900 group-hover:text-brand-600 transition-colors" />
                        </div>
                        <h4 className="font-black text-xl uppercase mb-3 text-slate-900">{item.title}</h4>
                        <p className="font-serif text-slate-600 text-sm leading-relaxed max-w-xs">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <MeetTheTeam />
      <NewsletterCTA />
    </div>
  );
};