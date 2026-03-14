import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { TrackCard } from './components/TrackCard';
import { SearchInput } from './components/SearchInput';
import { ThemeToggle } from './components/ThemeToggle';
import { Track } from './types';
import { searchTracks, getTrendingTracks } from './services/musicService';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load trending tracks on mount
  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      const data = await getTrendingTracks();
      setTrendingTracks(data);
      setTracks(data);
      setIsLoading(false);
    };
    fetchTrending();
  }, []);

  // Handle search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery) {
        setIsLoading(true);
        const results = await searchTracks(searchQuery);
        setTracks(results);
        setIsLoading(false);
      } else if (activeTab === 'search') {
        setTracks([]);
      } else {
        setTracks(trendingTracks);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab, trendingTracks]);

  const handlePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleNext = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
  }, [currentTrack, tracks]);

  const handlePrev = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
  }, [currentTrack, tracks]);

  return (
    <div className="flex flex-col h-screen bg-neutral-50 text-neutral-900 dark:bg-black dark:text-white font-sans overflow-hidden transition-colors duration-300">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-gradient-to-b from-neutral-100 to-neutral-50 dark:from-neutral-900 dark:to-black overflow-y-auto scrollbar-hide transition-colors duration-300">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-transparent backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 bg-black/5 dark:bg-black/40 rounded-full flex items-center justify-center text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <button className="w-8 h-8 bg-black/5 dark:bg-black/40 rounded-full flex items-center justify-center text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  <ChevronRight size={24} />
                </button>
              </div>
              {activeTab === 'search' && (
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                />
              )}
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button className="hidden md:block bg-neutral-900 text-white dark:bg-white dark:text-black text-sm font-bold px-4 py-2 rounded-full hover:scale-105 transition-transform">
                Explore Premium
              </button>
              <button className="w-8 h-8 bg-black/5 dark:bg-black/40 rounded-full flex items-center justify-center text-neutral-900 dark:text-white hover:bg-black/10 dark:hover:bg-black/60 transition-colors">
                <User size={20} />
              </button>
            </div>
          </header>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <motion.section
                  key="home"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-6"
                >
                  <h1 className="text-3xl font-bold tracking-tight">Good afternoon</h1>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trendingTracks.slice(0, 6).map((track) => (
                      <div
                        key={track.id}
                        onClick={() => handlePlay(track)}
                        className="flex items-center gap-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded overflow-hidden cursor-pointer group"
                      >
                        <img src={track.cover} alt={track.title} className="w-20 h-20 shadow-lg" referrerPolicy="no-referrer" />
                        <span className="font-bold text-sm truncate">{track.title}</span>
                        <div className="ml-auto mr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center shadow-xl">
                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold hover:underline cursor-pointer">Made For You</h2>
                      <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400 hover:underline cursor-pointer">Show all</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {trendingTracks.map((track) => (
                        <TrackCard
                          key={track.id}
                          track={track}
                          isActive={currentTrack?.id === track.id}
                          onPlay={handlePlay}
                        />
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}

              {activeTab === 'search' && (
                <motion.section
                  key="search"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-6"
                >
                  {!searchQuery ? (
                    <>
                      <h2 className="text-2xl font-bold">Browse all</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {['Podcasts', 'Made For You', 'Charts', 'Live Events', 'Pop', 'Hip-Hop', 'Rock', 'Latin', 'Dance', 'Indie'].map((cat, i) => (
                          <div
                            key={cat}
                            className="aspect-square rounded-lg p-4 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                            style={{ backgroundColor: `hsl(${i * 40}, 70%, 40%)` }}
                          >
                            <span className="text-2xl font-bold tracking-tighter">{cat}</span>
                            <div className="absolute -bottom-2 -right-4 w-24 h-24 bg-white/20 rotate-12 rounded shadow-xl" />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {isLoading ? (
                        <div className="col-span-full flex justify-center py-20">
                          <div className="w-10 h-10 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : tracks.length > 0 ? (
                        tracks.map((track) => (
                          <TrackCard
                            key={track.id}
                            track={track}
                            isActive={currentTrack?.id === track.id}
                            onPlay={handlePlay}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-20 text-neutral-400">
                          No results found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </motion.section>
              )}

              {activeTab === 'library' && (
                <motion.section
                  key="library"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center h-[60vh] gap-4"
                >
                  <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                    <User size={32} className="text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <h2 className="text-2xl font-bold">Your Library is empty</h2>
                  <p className="text-neutral-500 dark:text-neutral-400">Follow artists and podcasts to see them here.</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="bg-neutral-900 text-white dark:bg-white dark:text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                  >
                    Find something to listen to
                  </button>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Player */}
      <Player
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </div>
  );
}
