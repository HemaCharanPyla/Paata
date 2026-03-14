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
    <div className="w-64 bg-neutral-100 dark:bg-black h-full flex flex-col p-6 gap-8 transition-colors duration-300">
      <div className="flex items-center gap-2 px-2">
        <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-white dark:bg-black rounded-sm rotate-45" />
        </div>
        <span className="text-neutral-900 dark:text-white font-bold text-xl tracking-tight">Spotify</span>
      </div>

      <nav className="flex flex-col gap-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex items-center gap-4 text-sm font-bold transition-colors hover:text-neutral-900 dark:hover:text-white",
              activeTab === item.id ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"
            )}
          >
            <item.icon size={24} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-4 mt-4">
        <button className="flex items-center gap-4 text-sm font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <div className="bg-neutral-300 dark:bg-neutral-400 p-1 rounded-sm text-neutral-900 dark:text-black">
            <PlusSquare size={16} />
          </div>
          Create Playlist
        </button>
        <button className="flex items-center gap-4 text-sm font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <div className="bg-gradient-to-br from-indigo-700 to-blue-300 p-1 rounded-sm text-white">
            <Heart size={16} fill="white" />
          </div>
          Liked Songs
        </button>
      </div>

      <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex flex-wrap gap-x-4 gap-y-2">
          <span>Legal</span>
          <span>Privacy Center</span>
          <span>Privacy Policy</span>
          <span>Cookies</span>
          <span>About Ads</span>
        </div>
      </div>
    </div>
  );
};
