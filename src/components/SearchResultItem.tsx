import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Track } from '../types';
import { cn } from '../lib/utils';

interface SearchResultItemProps {
  track: Track;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  track,
  isActive,
  isPlaying,
  onPlay,
}) => {
  return (
    <div
      onClick={() => onPlay(track)}
      className={cn(
        "group flex items-center gap-6 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 cursor-pointer border border-transparent hover:border-white/5",
        isActive && "bg-white/10 border-white/10"
      )}
    >
      <div className="relative w-12 h-12 flex-shrink-0 group-hover:scale-105 transition-transform duration-300 bg-white/5 rounded-lg">
        <img
          src={track.cover}
          alt={track.title}
          className="w-full h-full object-cover rounded-lg shadow-lg"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${track.id}/200/200`;
          }}
        />
        <div className={cn(
          "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg",
          isActive && isPlaying && "opacity-100"
        )}>
          {isActive && isPlaying ? (
            <Pause size={18} fill="white" className="text-white" />
          ) : (
            <Play size={18} fill="white" className="text-white ml-0.5" />
          )}
        </div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <span className={cn(
          "text-base font-serif italic truncate transition-colors",
          isActive ? "text-[#ff4e00]" : "text-white group-hover:text-white"
        )}>
          {track.title}
        </span>
        <span className="text-xs text-white/40 uppercase tracking-widest truncate">
          {track.artist}
        </span>
      </div>
      
      <div className="text-xs text-white/20 font-mono hidden sm:block">
        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
      </div>
    </div>
  );
};
