
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Share2, Twitter, Linkedin, Facebook, Link as LinkIcon, Eye, Check, AlertCircle, Loader2, Mail } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Story } from '../types';

// Extracted Component for Reusability
const IntrigueTakeBox: React.FC<{ text: string }> = ({ text }) => (
    <div className="my-10 md:my-14 bg-[#FDFBF7] p-8 md:p-10 border-l-4 border-brand-600 relative shadow-sm not-prose">
        <div className="flex items-center gap-2 mb-4">
            <span className="bg-slate-900 text-white text-[10px] font-sans font-black uppercase px-2 py-1 tracking-widest">
                The Intrigue Take
            </span>
        </div>
        <p className="text-lg md:text-xl font-serif font-medium italic text-slate-900 leading-relaxed whitespace-pre-line">
            "{text.trim()}"
        </p>
        <div className="mt-4 flex items-center gap-2">
            <div className="h-px bg-slate-300 w-8"></div>
            <span className="text-xs font-sans font-bold uppercase text-slate-400 tracking-widest">Editor's Desk</span>
        </div>
    </div>
);

// Helper to strip "The Intrigue Take" headers from text content
// Matches: "**The Intrigue Take**", "### The Intrigue Take", "The Intrigue Take:", etc.
const stripTakeHeader = (text: string): string => {
    // Regex breakdown:
    // ^[\s"']*       : Start with optional whitespace, quotes
    // (?:\*\*|##|__)? : Optional opening bold/header markdown
    // (?:The )?      : Optional "The"
    // (?:Intrigue|Bitcoin)\s+Take : Core phrase
    // (?:\*\*|##|__)? : Optional closing bold/header markdown
    // [:\s"']*       : Optional colon, quotes, whitespace
    const headerRegex = /^[\s"']*(?:\*\*|##|__)?(?:The\s+)?(?:Intrigue|Bitcoin)\s+Take(?:\*\*|##|__)?[:\s"']*/i;
    return text.replace(headerRegex, '').trim();
};

// Helper to strip "The Intrigue Take" if it appears at the END of a string (preceding the marker)
const stripTrailingHeader = (text: string): string => {
    const trailerRegex = /[\s"']*(?:\*\*|##|__)?(?:The\s+)?(?:Intrigue|Bitcoin)\s+Take(?:\*\*|##|__)?[:\s"']*$/i;
    return text.replace(trailerRegex, '').trim();
};

export const StoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  
  // Footer Subscribe State
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchStory = async () => {
        setLoading(true);
        // Try published first
        const published = await storageService.fetchPublishedIssue();
        let found = published?.stories.find(s => s.id === id);
        
        // If not found, search all issues (archives)
        if (!found) {
            const allIssues = await storageService.getAllIssues();
            for (const issue of allIssues) {
                const s = issue.stories.find(story => story.id === id);
                if (s) {
                    found = s;
                    break;
                }
            }
        }
        setStory(found || null);
        setLoading(false);
    };
    fetchStory();
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
        setSubscribeStatus('error');
        return;
    }
    
    try {
        await storageService.saveSubscriber({
            email,
            status: 'active',
            source: 'story_footer'
        });
        setSubscribeStatus('success');
        setEmail('');
    } catch (e) {
        setSubscribeStatus('error');
    }
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

  // --- SMART TEXT RENDERER ---
  const renderParagraph = (text: string, index: number, isLead: boolean) => {
    // 1. CLEANUP: Aggressive cleanup of accidental headers
    let cleanText = stripTakeHeader(text);
    if (!cleanText) return null; // Don't render empty paragraphs after cleanup

    // 2. CHECK FOR SUBHEADER: If text is short, starts with ##, or is purely bold
    const isHeaderPattern = cleanText.startsWith('#') || (cleanText.length < 60 && cleanText.startsWith('**') && !cleanText.includes('. '));
    
    if (isHeaderPattern) {
        const headerText = cleanText.replace(/^[#\s]+/, '').replace(/\*\*/g, '');
        return (
            <h3 key={`p-${index}`} className="text-2xl font-sans font-black text-slate-900 mt-12 mb-6 uppercase leading-tight tracking-tight">
                {headerText}
            </h3>
        );
    }

    // 3. PARSE BOLD (**text**)
    // We split by the bold marker, so even elements are normal, odd elements are bold
    const parts = cleanText.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={i} className="font-bold text-slate-900 bg-brand-50/80 decoration-brand-200 decoration-2 underline-offset-2">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return part;
    });

    // 4. STYLE FIRST PARAGRAPH (Editorial Lead)
    if (isLead) {
        return (
            <p key={`p-${index}`} className="text-xl md:text-2xl leading-relaxed text-slate-900 font-medium italic mb-10 border-l-4 border-brand-600 pl-6 py-1">
                {parts}
            </p>
        );
    }

    return (
        <p key={`p-${index}`} className="mb-8 text-lg md:text-[19px] leading-8 text-slate-700 font-serif tracking-wide">
            {parts}
        </p>
    );
  };

  // Process content to handle multi-paragraph Intrigue Takes
  const { processedNodes, hasInlineTake } = useMemo(() => {
      if (!story || !story.content) return { processedNodes: [], hasInlineTake: false };

      const nodes: React.ReactNode[] = [];
      const START = "---INTRIGUE-TAKE-START---";
      const END = "---INTRIGUE-TAKE-END---";
      
      let inTake = false;
      let takeBuffer = "";
      let foundTake = false;

      // Calculate approximate middle for inline CTA
      const ctaIndex = Math.max(1, Math.floor(story.content.length * 0.4));

      story.content.forEach((text, i) => {
          let currentText = text;

          // Check for CTA insertion
          const shouldInsertCTA = i === ctaIndex;

          // Case 1: Start and End in same paragraph
          if (currentText.includes(START) && currentText.includes(END)) {
              const [pre, rest] = currentText.split(START);
              const [take, post] = rest.split(END);

              const cleanedPre = stripTrailingHeader(pre);
              if (cleanedPre.trim()) nodes.push(renderParagraph(cleanedPre, i, i === 0));
              
              nodes.push(<IntrigueTakeBox key={`take-${i}`} text={stripTakeHeader(take)} />);
              foundTake = true;

              const cleanedPost = stripTakeHeader(post); // Clean post just in case
              if (cleanedPost.trim()) nodes.push(renderParagraph(cleanedPost, i + 0.5, false));
              
              if(shouldInsertCTA) nodes.push(<InlineSubscribeBox key={`cta-${i}`} />);
              return;
          }

          // Case 2: Start detected
          if (currentText.includes(START)) {
              inTake = true;
              const [pre, rest] = currentText.split(START);
              
              const cleanedPre = stripTrailingHeader(pre);
              if (cleanedPre.trim()) nodes.push(renderParagraph(cleanedPre, i, i === 0));
              
              takeBuffer = rest || "";
              
              if(shouldInsertCTA) nodes.push(<InlineSubscribeBox key={`cta-${i}`} />);
              return;
          }

          // Case 3: End detected
          if (currentText.includes(END)) {
              inTake = false;
              const [pre, post] = currentText.split(END);
              takeBuffer += (takeBuffer ? "\n\n" : "") + pre;
              
              nodes.push(<IntrigueTakeBox key={`take-${i}`} text={stripTakeHeader(takeBuffer)} />);
              takeBuffer = "";
              foundTake = true;

              const cleanedPost = stripTakeHeader(post);
              if (cleanedPost.trim()) nodes.push(renderParagraph(cleanedPost, i, false));
              
              if(shouldInsertCTA) nodes.push(<InlineSubscribeBox key={`cta-${i}`} />);
              return;
          }

          // Case 4: Inside Take
          if (inTake) {
              takeBuffer += (takeBuffer ? "\n\n" : "") + currentText;
              return;
          }

          // Case 5: Normal Paragraph
          // Pre-check: If this paragraph is JUST the header (likely appearing before the marker), skip it
          const cleanedText = stripTakeHeader(currentText);
          if (cleanedText) {
             nodes.push(renderParagraph(currentText, i, i === 0));
          }
          
          if(shouldInsertCTA) nodes.push(<InlineSubscribeBox key={`cta-${i}`} />);
      });

      // Edge Case: If take started but never ended (malformed), dump it at the end
      if (inTake && takeBuffer) {
           nodes.push(<IntrigueTakeBox key="take-dangling" text={stripTakeHeader(takeBuffer)} />);
           foundTake = true;
      }

      return { processedNodes: nodes, hasInlineTake: foundTake };
  }, [story]);

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-paper">
            <Loader2 className="animate-spin text-brand-600" size={40} />
        </div>
      );
  }

  if (!story) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-paper">
        <h2 className="text-3xl font-black text-slate-900 mb-4">Story Not Found</h2>
        <Link to="/" className="text-brand-600 font-bold uppercase underline">Return Home</Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-paper relative font-serif text-slate-900">
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-50 bg-paper">
        <div 
            className="h-full bg-brand-600 transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="max-w-[1400px] mx-auto px-4 py-6 md:py-8 flex justify-between items-center">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-sans font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Briefing</span>
        </Link>
        <div className="hidden md:flex gap-4">
             <button onClick={() => handleShare('twitter')} className="text-slate-400 hover:text-slate-900 transition-colors"><Twitter size={16} /></button>
             <button onClick={() => handleShare('linkedin')} className="text-slate-400 hover:text-slate-900 transition-colors"><Linkedin size={16} /></button>
             <button onClick={handleCopyLink} className="text-slate-400 hover:text-slate-900 transition-colors"><LinkIcon size={16} /></button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-[740px] mx-auto px-4 sm:px-6 pb-24">
        
        {/* Editorial Header */}
        <header className="text-center mb-10 md:mb-14">
            <div className="mb-6">
                <span className="bg-brand-100 text-brand-900 border border-brand-200 text-[10px] md:text-xs font-sans font-black uppercase px-3 py-1 tracking-widest inline-block">
                    {story.category}
                </span>
            </div>

            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl text-slate-900 leading-[1.1] tracking-tight mb-6">
                {story.headline}
            </h1>

            <div className="flex items-center justify-center gap-4 text-xs font-sans font-bold uppercase tracking-widest text-slate-400">
                <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={12} /> 4 min read</span>
            </div>
        </header>

        {/* Dashed Separator */}
        <div className="border-t border-dashed border-slate-400 w-full mb-10 opacity-50"></div>

        {/* Story Content */}
        <div className="prose prose-lg prose-slate max-w-none font-serif text-slate-800">
            {processedNodes}
            {story.content && story.content.length === 0 && (
                <div className="text-center py-10 italic text-slate-400">Content loading or unavailable...</div>
            )}
        </div>

        {/* The Intrigue Take - Editorial Note (Fallback if not rendered inline) */}
        {!hasInlineTake && story.intrigueTake && (
            <IntrigueTakeBox text={stripTakeHeader(story.intrigueTake)} />
        )}

        {/* Share Section Footer */}
        <div className="mt-16 pt-8 border-t border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="font-sans font-bold text-slate-900 uppercase tracking-widest text-xs">
                Share this story
            </div>
            <div className="flex gap-3">
                <button onClick={() => handleShare('twitter')} className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-brand-600 hover:text-white transition-all rounded-full">
                    <Twitter size={18} />
                </button>
                <button onClick={() => handleShare('linkedin')} className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-brand-600 hover:text-white transition-all rounded-full">
                    <Linkedin size={18} />
                </button>
                <button onClick={() => handleShare('facebook')} className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-brand-600 hover:text-white transition-all rounded-full">
                    <Facebook size={18} />
                </button>
                <button onClick={handleCopyLink} className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-brand-600 hover:text-white transition-all rounded-full relative">
                    {showCopyFeedback ? <Check size={18} /> : <LinkIcon size={18} />}
                </button>
            </div>
        </div>

      </div>

      {/* Footer CTA Band */}
      <div className="bg-brand-600 text-white py-16 px-4 relative overflow-hidden border-t-2 border-slate-900">
            {/* Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
            
            <div className="max-w-[600px] mx-auto text-center relative z-10">
                <h3 className="font-sans font-black text-3xl md:text-4xl uppercase leading-none mb-4">
                    Did this help you?
                </h3>
                <p className="text-brand-100 mb-8 font-serif text-lg">
                    Join 45,000+ investors who get this level of clarity delivered to their inbox every morning.
                </p>
                
                {subscribeStatus === 'success' ? (
                        <div className="flex h-12 md:h-14 items-center justify-center bg-slate-900 text-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] animate-fade-in">
                        <Check className="mr-2" size={20} />
                        <span className="font-sans font-bold uppercase tracking-wide text-sm">You're on the list!</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if(subscribeStatus === 'error') setSubscribeStatus('idle');
                            }}
                            placeholder="Enter your email" 
                            className="flex-grow px-4 py-3 bg-white/10 border border-brand-400 focus:bg-white focus:text-slate-900 focus:border-white focus:outline-none transition-colors text-white placeholder:text-brand-200 rounded-sm"
                        />
                        <button type="submit" className="bg-slate-900 text-white font-sans font-black uppercase px-6 py-3 hover:bg-slate-800 transition-colors whitespace-nowrap rounded-sm shadow-[4px_4px_0px_0px_rgba(15,23,42,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                            Subscribe
                        </button>
                    </form>
                )}
            </div>
      </div>

    </article>
  );
};

// Inline CTA Component - Updated to match project colors (Slate/Brand)
const InlineSubscribeBox: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.includes('@')) {
            setStatus('error');
            return;
        }
        try {
            await storageService.saveSubscriber({ email, status: 'active', source: 'story_inline_cta' });
            setStatus('success');
        } catch (e) {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="my-10 p-8 bg-slate-900 text-center animate-fade-in not-prose rounded-sm border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(234,88,12,1)]">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-4">
                    <Check className="text-white" size={24} strokeWidth={3} />
                </div>
                <h4 className="font-sans font-black text-white text-xl uppercase mb-2">Welcome Aboard</h4>
                <p className="text-slate-400 font-serif text-sm">We've added {email} to the list.</p>
            </div>
        );
    }

    return (
        <div className="my-12 py-10 px-6 md:px-10 bg-slate-900 relative overflow-hidden not-prose shadow-[8px_8px_0px_0px_rgba(234,88,12,1)] rounded-sm group border-2 border-slate-900">
            {/* Abstract Background Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            <div className="relative z-10 text-center">
                <div className="inline-block bg-brand-600 text-white text-[10px] font-sans font-black uppercase px-2 py-1 mb-4 tracking-widest border border-slate-900 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
                    Free Daily Briefing
                </div>

                <h3 className="font-sans font-black text-2xl md:text-3xl text-white mb-3 leading-tight tracking-tight uppercase">
                    Bitcoin, <br/> <span className="text-brand-600">Translated.</span>
                </h3>
                <p className="text-slate-300 font-serif text-base mb-6 max-w-md mx-auto">
                    Join 45,000+ investors who start their day with clarity, not chaos.
                </p>

                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto shadow-lg">
                    <input 
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if(status === 'error') setStatus('idle');
                        }}
                        placeholder="Your email address..."
                        className="flex-grow px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none rounded-t-sm sm:rounded-l-sm sm:rounded-tr-none min-w-0 font-medium"
                    />
                    <button className="bg-brand-600 hover:bg-brand-500 text-white font-sans font-black uppercase text-sm px-6 py-3 transition-colors whitespace-nowrap rounded-b-sm sm:rounded-r-sm sm:rounded-bl-none border-l-2 border-slate-900">
                        Join Free
                    </button>
                </form>
                <div className="mt-4 text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest">
                    No spam. Unsubscribe anytime.
                </div>
            </div>
        </div>
    );
};
