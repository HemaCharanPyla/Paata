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
        "group p-4 rounded-lg bg-neutral-200/50 dark:bg-[#181818] hover:bg-neutral-300/50 dark:hover:bg-[#282828] transition-all duration-300 cursor-pointer relative",
        isActive && "bg-neutral-300/50 dark:bg-[#282828]"
      )}
    >
      <div className="relative aspect-square mb-4 shadow-2xl">
        <img
          src={track.cover}
          alt={track.title}
          className="w-full h-full object-cover rounded-md"
          referrerPolicy="no-referrer"
        />
        <button
          className={cn(
            "absolute bottom-2 right-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center shadow-xl transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105",
            isActive && "translate-y-0 opacity-100"
          )}
        >
          <Play size={24} fill="black" className="text-black ml-1" />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-neutral-900 dark:text-white font-bold text-sm truncate">{track.title}</h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs truncate">{track.artist}</p>
      </div>
    </div>
  );
};
