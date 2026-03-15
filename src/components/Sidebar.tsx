import React from 'react';
import { Home, Search, Library, PlusSquare, Heart, Music } from 'lucide-react';
import { cn } from '../lib/utils';
import { Playlist } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;
  onCreatePlaylist: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  playlists,
  selectedPlaylistId,
  setSelectedPlaylistId,
  onCreatePlaylist
}) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'HOME' },
    { id: 'search', icon: Search, label: 'SEARCH' },
    { id: 'library', icon: Library, label: 'LIBRARY' },
  ];

  return (
    <div className="w-64 bg-neo-yellow h-full flex flex-col p-6 gap-8 border-r-4 border-black overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-neo-pink neo-border neo-shadow-sm flex items-center justify-center">
          <div className="w-5 h-5 bg-black neo-border rotate-45" />
        </div>
        <span className="text-black font-display text-3xl uppercase tracking-tighter">AURA</span>
      </div>

      <nav className="flex flex-col gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSelectedPlaylistId(null);
            }}
            className={cn(
              "flex items-center gap-4 text-lg font-display uppercase tracking-tighter transition-all hover:translate-x-1",
              activeTab === item.id && !selectedPlaylistId
                ? "text-black bg-neo-green px-3 py-1 neo-border neo-shadow-sm" 
                : "text-black/60 hover:text-black"
            )}
          >
            <item.icon size={24} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-4 mt-4">
        <button 
          onClick={onCreatePlaylist}
          className="flex items-center gap-4 text-sm font-bold uppercase tracking-wider text-black hover:text-neo-pink transition-colors"
        >
          <div className="bg-neo-blue neo-border p-1 text-white">
            <PlusSquare size={16} />
          </div>
          Create Playlist
        </button>
        <button className="flex items-center gap-4 text-sm font-bold uppercase tracking-wider text-black hover:text-neo-pink transition-colors">
          <div className="bg-neo-pink neo-border p-1 text-white">
            <Heart size={16} fill="white" />
          </div>
          Liked Songs
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <span className="text-xs font-bold uppercase tracking-widest text-black/40 px-2">Playlists</span>
        <div className="flex flex-col gap-1">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => {
                setSelectedPlaylistId(playlist.id);
                setActiveTab('playlist');
              }}
              className={cn(
                "flex items-center gap-3 px-2 py-2 text-sm font-bold uppercase tracking-tight truncate transition-all hover:bg-black/5",
                selectedPlaylistId === playlist.id ? "bg-neo-pink neo-border neo-shadow-sm" : "text-black/70"
              )}
            >
              <Music size={16} />
              <span className="truncate">{playlist.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t-4 border-black">
        <div className="text-[10px] font-bold uppercase tracking-widest text-black/60 flex flex-wrap gap-x-4 gap-y-2">
          <span className="hover:text-black cursor-pointer">Legal</span>
          <span className="hover:text-black cursor-pointer">Privacy</span>
          <span className="hover:text-black cursor-pointer">Cookies</span>
          <span className="hover:text-black cursor-pointer">Ads</span>
        </div>
      </div>
    </div>
  );
};
