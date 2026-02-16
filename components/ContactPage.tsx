import React, { useEffect } from 'react';
import { Mail, MessageSquare, MapPin, Send, Twitter, Linkedin, Instagram } from 'lucide-react';

export const ContactPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    
    return (
        <div className="min-h-screen bg-paper relative">
             {/* Background Pattern */}
             <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>

             <section className="pt-16 pb-12 md:pt-32 md:pb-20 px-4 border-b border-slate-900 relative z-10">
                <div className="max-w-[1400px] mx-auto text-center">
                    <div className="inline-block bg-brand-200 text-slate-900 text-[10px] md:text-xs font-black uppercase tracking-widest px-2 py-1 mb-6 border border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                        Contact Us
                    </div>
                    <h1 className="font-sans font-black text-5xl sm:text-6xl md:text-8xl text-slate-900 mb-6 leading-[0.9] tracking-tighter uppercase">
                        Get in <span className="text-brand-600">Touch</span>
                    </h1>
                     <p className="text-lg md:text-2xl text-slate-800 font-serif max-w-2xl mx-auto leading-relaxed">
                        Have a tip? A question? Or just want to say hello?
                    </p>
                </div>
             </section>

             <section className="py-16 md:py-24 px-4 max-w-[1200px] mx-auto grid md:grid-cols-12 gap-12 relative z-10">
                
                {/* Contact Info Column */}
                <div className="md:col-span-5 space-y-8">
                    {/* Email Card */}
                    <div className="bg-white p-8 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all">
                        <Mail className="w-8 h-8 mb-4 text-brand-600" />
                        <h3 className="font-black text-xl uppercase mb-2 text-slate-900">Email Us</h3>
                        <p className="font-serif text-slate-600 mb-6 leading-relaxed">For general inquiries, editorial tips, or partnership opportunities.</p>
                        <a href="mailto:hello@bitcoinintrigue.com" className="inline-block bg-slate-100 px-4 py-2 font-bold text-slate-900 hover:bg-brand-600 hover:text-white transition-colors border border-slate-300">
                            hello@bitcoinintrigue.com
                        </a>
                    </div>
                    
                    {/* Socials Card */}
                     <div className="bg-white p-8 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all">
                        <MessageSquare className="w-8 h-8 mb-4 text-brand-600" />
                        <h3 className="font-black text-xl uppercase mb-2 text-slate-900">Socials</h3>
                        <p className="font-serif text-slate-600 mb-6 leading-relaxed">Follow us for real-time updates and memes.</p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 flex items-center justify-center border-2 border-slate-900 text-slate-900 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 flex items-center justify-center border-2 border-slate-900 text-slate-900 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-colors">
                                <Linkedin size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 flex items-center justify-center border-2 border-slate-900 text-slate-900 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-colors">
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>

                    <div className="p-4 border-l-4 border-slate-300">
                        <p className="font-serif text-sm text-slate-500 italic">
                            "We read every email, but we might be slow to reply if Bitcoin is crashing (or mooning)."
                        </p>
                    </div>
                </div>

                {/* Form Column */}
                <div className="md:col-span-7 bg-white p-8 md:p-12 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                    <h3 className="font-black text-2xl uppercase mb-8 text-slate-900 flex items-center gap-3">
                        Send a Message <span className="h-1 flex-grow bg-slate-900"></span>
                    </h3>
                     <form className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500">Name</label>
                                <input type="text" className="w-full bg-stone-50 border-b-2 border-slate-200 focus:border-brand-600 p-3 outline-none transition-colors font-medium" placeholder="Your Name" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500">Email</label>
                                <input type="email" className="w-full bg-stone-50 border-b-2 border-slate-200 focus:border-brand-600 p-3 outline-none transition-colors font-medium" placeholder="you@email.com" />
                            </div>
                        </div>
                        <div>
                             <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500">Subject</label>
                             <div className="relative">
                                <select className="w-full bg-stone-50 border-b-2 border-slate-200 focus:border-brand-600 p-3 outline-none transition-colors font-medium appearance-none">
                                    <option>General Inquiry</option>
                                    <option>Editorial Tip</option>
                                    <option>Sponsorship</option>
                                    <option>Feedback</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-900">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                             </div>
                        </div>
                        <div>
                             <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500">Message</label>
                             <textarea rows={6} className="w-full bg-stone-50 border-2 border-slate-200 focus:border-brand-600 p-4 outline-none transition-colors resize-none font-medium" placeholder="Tell us what's on your mind..."></textarea>
                        </div>
                        <button className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-black uppercase px-8 py-4 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                            Send Message <Send size={18} strokeWidth={3} />
                        </button>
                    </form>
                </div>
             </section>
        </div>
    );
}