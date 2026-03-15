import React from 'react';
import { Play } from 'lucide-react';
import { Track } from '../types';
import { cn } from '../lib/utils';

interface TrackCardProps {
  track: Track;
  isActive: boolean;
  onPlay: (track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, isActive, onPlay }) => {
  return (
    <div
      onClick={() => onPlay(track)}
      className={cn(
        "group p-4 bg-white neo-border neo-shadow-hover cursor-pointer relative",
        isActive && "bg-neo-yellow"
      )}
    >
      <div className="relative aspect-square mb-4 neo-border overflow-hidden">
        <img
          src={track.cover}
          alt={track.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <button
          className={cn(
            "absolute bottom-2 right-2 w-12 h-12 bg-neo-green neo-border flex items-center justify-center neo-shadow transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300",
            isActive && "translate-y-0 opacity-100"
          )}
        >
          <Play size={24} fill="black" strokeWidth={3} className="text-black ml-1" />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-black font-black text-lg uppercase tracking-tighter truncate leading-none">{track.title}</h3>
        <p className="text-black/60 font-bold italic text-sm truncate">{track.artist}</p>
      </div>
    </div>
  );
};
