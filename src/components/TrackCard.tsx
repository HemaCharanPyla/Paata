import React, { useState } from 'react';
import { Play, Plus, Check } from 'lucide-react';
import { Track, Playlist } from '../types';
import { cn } from '../lib/utils';

interface TrackCardProps {
  track: Track;
  isActive: boolean;
  onPlay: (track: Track) => void;
  playlists?: Playlist[];
  onAddToPlaylist?: (playlistId: string, track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({ 
  track, 
  isActive, 
  onPlay,
  playlists = [],
  onAddToPlaylist
}) => {
  const [showPlaylists, setShowPlaylists] = useState(false);

  return (
    <div
      className={cn(
        "group neo-card cursor-pointer relative flex flex-col h-full",
        isActive && "bg-neo-yellow"
      )}
    >
      <div 
        onClick={() => onPlay(track)}
        className="relative aspect-square mb-4 neo-border neo-shadow-sm overflow-hidden"
      >
        <img
          src={track.cover}
          alt={track.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <button
          className={cn(
            "absolute bottom-2 right-2 w-12 h-12 bg-neo-green neo-border neo-shadow-sm flex items-center justify-center transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300",
            isActive && "translate-y-0 opacity-100"
          )}
        >
          <Play size={24} fill="black" className="text-black ml-1" />
        </button>
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <h3 className="text-black font-display uppercase text-sm truncate tracking-tighter">{track.title}</h3>
        <p className="text-black/60 font-bold text-xs truncate uppercase tracking-wider">{track.artist}</p>
      </div>

      {playlists.length > 0 && (
        <div className="mt-4 relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowPlaylists(!showPlaylists);
            }}
            className="w-full neo-btn bg-neo-blue text-white text-[10px] flex items-center justify-center gap-1"
          >
            <Plus size={12} /> ADD TO PLAYLIST
          </button>
          
          {showPlaylists && (
            <div className="absolute bottom-full left-0 w-full bg-white neo-border neo-shadow-lg z-20 mb-2 max-h-40 overflow-y-auto scrollbar-hide">
              {playlists.map(p => {
                const isAdded = p.tracks.some(t => t.id === track.id);
                return (
                  <button
                    key={p.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddToPlaylist && !isAdded) {
                        onAddToPlaylist(p.id, track);
                      }
                      setShowPlaylists(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase hover:bg-neo-yellow transition-colors flex items-center justify-between"
                  >
                    <span className="truncate">{p.name}</span>
                    {isAdded && <Check size={12} className="text-neo-green" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
