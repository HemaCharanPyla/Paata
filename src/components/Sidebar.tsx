import React, { useState, useRef, useEffect } from 'react';
import { Home, Search, Library, PlusSquare, Heart, Music, LogIn, LogOut, Play, Download, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils';
import { Playlist, QuickUser } from '../types';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;
  onCreatePlaylist: () => void;
  onRenamePlaylist: (id: string, newName: string) => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  user: QuickUser | null;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  playlists,
  selectedPlaylistId,
  setSelectedPlaylistId,
  onCreatePlaylist,
  onRenamePlaylist,
  onPlayPlaylist,
  user,
  isLoggingIn,
  onLogin,
  onLogout
}) => {
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPlaylistId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingPlaylistId]);

  const handleRenameSubmit = (id: string) => {
    if (editName.trim()) {
      onRenamePlaylist(id, editName.trim());
    }
    setEditingPlaylistId(null);
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'HOME' },
    { id: 'search', icon: Search, label: 'SEARCH' },
    { id: 'library', icon: Library, label: 'LIBRARY' },
    { id: 'downloads', icon: Download, label: 'DOWNLOADS' },
    { id: 'queue', icon: Music, label: 'QUEUE' },
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
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          onClick={onCreatePlaylist}
          className="flex items-center gap-4 text-sm font-bold uppercase tracking-wider text-black hover:text-neo-pink transition-colors group"
        >
          <div className="bg-neo-blue neo-border p-1 text-white group-hover:bg-neo-pink transition-colors">
            <PlusSquare size={16} />
          </div>
          Create Playlist
        </motion.button>
        <button 
          onClick={() => {
            setActiveTab('liked');
            setSelectedPlaylistId(null);
          }}
          className={cn(
            "flex items-center gap-4 text-sm font-bold uppercase tracking-wider transition-colors group",
            activeTab === 'liked' ? "text-neo-pink" : "text-black hover:text-neo-pink"
          )}
        >
          <div className={cn(
            "neo-border p-1 text-white transition-colors",
            activeTab === 'liked' ? "bg-neo-pink" : "bg-neo-pink/40 group-hover:bg-neo-pink"
          )}>
            <Heart size={16} fill="white" />
          </div>
          Liked Songs
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <span className="text-xs font-bold uppercase tracking-widest text-black/40 px-2">Playlists</span>
        <div className="flex flex-col gap-1">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="relative group">
              {editingPlaylistId === playlist.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleRenameSubmit(playlist.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit(playlist.id);
                    if (e.key === 'Escape') setEditingPlaylistId(null);
                  }}
                  className="w-full px-2 py-2 text-sm font-bold uppercase tracking-tight neo-border bg-white outline-none"
                />
              ) : (
                <button
                  onClick={() => {
                    setSelectedPlaylistId(playlist.id);
                    setActiveTab('playlist');
                  }}
                  onDoubleClick={() => {
                    setEditingPlaylistId(playlist.id);
                    setEditName(playlist.name);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-2 text-sm font-bold uppercase tracking-tight truncate transition-all",
                    selectedPlaylistId === playlist.id 
                      ? "bg-neo-pink neo-border neo-shadow-sm" 
                      : "text-black/70 hover:bg-black/10 hover:text-black"
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Music size={16} />
                    <span className="truncate">{playlist.name}</span>
                  </div>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayPlaylist(playlist);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neo-green neo-border bg-white"
                  >
                    <Play size={12} fill="black" />
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t-4 border-black flex flex-col gap-4">
        {user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 px-2">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                className="w-10 h-10 neo-border bg-white" 
                alt={user.name} 
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold uppercase truncate">{user.name}</span>
                <span className="text-[10px] text-black/60 truncate">@{user.id}</span>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-widest bg-neo-pink neo-border neo-shadow-sm hover:-translate-y-0.5 transition-transform"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={onLogin}
            disabled={isLoggingIn}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-widest bg-neo-green neo-border neo-shadow-sm transition-all",
              isLoggingIn ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"
            )}
          >
            <LogIn size={16} className={cn(isLoggingIn && "animate-pulse")} />
            {isLoggingIn ? 'Logging in...' : 'Quick Login'}
          </button>
        )}
        <button 
          onClick={() => {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
            if (isIOS) {
              alert('To install on iOS:\n1. Tap the Share icon (square with arrow)\n2. Scroll down and tap "Add to Home Screen"');
            } else {
              alert('To install on Android:\n1. Tap the three dots (menu)\n2. Tap "Install app" or "Add to Home screen"');
            }
          }}
          className="flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-widest bg-neo-blue text-white neo-border neo-shadow-sm hover:-translate-y-0.5 transition-transform"
        >
          <Smartphone size={16} />
          Install App
        </button>
        <div className="text-[10px] font-bold uppercase tracking-widest text-black/60 flex flex-wrap gap-x-4 gap-y-2">
          <a href="mailto:hemacharanpyla@gmail.com" className="hover:text-black cursor-pointer bg-neo-green px-2 py-0.5 neo-border neo-shadow-sm transition-all hover:-translate-y-0.5">Suggestions</a>
          <span className="hover:text-black cursor-pointer">Legal</span>
          <span className="hover:text-black cursor-pointer">Privacy</span>
          <span className="hover:text-black cursor-pointer">Cookies</span>
          <span className="hover:text-black cursor-pointer">Ads</span>
        </div>
      </div>
    </div>
  );
};
