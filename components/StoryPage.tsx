import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BRIEFING_CONTENT } from '../constants';
import { ArrowLeft, Clock, Share2, Twitter, Linkedin, Facebook, Link as LinkIcon, Eye, Check, AlertCircle } from 'lucide-react';

export const StoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const story = BRIEFING_CONTENT.stories.find(s => s.id === id);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
        setSubscribeStatus('error');
        return;
    }
    
    setSubscribeStatus('success');
    setEmail('');
  };

  const currentUrl = window.location.href;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(story?.headline || 'Check out this story from Bitcoin Intrigue');

  const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
      let url = '';
      switch (platform) {
          case 'twitter':
              url = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
              break;
          case 'linkedin':
              url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
              break;
          case 'facebook':
              url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
              break;
      }
      window.open(url, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(currentUrl).then(() => {
          setShowCopyFeedback(true);
          setTimeout(() => setShowCopyFeedback(false), 2000);
      });
  };

  if (!story) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-paper">
        <h2 className="text-3xl font-black text-slate-900 mb-4">Story Not Found</h2>
        <Link to="/" className="text-brand-600 font-bold uppercase underline">Return Home</Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-paper relative">
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-50 bg-slate-200">
        <div 
            className="h-full bg-brand-600 transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
        ></div>
      </div>

      {/* Back Nav */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-600 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Briefing</span>
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-24">
        <div className="flex flex-col lg:flex-row gap-12 relative">
            
            {/* LEFT: Sticky Share Sidebar (Desktop) */}
            <aside className="hidden lg:block w-24 shrink-0 relative">
                <div className="sticky top-32 flex flex-col gap-4 items-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 rotate-180 writing-vertical-lr mb-2">
                        Share Story
                    </div>
                    <button 
                        onClick={() => handleShare('twitter')}
                        className="w-10 h-10 rounded-full border-2 border-slate-900 bg-paper flex items-center justify-center text-slate-900 hover:text-white hover:bg-slate-900 transition-colors"
                        title="Share on Twitter"
                    >
                        <Twitter size={18} />
                    </button>
                    <button 
                        onClick={() => handleShare('linkedin')}
                        className="w-10 h-10 rounded-full border-2 border-slate-900 bg-paper flex items-center justify-center text-slate-900 hover:text-white hover:bg-slate-900 transition-colors"
                        title="Share on LinkedIn"
                    >
                        <Linkedin size={18} />
                    </button>
                    <button 
                        onClick={() => handleShare('facebook')}
                        className="w-10 h-10 rounded-full border-2 border-slate-900 bg-paper flex items-center justify-center text-slate-900 hover:text-white hover:bg-slate-900 transition-colors"
                        title="Share on Facebook"
                    >
                        <Facebook size={18} />
                    </button>
                    <div className="relative mt-2 group">
                        <button 
                            onClick={handleCopyLink}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors bg-paper ${showCopyFeedback ? 'border-green-500 text-green-500 bg-green-50' : 'border-slate-900 text-slate-900 hover:text-white hover:bg-slate-900'}`}
                            title="Copy Link"
                        >
                            {showCopyFeedback ? <Check size={18} /> : <LinkIcon size={18} />}
                        </button>
                        {showCopyFeedback && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-900 text-white text-[10px] font-bold uppercase px-2 py-1 rounded whitespace-nowrap animate-fade-in">
                                Copied!
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* MIDDLE: Main Content */}
            <main className="flex-grow max-w-4xl">
                
                {/* Header Section */}
                <header className="mb-8 md:mb-12">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="bg-brand-600 text-white text-[10px] md:text-xs font-bold uppercase px-3 py-1.5 tracking-widest shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                            {story.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest border-l border-slate-300 pl-3">
                            <Clock size={14} />
                            4 min read
                        </span>
                        {/* Mobile Share (Visible only on mobile) */}
                        <div className="ml-auto lg:hidden flex gap-3 text-slate-400">
                             <button onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: story.headline,
                                        url: window.location.href
                                    });
                                } else {
                                    handleCopyLink();
                                }
                             }}>
                                <Share2 size={20} />
                             </button>
                        </div>
                    </div>

                    <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-slate-900 leading-[0.95] tracking-tight mb-8">
                        {story.headline}
                    </h1>

                    {/* Author Bar */}
                    <div className="flex items-center gap-4 py-6 border-y border-slate-200">
                        <div className="w-12 h-12 bg-slate-100 rounded-full border-2 border-slate-200 p-0.5 shrink-0">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${story.id}`} alt="Author" className="w-full h-full rounded-full" />
                        </div>
                        <div className="flex-grow">
                             <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-slate-900 text-sm uppercase tracking-wide">The Intrigue Team</span>
                                <span className="text-brand-600 text-[10px] font-black uppercase bg-brand-100 px-1.5 py-0.5 rounded-sm">Verified</span>
                             </div>
                             <div className="text-slate-500 text-xs font-serif italic">
                                Published on {BRIEFING_CONTENT.date} • {BRIEFING_CONTENT.issueNumber} Issues
                             </div>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                {story.image && (
                    <figure className="mb-10 md:mb-14 group relative">
                        <div className="aspect-video w-full bg-stone-200 overflow-hidden border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                            <img 
                                src={story.image} 
                                alt={story.headline} 
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                        <figcaption className="text-[10px] md:text-xs text-slate-500 mt-3 font-medium uppercase tracking-widest text-right">
                            Image: Market Data / Unsplash
                        </figcaption>
                    </figure>
                )}

                {/* Content Body */}
                <div className="prose prose-lg md:prose-xl prose-slate max-w-none font-serif text-slate-800 leading-relaxed mb-16">
                    {story.content.map((paragraph, index) => (
                        <p key={index} className="mb-8 first:drop-cap first:first-letter:text-6xl md:first:first-letter:text-7xl first:first-letter:font-black first:first-letter:mr-3 first:first-letter:float-left first:first-letter:leading-[0.85] first:first-letter:mt-2 first:first-letter:text-slate-900">
                            {paragraph}
                        </p>
                    ))}
                </div>

                {/* THE INTRIGUE TAKE - ALWAYS PRESENT */}
                <div className="mb-16 bg-brand-50 border-2 border-slate-900 p-8 md:p-10 relative shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                     <div className="absolute -top-5 left-8 bg-brand-600 text-white px-4 py-2 border-2 border-slate-900 shadow-sm flex items-center gap-2">
                        <Eye size={20} strokeWidth={2.5} />
                        <span className="font-black uppercase tracking-widest text-xs">The Intrigue Take</span>
                     </div>
                     
                     <p className="font-sans text-lg md:text-2xl font-bold text-slate-900 leading-tight">
                        {story.intrigueTake || "This story matters because it shows a fundamental shift in how the market perceives value. When in doubt, zoom out."}
                     </p>
                     <div className="mt-6 flex items-center gap-3">
                         <div className="h-0.5 w-12 bg-slate-900 opacity-20"></div>
                         <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Editor's Note</div>
                     </div>
                </div>

                {/* BOTTOM SHARE SECTION */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-t-2 border-slate-100 pt-8 mb-16 gap-6">
                    <div className="font-bold text-slate-900 uppercase tracking-widest text-sm">
                        Share this story
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button 
                            onClick={() => handleShare('twitter')}
                            className="w-12 h-12 rounded-full border-2 border-slate-900 bg-paper text-slate-900 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                            title="Share on Twitter"
                        >
                            <Twitter size={20} />
                        </button>
                        <button 
                            onClick={() => handleShare('linkedin')}
                            className="w-12 h-12 rounded-full border-2 border-slate-900 bg-paper text-slate-900 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                            title="Share on LinkedIn"
                        >
                            <Linkedin size={20} />
                        </button>
                        <button 
                            onClick={() => handleShare('facebook')}
                            className="w-12 h-12 rounded-full border-2 border-slate-900 bg-paper text-slate-900 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                            title="Share on Facebook"
                        >
                            <Facebook size={20} />
                        </button>
                        <button 
                            onClick={handleCopyLink}
                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] bg-paper ${showCopyFeedback ? 'border-green-500 text-green-600 bg-green-50' : 'border-slate-900 text-slate-900 hover:border-slate-900 hover:text-white hover:bg-slate-900'}`}
                            title="Copy Link"
                        >
                            {showCopyFeedback ? <Check size={20} /> : <LinkIcon size={20} />} 
                        </button>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="bg-slate-900 text-stone-200 p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <h3 className="font-sans font-black text-2xl md:text-4xl text-white mb-4 uppercase leading-none">
                            Did this help you?
                        </h3>
                        <p className="text-stone-400 mb-8 text-lg font-serif max-w-xl">
                            Join 45,000+ investors who get this level of clarity delivered to their inbox every morning. Free forever.
                        </p>
                        
                        {subscribeStatus === 'success' ? (
                             <div className="flex h-14 md:h-16 items-center px-6 bg-brand-600 border border-white animate-fade-in max-w-lg">
                                <Check className="text-white mr-3" size={24} />
                                <span className="font-black text-white text-base sm:text-lg uppercase tracking-wide">Thanks for subscribing!</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="max-w-xl">
                                <div className={`flex flex-col sm:flex-row gap-0 border-2 ${subscribeStatus === 'error' ? 'border-red-500' : 'border-white/20'}`}>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if(subscribeStatus === 'error') setSubscribeStatus('idle');
                                        }}
                                        placeholder="Enter your email" 
                                        className="flex-grow px-6 py-4 bg-white/10 focus:bg-white text-white focus:text-slate-900 focus:outline-none placeholder:text-stone-500 transition-colors"
                                    />
                                    <button type="submit" className="bg-brand-600 text-white font-black uppercase px-8 py-4 hover:bg-brand-500 transition-colors whitespace-nowrap">
                                        Subscribe Free
                                    </button>
                                </div>
                                {subscribeStatus === 'error' && (
                                    <p className="text-red-400 text-xs font-bold flex items-center gap-1.5 mt-2 animate-fade-in">
                                        <AlertCircle size={12} />
                                        Please enter a valid email address
                                    </p>
                                )}
                            </form>
                        )}
                    </div>
                </div>

            </main>

            {/* RIGHT: Empty or Related (Hidden on mobile) */}
            <aside className="hidden xl:block w-48 shrink-0">
                {/* Could add related stories here later */}
            </aside>

        </div>
      </div>
    </article>
  );
};