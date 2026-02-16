import React from 'react';
import { BRIEFING_CONTENT } from '../constants';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Briefing: React.FC = () => {
  const featuredStory = BRIEFING_CONTENT.stories[0];
  const sideStories = BRIEFING_CONTENT.stories.slice(1, 4);

  return (
    <section id="latest" className="py-12 md:py-24 bg-paper">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header - Unified Design */}
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 md:mb-16 gap-6">
                <div>
                    <div className="inline-block bg-brand-200 text-slate-900 text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-2 border border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                        Latest Stories
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9]">
                        The Daily <span className="text-brand-600">Dispatch</span>
                    </h2>
                </div>
                
                <div className="max-w-md">
                    <p className="text-sm md:text-base font-serif text-slate-800 leading-relaxed mb-2">
                        Global signals, separated from the noise.
                    </p>
                    <div className="h-1 w-12 bg-slate-900"></div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 md:gap-12">
                
                {/* FEATURED STORY (Left Column) */}
                <div className="lg:col-span-7 flex flex-col">
                    <div className="mb-3 md:mb-4">
                        <span className="bg-[#fbbf24] text-slate-900 font-bold uppercase text-[10px] md:text-xs px-2 md:px-3 py-1 tracking-widest inline-block">
                            Featured
                        </span>
                    </div>
                    
                    {/* Image */}
                    <Link to={`/story/${featuredStory.id}`} className="block w-full aspect-video bg-stone-200 mb-4 md:mb-6 relative overflow-hidden group">
                        <img 
                            src="https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=2069&auto=format&fit=crop" 
                            alt="Featured" 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                    </Link>

                    {/* Content */}
                    <Link to={`/story/${featuredStory.id}`} className="block group">
                        <h3 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-slate-900 mb-3 md:mb-4 leading-[0.95] tracking-tight group-hover:text-brand-600 transition-colors">
                            {featuredStory.headline}
                        </h3>
                    </Link>
                    
                    <p className="text-base md:text-lg text-slate-700 font-medium mb-4 leading-relaxed line-clamp-3">
                        {featuredStory.content[0]}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-auto">
                        <span className="text-slate-900">{featuredStory.category}</span>
                        <span>•</span>
                        <span>{BRIEFING_CONTENT.date}</span>
                    </div>
                </div>

                {/* SIDE LIST (Right Column) */}
                <div className="lg:col-span-5 flex flex-col gap-0 mt-8 lg:mt-0">
                    <div className="bg-[#e8e4db] px-4 md:px-6 py-2 mb-4 md:mb-6 uppercase text-[10px] md:text-xs font-bold text-slate-600 tracking-widest inline-block self-start">
                        Latest Stories
                    </div>

                    <div className="flex flex-col divide-y divide-slate-300">
                        {sideStories.map((story) => (
                            <Link key={story.id} to={`/story/${story.id}`} className="block py-6 md:py-8 first:pt-0 group cursor-pointer">
                                <div className="flex gap-4 md:gap-6">
                                    <div className="flex-1">
                                        <h4 className="font-sans font-black text-lg md:text-2xl text-slate-900 mb-2 md:mb-3 leading-tight group-hover:text-brand-600 transition-colors">
                                            {story.headline}
                                        </h4>
                                        <p className="text-slate-600 text-xs md:text-sm font-medium mb-2 md:mb-3 line-clamp-2 leading-relaxed">
                                            {story.content[0]}
                                        </p>
                                        <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span className="text-slate-800">{story.category}</span>
                                            <span>•</span>
                                            <span>Today</span>
                                        </div>
                                    </div>
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-[#e8e4db] shrink-0 relative overflow-hidden rounded-sm md:rounded-none">
                                        {/* Placeholder pattern for thumbnail */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-slate-900"></div>
                                        </div>
                                        {/* Fallback image simulation if needed, or actual image */}
                                        {story.image && (
                                            <img src={story.image} className="absolute inset-0 w-full h-full object-cover grayscale" />
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-slate-900 inline-block">
                        <Link to="/" className="font-bold text-slate-900 uppercase text-xs md:text-sm tracking-widest hover:text-brand-600 flex items-center gap-2">
                            View More Articles <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    </section>
  );
};