
import React, { useState } from 'react';
import { Menu, X, Bitcoin, Search, Twitter, Linkedin, Instagram, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm shadow-sm transition-all duration-300">
        {/* Top Bar - Desktop Only */}
        <div className="hidden md:block border-b border-slate-900">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-10 text-xs font-medium text-slate-600">
                    <div className="flex gap-6">
                        <Link to="/about" className="hover:text-brand-600 transition-colors">About Us</Link>
                        <Link to="/advertise" className="hover:text-brand-600 transition-colors">Advertise with us</Link>
                        <Link to="/admin" className="flex items-center gap-1 opacity-20 hover:opacity-100 transition-opacity text-slate-400">
                            <ShieldCheck size={12} /> Admin
                        </Link>
                    </div>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-brand-600 transition-colors"><Twitter size={14} /></a>
                        <a href="#" className="hover:text-brand-600 transition-colors"><Instagram size={14} /></a>
                        <a href="#" className="hover:text-brand-600 transition-colors"><Linkedin size={14} /></a>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Nav */}
        <div className="border-b border-slate-900">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">
                    
                    {/* Left & Center */}
                    <div className="flex items-center gap-4 md:gap-12">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMenuOpen(false)}>
                            <div className="w-9 h-9 md:w-10 md:h-10 bg-brand-600 rounded-full flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform">
                                <Bitcoin size={22} strokeWidth={2.5} />
                            </div>
                            <span className="font-sans font-black text-xl md:text-2xl text-brand-600 tracking-tight lowercase">
                                intrigue
                            </span>
                        </Link>

                        {/* Desktop Links */}
                        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                            <Link to="/newsletter" className="text-base font-bold text-slate-900 hover:text-brand-600 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-brand-600 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">Newsletter</Link>
                            <Link to="/about" className="text-base font-bold text-slate-900 hover:text-brand-600 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-brand-600 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">About</Link>
                        </nav>
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center gap-2 md:gap-6">
                        <button className="p-2 text-slate-900 hover:text-brand-600 transition-colors hover:bg-slate-100 rounded-full">
                            <Search size={20} strokeWidth={2} className="md:w-[22px] md:h-[22px]" />
                        </button>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-slate-900 hover:text-brand-600 transition-colors hover:bg-slate-100 rounded-full"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} className="md:w-[26px] md:h-[26px]" /> : <Menu size={24} strokeWidth={2} className="md:w-[26px] md:h-[26px]" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>

      {/* Menu Dropdown - Visible on all screen sizes when open */}
      <div className={`absolute w-full left-0 top-full bg-paper border-b-2 border-slate-900 shadow-2xl transition-all duration-300 ease-in-out origin-top overflow-hidden ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 py-6 space-y-6">
            <div className="space-y-4">
                <Link to="/" className="block text-2xl font-black text-slate-900 uppercase tracking-tight" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to="/newsletter" className="block text-2xl font-black text-slate-900 uppercase tracking-tight" onClick={() => setIsMenuOpen(false)}>Newsletter</Link>
                <Link to="/about" className="block text-2xl font-black text-slate-900 uppercase tracking-tight" onClick={() => setIsMenuOpen(false)}>About</Link>
                <Link to="/admin" className="block text-xl font-bold text-slate-400 uppercase tracking-tight" onClick={() => setIsMenuOpen(false)}>Admin Console</Link>
            </div>
          </div>
      </div>
    </header>
  );
};
