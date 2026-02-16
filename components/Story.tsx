import React from 'react';
import { Story as StoryType } from '../types';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StoryProps {
  story: StoryType;
}

export const Story: React.FC<StoryProps> = ({ story }) => {
  const isHighlighted = story.highlight;

  return (
    <div className={`flex flex-col h-full bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 ${isHighlighted ? 'md:col-span-2 md:flex-row bg-slate-900 text-white border-slate-800' : ''}`}>
      
      {story.image && (
        <Link to={`/story/${story.id}`} className={`overflow-hidden block ${isHighlighted ? 'md:w-1/2' : 'h-48'}`}>
          <img 
            src={story.image} 
            alt={story.headline} 
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
          />
        </Link>
      )}

      <div className={`p-6 md:p-8 flex flex-col flex-grow ${isHighlighted ? 'md:w-1/2 justify-center' : ''}`}>
        
        <div className="mb-4">
           <span className={`text-[10px] font-black tracking-widest uppercase py-1 px-2 rounded ${isHighlighted ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'}`}>
              {story.category}
           </span>
        </div>

        <Link to={`/story/${story.id}`} className="block group">
            <h3 className={`font-serif font-bold text-2xl mb-4 leading-tight group-hover:underline ${isHighlighted ? 'text-white' : 'text-slate-900'}`}>
            {story.headline}
            </h3>
        </Link>

        <p className={`mb-6 font-sans leading-relaxed flex-grow line-clamp-3 ${isHighlighted ? 'text-slate-300' : 'text-slate-600'}`}>
          {story.content[0]}
        </p>

        <Link to={`/story/${story.id}`} className={`group flex items-center text-xs font-bold uppercase tracking-widest transition-colors ${isHighlighted ? 'text-brand-400 hover:text-white' : 'text-slate-900 hover:text-brand-600'}`}>
          Read Story
          <ArrowRight size={14} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};