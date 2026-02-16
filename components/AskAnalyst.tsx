import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { analyzeBriefing } from '../services/geminiService';

export const AskAnalyst: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(''); // Clear previous response
    const result = await analyzeBriefing(query);
    setResponse(result);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-full shadow-lg transition-all hover:scale-105"
        >
          {isOpen ? <X size={20} /> : <Sparkles size={20} className="text-brand-400" />}
          <span className="font-bold uppercase text-xs tracking-wider hidden sm:inline">Ask AI Analyst</span>
        </button>
      </div>

      {/* Modal / Widget */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-[90vw] sm:w-96 bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] z-50 flex flex-col max-h-[60vh]">
          <div className="bg-brand-600 p-4 border-b border-slate-900 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="bg-white p-1 rounded-full">
                    <MessageSquare size={16} className="text-brand-600" />
                </div>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">Briefing Analyst</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <X size={18} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-grow bg-stone-50">
            {response ? (
              <div className="prose prose-sm prose-slate">
                <p className="font-serif leading-relaxed">{response}</p>
                <button 
                  onClick={() => { setResponse(''); setQuery(''); }} 
                  className="mt-4 text-xs font-bold text-brand-600 hover:underline uppercase"
                >
                  Ask another question
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm font-medium mb-4">
                  I've read today's briefing. Ask me anything about whales, the lightning network, or the $70k price tag.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                    <button onClick={() => setQuery("Why is the price rising?")} className="text-xs bg-white border border-slate-300 px-2 py-1 hover:border-brand-500 text-slate-600">Why price up?</button>
                    <button onClick={() => setQuery("What are whales doing?")} className="text-xs bg-white border border-slate-300 px-2 py-1 hover:border-brand-500 text-slate-600">Whale activity?</button>
                    <button onClick={() => setQuery("Explain Lightning Network")} className="text-xs bg-white border border-slate-300 px-2 py-1 hover:border-brand-500 text-slate-600">Lightning Network?</button>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-slate-200">
            <form onSubmit={handleAsk} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question..."
                className="flex-grow bg-stone-100 px-3 py-2 text-sm focus:outline-none border border-transparent focus:border-brand-400"
                disabled={loading || !!response}
              />
              <button
                type="submit"
                disabled={loading || !!response}
                className="bg-slate-900 text-white p-2 hover:bg-slate-700 disabled:opacity-50"
              >
                {loading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                    <Send size={16} />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};