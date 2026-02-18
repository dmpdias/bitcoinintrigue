
import React, { useState } from 'react';
import { Award, Star, Inbox, Clock, Battery, Wifi, Bitcoin, Menu, Check, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';

export const Hero: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
        setStatus('error');
        return;
    }
    
    setStatus('loading');
    try {
      await storageService.saveSubscriber({
        email: email,
        status: 'active',
        source: 'homepage_hero'
      });
      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const companies = [
    { name: "Apple", style: "font-semibold" },
    { name: "Google", style: "font-bold" },
    { name: "Whole Foods", style: "font-serif italic" },
    { name: "AIRBNB", style: "font-black tracking-widest uppercase" },
    { name: "Tesla", style: "font-bold tracking-wider" },
    { name: "Coinbase", style: "font-sans font-black text-brand-700" },
    { name: "Amazon", style: "font-bold" },
    { name: "Microsoft", style: "font-semibold" },
    { name: "Nvidia", style: "font-black uppercase" },
    { name: "Meta", style: "font-bold tracking-tight" },
  ];

  const marqueeList = [...companies, ...companies];

  return (
    <section className="relative pt-4 md:pt-16 lg:pt-20 pb-6 md:pb-8 lg:pb-12 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-5 md:gap-6 lg:gap-8 items-center">

          <div className="w-full lg:col-span-6 order-1 lg:order-2 relative h-[200px] sm:h-[280px] md:h-[500px] lg:h-[600px] flex items-center justify-center lg:justify-end z-0 mt-0 lg:mt-0">

            <div className="absolute top-1 sm:top-3 md:top-4 left-1 sm:left-3 md:left-4 w-[80%] sm:w-[78%] md:w-[80%] bg-[#f4f1ea] rounded-lg border-2 border-slate-900 shadow-xl overflow-hidden transform -rotate-2 z-0 block lg:block h-[150px] sm:h-[220px] md:h-[380px] lg:h-[450px]">
                <div className="h-6 sm:h-8 bg-[#e8e4db] border-b border-slate-200 flex items-center px-2 sm:px-4 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-400"></div>
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-400"></div>
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-400"></div>
                    </div>
                    <div className="flex-grow mx-2 sm:mx-4 bg-[#f4f1ea] border border-slate-300 h-4 sm:h-5 rounded-sm text-[8px] sm:text-[10px] text-slate-500 flex items-center px-2 font-mono">
                        mail.google.com/inbox
                    </div>
                </div>
                
                <div className="flex flex-grow h-full">
                    <div className="w-20 sm:w-32 bg-[#e8e4db]/50 border-r border-slate-200 p-2 sm:p-3 hidden xs:block">
                         <div className="space-y-1 sm:space-y-2">
                             <div className="flex items-center gap-2 px-2 py-1 bg-brand-100 rounded text-brand-700">
                                <Inbox size={12} className="sm:w-4 sm:h-4" />
                                <span className="text-[8px] sm:text-xs font-bold">Inbox</span>
                             </div>
                             <div className="flex items-center gap-2 px-2 py-1 text-slate-500">
                                <Star size={12} className="sm:w-4 sm:h-4" />
                                <span className="text-[8px] sm:text-xs font-medium">Starred</span>
                             </div>
                             <div className="flex items-center gap-2 px-2 py-1 text-slate-500">
                                <Clock size={12} className="sm:w-4 sm:h-4" />
                                <span className="text-[8px] sm:text-xs font-medium">Snoozed</span>
                             </div>
                         </div>
                    </div>
                    
                    <div className="flex-grow flex flex-col bg-[#f4f1ea]">
                        {[
                            { subject: "Bitcoin hits $70k: What now? 🚀", date: "9:00 AM", unread: true, snippet: "The market just woke up..." },
                            { subject: "The Whales are watching you 🐋", date: "Yesterday", unread: false, snippet: "Smart money is moving..." },
                            { subject: "Why Texas loves mining 🤠", date: "Oct 24", unread: false, snippet: "It's not just about oil..." },
                            { subject: "Daily Lesson: Lightning Network ⚡", date: "Oct 23", unread: false, snippet: "Imagine a faster highway..." },
                            { subject: "ETF inflows just hit a record 📈", date: "Oct 22", unread: false, snippet: "Wall street is hungry..." },
                        ].map((email, i) => (
                            <div key={i} className={`flex items-center gap-2 sm:gap-3 py-2 sm:py-3 px-2 sm:px-4 border-b border-slate-200 hover:bg-black/5 ${email.unread ? 'bg-[#f4f1ea]' : 'bg-slate-100/50'}`}>
                                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded border flex items-center justify-center shrink-0 ${email.unread ? 'border-slate-400' : 'border-slate-300'}`}>
                                    {email.unread && <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-slate-300 rounded-sm"></div>}
                                </div>
                                <Star size={12} className={`shrink-0 sm:w-4 sm:h-4 ${email.unread ? 'text-slate-300' : 'text-yellow-400 fill-yellow-400'}`} />
                                <div className="flex-grow min-w-0">
                                     <div className="flex justify-between items-baseline mb-0.5">
                                         <span className={`text-[9px] sm:text-xs truncate mr-2 ${email.unread ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>Bitcoin Intrigue</span>
                                         <span className="text-[8px] sm:text-[10px] text-slate-400 shrink-0">{email.date}</span>
                                     </div>
                                     <div className="flex items-center gap-1">
                                        <span className={`text-[9px] sm:text-xs truncate ${email.unread ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                            {email.subject}
                                        </span>
                                        <span className="hidden sm:inline text-[10px] text-slate-400 truncate">- {email.snippet}</span>
                                     </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute right-1 sm:right-2 md:right-8 lg:right-auto top-0 lg:static lg:right-auto lg:top-auto w-[90px] sm:w-[140px] md:w-[280px] lg:w-[320px] bg-slate-900 rounded-[1.2rem] sm:rounded-[1.8rem] md:rounded-[2.5rem] lg:rounded-[3rem] border-[2px] sm:border-[3px] md:border-[6px] lg:border-[8px] border-slate-900 shadow-lg md:shadow-2xl z-10 h-[180px] sm:h-[280px] md:h-[500px] lg:h-[580px] overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-[#f4f1ea] h-4 sm:h-6 md:h-8 flex justify-between items-end px-3 sm:px-5 pb-1 text-[6px] sm:text-[8px] md:text-xs font-bold text-slate-900 select-none">
                    <span>9:41</span>
                    <div className="flex gap-1 items-center">
                        <Wifi size={10} className="w-2 h-2 sm:w-3 sm:h-3" />
                        <Battery size={10} className="w-2 h-2 sm:w-3 sm:h-3" />
                    </div>
                </div>

                <div className="h-full w-full bg-[#f4f1ea] flex flex-col relative overflow-hidden">
                    <div className="px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center border-b border-slate-900 bg-[#f4f1ea] sticky top-0 z-20">
                         <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-brand-600 rounded-full flex items-center justify-center text-white shrink-0">
                                <Bitcoin size={12} strokeWidth={2.5} className="sm:w-4 sm:h-4" />
                            </div>
                            <span className="font-sans font-black text-[10px] sm:text-xs md:text-sm text-brand-600 tracking-tight lowercase">
                                intrigue
                            </span>
                         </div>
                         <Menu size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-slate-900" />
                    </div>

                    <div className="overflow-y-auto flex-grow no-scrollbar pb-10">
                        <div className="h-20 xs:h-24 sm:h-32 md:h-48 w-full bg-slate-200 relative">
                             <img 
                                src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1000&auto=format&fit=crop" 
                                className="w-full h-full object-cover" 
                                alt="Bitcoin Coin" 
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                             <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-brand-600 text-white text-[6px] sm:text-[8px] md:text-[10px] font-bold uppercase px-1.5 py-0.5">
                                Price Story
                             </span>
                        </div>
                        
                        <div className="p-3 sm:p-4 md:p-6 bg-[#f4f1ea]">
                             <h3 className="font-serif font-black text-[10px] xs:text-xs sm:text-sm md:text-xl leading-tight text-slate-900 mb-2 sm:mb-3">
                                 Bitcoin just pulled off a massive comeback to $70k
                             </h3>
                             
                             <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 border-b border-slate-200 pb-2 sm:pb-3">
                                 <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 rounded-full bg-slate-300 overflow-hidden">
                                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=intrigue" alt="avatar" />
                                 </div>
                                 <div className="text-[6px] sm:text-[8px] md:text-[10px] text-slate-500 font-bold uppercase">
                                    By The Team • 4 min read
                                 </div>
                             </div>

                             <div className="space-y-2 sm:space-y-3">
                                 <div className="h-1.5 sm:h-2 bg-slate-200 rounded w-full"></div>
                                 <div className="h-1.5 sm:h-2 bg-slate-200 rounded w-[95%]"></div>
                                 <div className="h-1.5 sm:h-2 bg-slate-200 rounded w-[90%]"></div>
                                 <div className="py-1 sm:py-2">
                                     <div className="border-l-2 border-brand-600 pl-2 sm:pl-3">
                                         <div className="h-2 sm:h-2.5 bg-slate-300 rounded w-[85%] mb-1"></div>
                                         <div className="h-2 sm:h-2.5 bg-slate-300 rounded w-[60%]"></div>
                                     </div>
                                 </div>
                                 <div className="h-1.5 sm:h-2 bg-slate-200 rounded w-full"></div>
                             </div>
                             
                             <div className="mt-4 sm:mt-6 pt-3 border-t border-slate-200 text-center">
                                 <div className="bg-slate-900 text-white text-[6px] sm:text-[8px] md:text-[10px] font-bold uppercase px-3 py-1.5 rounded-sm">
                                     Subscribe to read more
                                 </div>
                             </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#f4f1ea] to-transparent pointer-events-none"></div>
                </div>
            </div>

            <div className="hidden md:flex absolute bottom-2 right-2 md:bottom-4 md:right-4 lg:right-[-20px] bg-white border-2 border-slate-900 rounded-full w-16 h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 items-center justify-center z-30 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-float">
                <div className="text-center">
                    <Award size={16} className="mx-auto mb-0.5 text-slate-900 md:w-5 md:h-5" />
                    <div className="font-black text-[8px] md:text-[10px] lg:text-xs leading-none uppercase">Zero<br/>Jargon</div>
                </div>
            </div>
          </div>
          
          <div className="w-full lg:col-span-6 flex flex-col items-start text-left z-10 order-2 lg:order-1 mt-0 lg:mt-0">
            <div className="mb-2 md:mb-4 lg:mb-6 inline-block">
                <span className="font-bold text-slate-900 text-[11px] sm:text-sm md:text-base lg:text-lg tracking-tight border-b-2 border-dotted border-slate-400 pb-0.5">
                    Your friendly Bitcoin uncle
                </span>
            </div>

            <h1 className="font-sans font-black text-[2rem] xs:text-4xl sm:text-5xl md:text-6xl xl:text-7xl text-slate-900 mb-3 sm:mb-5 md:mb-6 lg:mb-8 leading-[0.9] tracking-tighter uppercase animate-slide-up">
              Bitcoin. <br/> Translated <br/> for humans.
            </h1>

            <p className="text-xs sm:text-sm md:text-base lg:text-xl text-slate-800 font-medium mb-4 sm:mb-6 lg:mb-8 max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              We read the charts and the whitepapers so you don't have to. The 5-minute newsletter that separates the <span className="font-black">signal from the noise</span>.
            </p>

            <div className="w-full animate-fade-in z-20" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
                {status === 'success' ? (
                    <div className="flex h-10 sm:h-12 md:h-14 items-center px-4 sm:px-6 bg-brand-50 border border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] sm:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm max-w-lg animate-fade-in">
                        <Check className="text-brand-600 mr-2 sm:mr-3 shrink-0" size={20} />
                        <span className="font-black text-slate-900 text-[10px] sm:text-sm md:text-base uppercase tracking-wide">Thanks for subscribing!</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-lg w-full">
                        <div className={`flex h-10 sm:h-12 md:h-14 border bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] sm:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[3px_3px_0px_0px_rgba(234,88,12,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(234,88,12,1)] transition-shadow duration-300 rounded-sm overflow-hidden ${status === 'error' ? 'border-red-500' : 'border-slate-900'}`}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if(status === 'error') setStatus('idle');
                                }}
                                disabled={status === 'loading'}
                                placeholder="your@email.com"
                                className="flex-grow px-2.5 sm:px-4 h-full bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm md:text-base min-w-0"
                            />
                            <button type="submit" disabled={status === 'loading'} className="bg-brand-600 hover:bg-brand-700 text-white font-black uppercase text-[9px] sm:text-xs md:text-sm lg:text-base px-3 sm:px-5 md:px-8 h-full transition-colors whitespace-nowrap flex items-center justify-center shrink-0">
                                {status === 'loading' ? <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="hidden xs:inline">Start Reading</span>}
                                {!status || status === 'loading' ? null : (status === 'loading' ? null : <span className="xs:hidden">Join</span>)}
                            </button>
                        </div>
                        {status === 'error' && (
                            <p className="text-red-600 text-[9px] sm:text-[10px] md:text-xs font-bold flex items-center gap-1 animate-fade-in">
                                <AlertCircle size={12} className="shrink-0" />
                                <span>Check your email and try again.</span>
                            </p>
                        )}
                    </form>
                )}

                {status !== 'success' && (
                    <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-900 uppercase tracking-wide mt-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0"></span>
                    <span>Join 45,000+ subscribers.</span>
                    </p>
                )}
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-10 md:mt-16 lg:mt-20 pt-4 sm:pt-6 md:pt-8 lg:pt-10 border-t border-slate-300">
            <div className="flex flex-col items-center md:flex-row md:items-center gap-2 md:gap-12 lg:gap-16 overflow-hidden">
                <span className="font-bold text-slate-900 text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap z-10 bg-paper md:pr-4 text-center md:text-left">
                    Read by everyday investors at
                </span>
                <div className="flex-grow overflow-hidden relative w-full mask-gradient">
                    <div className="flex animate-scroll whitespace-nowrap gap-8 md:gap-12 items-center opacity-60 grayscale w-max">
                        {marqueeList.map((company, index) => (
                            <div key={index} className={`text-xs sm:text-sm md:text-base lg:text-xl text-slate-700 ${company.style}`}>
                                {company.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};
