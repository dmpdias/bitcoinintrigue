
import React from 'react';
import { BriefingData } from '../types';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BriefingProps {
  data: BriefingData | null;
}

// Helper to clean markdown for preview text
const stripMarkdown = (text: string | undefined) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/^#+\s*/g, '')
    .replace(/`/g, '')
    .trim();
};

export const Briefing: React.FC<BriefingProps> = ({ data }) => {
  if (!data) return null;
  
  const featuredStory = data.stories[0];
  const sideStories = data.stories.slice(1, 5);

  return (
    <section id="latest" className="py-8 md:py-12 lg:py-24 bg-paper">
        <div className="max-w-[1400px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">

            <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 sm:mb-8 md:mb-12 lg:mb-16 gap-4 md:gap-6">
                <div>
                    <div className="inline-block bg-brand-200 text-slate-900 text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-2 border border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] xs:shadow-[1.5px_1.5px_0px_0px_rgba(15,23,42,1)] sm:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                        Latest Stories
                    </div>
                    <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9]">
                        The Daily <span className="text-brand-600">Dispatch</span>
                    </h2>
                </div>

                <div className="text-left md:text-right">
                    <p className="text-[10px] xs:text-xs sm:text-sm md:text-base font-serif text-slate-800 leading-relaxed mb-1.5 xs:mb-2">
                        Issue #{data.issueNumber} • {data.date}
                    </p>
                    <div className="h-0.5 xs:h-1 w-12 bg-slate-900 md:ml-auto"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
                
                <div className="lg:col-span-7 flex flex-col">
                    <div className="mb-3 md:mb-4">
                        <span className="bg-[#fbbf24] text-slate-900 font-bold uppercase text-[10px] md:text-xs px-2 md:px-3 py-1 tracking-widest inline-block">
                            Featured
                        </span>
                    </div>
                    
                    {featuredStory && (
                        <>
                            <Link to={`/story/${featuredStory.id}`} className="block w-full aspect-video bg-stone-200 mb-4 md:mb-6 relative overflow-hidden group">
                                <img
                                    src={featuredStory.image || "https://picsum.photos/800/400?grayscale"}
                                    alt="Featured"
                                    loading="lazy"
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                            </Link>

                            <Link to={`/story/${featuredStory.id}`} className="block group">
                                <h3 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-slate-900 mb-3 md:mb-4 leading-[0.95] tracking-tight group-hover:text-brand-600 transition-colors">
                                    {featuredStory.headline}
                                </h3>
                            </Link>
                            
                            <p className="text-base md:text-lg text-slate-700 font-medium mb-4 leading-relaxed line-clamp-3">
                                {stripMarkdown(featuredStory.content?.[0])}
                            </p>

                            <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-auto">
                                <span className="text-slate-900">{featuredStory.category}</span>
                                <span>•</span>
                                <span>Today</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="lg:col-span-5 flex flex-col gap-0 mt-8 lg:mt-0">
                    <div className="bg-[#e8e4db] px-4 md:px-6 py-2 mb-4 md:mb-6 uppercase text-[10px] md:text-xs font-bold text-slate-600 tracking-widest inline-block self-start">
                        Market Pulse
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
                                            {stripMarkdown(story.content?.[0])}
                                        </p>
                                        <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span className="text-slate-800">{story.category}</span>
                                            <span>•</span>
                                            <span>Today</span>
                                        </div>
                                    </div>
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 shrink-0 relative overflow-hidden">
                                        <img src={story.image || "https://picsum.photos/200/200?grayscale"} alt={story.headline} loading="lazy" className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 rounded-full border border-white/20"></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-slate-900 inline-block">
                        <Link to="/articles" className="font-bold text-slate-900 uppercase text-xs md:text-sm tracking-widest hover:text-brand-600 flex items-center gap-2">
                            View More Articles <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    </section>
  );
};
