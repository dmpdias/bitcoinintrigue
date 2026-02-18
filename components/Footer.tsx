import React from 'react';
import { Twitter, Linkedin, Github, Bitcoin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-stone-400 py-12 md:py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-8 mb-12">
            
            {/* Brand */}
            <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                    <div className="bg-brand-600 text-white p-1.5 rounded">
                        <Bitcoin size={20} />
                    </div>
                    <span className="font-serif font-bold text-xl text-white">Bitcoin Intrigue</span>
                </div>
                <p className="text-sm leading-relaxed mb-6">
                    Bitcoin Intrigue is a daily newsletter for people who own a little Bitcoin and want to actually understand it. No jargon. No hype. Just the story.
                </p>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-brand-500 transition-colors p-1"><Twitter size={20} /></a>
                    <a href="#" className="hover:text-brand-500 transition-colors p-1"><Linkedin size={20} /></a>
                    <a href="#" className="hover:text-brand-500 transition-colors p-1"><Github size={20} /></a>
                </div>
            </div>

            {/* Horizontal Links */}
            <div>
                 <div className="flex flex-wrap gap-6 text-sm font-bold text-slate-300">
                    <Link to="/about" className="hover:text-brand-500 transition-colors">About Us</Link>
                    <Link to="/advertise" className="hover:text-brand-500 transition-colors">Advertise</Link>
                    <Link to="/privacy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link>
                    <Link to="/contact" className="hover:text-brand-500 transition-colors">Contact</Link>
                 </div>
            </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-center md:text-left">
          <p>© {new Date().getFullYear()} Bitcoin Intrigue. Made for everyday people.</p>
        </div>
      </div>
    </footer>
  );
};