
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Clock } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Story } from '../types';
import { BRIEFING_CONTENT } from '../constants';

// Extended type to include date context from the parent Issue
interface StoryWithContext extends Story {
  date: string;
  issueId: string;
  issueNumber: number;
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

export const ArticlesPage: React.FC = () => {
  const [allStories, setAllStories] = useState<StoryWithContext[]>([]);
  const [filteredStories, setFilteredStories] = useState<StoryWithContext[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadContent = async () => {
      setLoading(true);
      try {
        const issues = await storageService.getAllIssues();
        
        // If DB is empty, use the static content as a fallback so the page isn't empty
        const sourceIssues = issues.length > 0 ? issues : [BRIEFING_CONTENT];

        // Flatten stories and add context (date, issue #)
        const flattened: StoryWithContext[] = sourceIssues.flatMap(issue => 
          (issue.stories || []).map(story => ({
            ...story,
            date: issue.date,
            issueId: issue.id,
            issueNumber: issue.issueNumber
          }))
        );

        // Sort by Issue Number desc (newest first)
        flattened.sort((a, b) => b.issueNumber - a.issueNumber);

        const uniqueCategories = Array.from(new Set(flattened.map(s => s.category)));
        
        setAllStories(flattened);
        setFilteredStories(flattened);
        setCategories(['All', ...uniqueCategories]);
      } catch (e) {
          console.error("Failed to load articles", e);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  useEffect(() => {
    let result = allStories;

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(s => s.category === selectedCategory);
    }

    // Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.headline.toLowerCase().includes(q) || 
        (s.content && s.content.some(p => p.toLowerCase().includes(q)))
      );
    }

    setFilteredStories(result);
  }, [selectedCategory, searchQuery, allStories]);

  const isDefaultView = selectedCategory === 'All' && !searchQuery;
  const heroStory = filteredStories[0];
  const sidebarStories = filteredStories.slice(1, 4);
  const gridStories = isDefaultView ? filteredStories.slice(4) : filteredStories;

  return (
    <div className="min-h-screen bg-paper relative font-sans text-slate-900 pt-10 pb-20">
      {/* Background Noise */}
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none fixed"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <header className="mb-12 border-b-2 border-slate-900 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
                <div>
                    <h1 className="font-black text-6xl md:text-8xl uppercase tracking-tighter leading-[0.85]">
                        Intrigue's <br/> <span className="text-brand-600">Latest</span>
                    </h1>
                </div>
                <div className="lg:max-w-md lg:text-right">
                    <p className="font-serif text-lg md:text-xl leading-tight text-slate-800">
                        The global affairs briefing you’ll actually look forward to reading.
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-dashed border-slate-400 pt-6">
                
                {/* Categories */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`text-xs font-black uppercase tracking-widest transition-colors ${
                                selectedCategory === cat 
                                ? 'text-brand-600 underline decoration-2 underline-offset-4' 
                                : 'text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="SEARCH ARCHIVE..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-b border-slate-300 px-0 py-2 pl-6 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-brand-600"
                    />
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                </div>
            </div>
        </header>

        {loading ? (
            <div className="text-center py-32">
                <div className="animate-spin w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full mx-auto mb-4"></div>
                <div className="font-black uppercase text-slate-300 tracking-widest">Loading Intelligence...</div>
            </div>
        ) : filteredStories.length === 0 ? (
            <div className="text-center py-20 border-t border-dashed border-slate-400">
                <p className="text-2xl font-black uppercase text-slate-300 mb-4">No stories found</p>
                <button onClick={() => {setSearchQuery(''); setSelectedCategory('All');}} className="text-brand-600 font-bold underline">Clear Filters</button>
            </div>
        ) : (
            <div className="space-y-16">
                
                {/* 1. MAGAZINE LAYOUT (Only on default view) */}
                {isDefaultView && heroStory && (
                    <section className="grid lg:grid-cols-12 gap-12 border-b-2 border-slate-900 pb-16 border-dashed">
                        
                        {/* HERO STORY (Left) */}
                        <div className="lg:col-span-8 group cursor-pointer">
                            <Link to={`/story/${heroStory.id}`}>
                                <div className="aspect-video bg-[#e8e4db] mb-6 overflow-hidden relative border border-slate-200">
                                    {heroStory.image ? (
                                        <img src={heroStory.image} alt={heroStory.headline} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-10">
                                            <div className="w-32 h-32 rounded-full border-4 border-slate-900"></div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                </div>
                                
                                <h2 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] text-slate-900 mb-4 group-hover:text-brand-600 transition-colors">
                                    {heroStory.headline}
                                </h2>
                                
                                <p className="font-serif text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mb-4 line-clamp-3">
                                    {stripMarkdown(heroStory.content?.[0])}
                                </p>

                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="text-slate-900">{heroStory.category}</span>
                                    <span>•</span>
                                    <span>{heroStory.date}</span>
                                </div>
                            </Link>
                        </div>

                        {/* SIDEBAR (Right) */}
                        <div className="lg:col-span-4 flex flex-col pt-2 border-t lg:border-t-0 border-slate-200 lg:border-l lg:border-dashed lg:pl-12">
                            <h3 className="font-bold uppercase text-xs tracking-widest text-slate-500 mb-6 bg-[#e8e4db] inline-block px-3 py-1 self-start">Latest Articles</h3>
                            
                            <div className="flex flex-col divide-y divide-slate-300/50">
                                {sidebarStories.map(story => (
                                    <Link key={story.id} to={`/story/${story.id}`} className="py-6 first:pt-0 group block">
                                        <h4 className="font-black text-xl md:text-2xl uppercase leading-none text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                                            {story.headline}
                                        </h4>
                                        <p className="font-serif text-sm text-slate-600 leading-relaxed line-clamp-2 mb-3">
                                            {stripMarkdown(story.content?.[0])}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span>{story.category}</span>
                                            <span>•</span>
                                            <span>{story.date}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* 2. ARCHIVE GRID */}
                <section>
                    {isDefaultView && (
                        <div className="flex items-center gap-4 mb-10">
                            <h3 className="font-black uppercase text-3xl md:text-4xl text-slate-900">More Articles</h3>
                            <div className="h-px bg-slate-300 flex-grow border-b border-dashed border-slate-300"></div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                        {gridStories.map(story => (
                             <div key={story.id} className="group flex flex-col h-full">
                                <Link to={`/story/${story.id}`} className="block mb-4 overflow-hidden bg-[#e8e4db] aspect-[4/3] border border-transparent hover:border-slate-300 transition-colors">
                                    {story.image ? (
                                        <img src={story.image} alt={story.headline} className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-5">
                                            <div className="w-16 h-16 rounded-full border-2 border-slate-900"></div>
                                        </div>
                                    )}
                                </Link>

                                <div className="flex flex-col flex-grow">
                                    <div className="mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b-2 border-transparent group-hover:border-brand-600 group-hover:text-brand-600 transition-all pb-0.5 inline-block">
                                            {story.category}
                                        </span>
                                    </div>

                                    <Link to={`/story/${story.id}`}>
                                        <h3 className="font-black text-2xl uppercase leading-[0.95] text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                                            {story.headline}
                                        </h3>
                                    </Link>

                                    <p className="font-serif text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4 flex-grow">
                                        {stripMarkdown(story.content?.[0])}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-dashed border-slate-300 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <span>{story.date}</span>
                                        <Link to={`/story/${story.id}`} className="flex items-center gap-1 text-slate-900 hover:text-brand-600 transition-colors">
                                            Read <ArrowRight size={10} />
                                        </Link>
                                    </div>
                                </div>
                             </div>
                        ))}
                    </div>
                </section>
            </div>
        )}

      </div>
    </div>
  );
};
