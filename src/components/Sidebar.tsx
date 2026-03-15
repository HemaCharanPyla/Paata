import React from 'react';
import { Home, Search, Library, PlusSquare, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'library', icon: Library, label: 'Your Library' },
  ];

  return (
    <div className="w-72 bg-white h-full flex flex-col p-8 gap-10 border-r-4 border-black">
      <div className="flex items-center gap-3 px-2">
        <div className="w-12 h-12 bg-neo-yellow neo-border neo-shadow flex items-center justify-center">
          <div className="w-6 h-6 bg-black rotate-45" />
        </div>
        <span className="text-black font-black text-3xl tracking-tighter uppercase italic">AURA</span>
      </div>

      <nav className="flex flex-col gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex items-center gap-4 text-xl font-black uppercase tracking-tighter transition-all p-2 neo-border neo-shadow-hover",
              activeTab === item.id ? "bg-neo-green text-black" : "bg-white text-black/40"
            )}
          >
            <item.icon size={28} strokeWidth={3} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-6 mt-6">
        <button className="flex items-center gap-4 text-lg font-black uppercase tracking-tighter text-black hover:bg-neo-pink p-2 neo-border neo-shadow-hover transition-colors">
          <div className="bg-black p-1 text-white">
            <PlusSquare size={20} strokeWidth={3} />
          </div>
          Playlist
        </button>
        <button className="flex items-center gap-4 text-lg font-black uppercase tracking-tighter text-black hover:bg-neo-blue hover:text-white p-2 neo-border neo-shadow-hover transition-colors">
          <div className="bg-neo-pink p-1 text-black">
            <Heart size={20} strokeWidth={3} fill="currentColor" />
          </div>
          Liked
        </button>
      </div>

      <div className="mt-auto pt-6 border-t-4 border-black">
        <div className="text-[12px] font-bold uppercase tracking-tight text-black flex flex-wrap gap-x-4 gap-y-2">
          <span className="hover:underline cursor-pointer">Legal</span>
          <span className="hover:underline cursor-pointer">Privacy</span>
          <span className="hover:underline cursor-pointer">Cookies</span>
          <span className="hover:underline cursor-pointer">About</span>
        </div>
      </div>
    </div>
  );
};
