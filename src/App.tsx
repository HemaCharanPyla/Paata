import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { TrackCard } from './components/TrackCard';
import { SearchInput } from './components/SearchInput';
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
    <div className="flex flex-col h-screen bg-[#F0F0F0] text-black font-sans overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-white overflow-y-auto scrollbar-hide border-l-4 border-black">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between p-6 bg-neo-yellow border-b-4 border-black">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 bg-white neo-border neo-shadow-hover flex items-center justify-center text-black">
                  <ChevronLeft size={24} strokeWidth={3} />
                </button>
                <button className="w-10 h-10 bg-white neo-border neo-shadow-hover flex items-center justify-center text-black">
                  <ChevronRight size={24} strokeWidth={3} />
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
              <button className="hidden md:block bg-neo-pink text-black text-sm font-black px-6 py-2 neo-border neo-shadow-hover uppercase tracking-tighter">
                Premium
              </button>
              <button className="w-10 h-10 bg-neo-green neo-border neo-shadow-hover flex items-center justify-center text-black">
                <User size={24} strokeWidth={3} />
              </button>
            </div>
          </header>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <motion.section
                  key="home"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-8"
                >
                  <h1 className="text-6xl font-black uppercase tracking-tighter italic">AURA TRENDS</h1>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingTracks.slice(0, 6).map((track) => (
                      <div
                        key={track.id}
                        onClick={() => handlePlay(track)}
                        className="flex items-center gap-4 bg-neo-blue/10 neo-border neo-shadow-hover p-2 cursor-pointer group"
                      >
                        <img src={track.cover} alt={track.title} className="w-20 h-20 neo-border" referrerPolicy="no-referrer" />
                        <span className="font-black text-lg uppercase tracking-tight truncate">{track.title}</span>
                        <div className="ml-auto mr-4">
                          <div className="w-12 h-12 bg-neo-green neo-border flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-black border-b-[8px] border-b-transparent ml-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-4xl font-black uppercase tracking-tighter bg-neo-pink px-4 py-1 neo-border neo-shadow">Made For You</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="flex flex-col gap-8"
                >
                  {!searchQuery ? (
                    <>
                      <h2 className="text-4xl font-black uppercase tracking-tighter">Browse all</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {['Podcasts', 'Charts', 'Live', 'Pop', 'Hip-Hop', 'Rock', 'Latin', 'Dance', 'Indie', 'Jazz', 'Metal', 'Soul'].map((cat, i) => (
                          <div
                            key={cat}
                            className="aspect-square neo-border neo-shadow-hover p-4 relative overflow-hidden cursor-pointer"
                            style={{ backgroundColor: `hsl(${i * 30}, 90%, 60%)` }}
                          >
                            <span className="text-2xl font-black uppercase tracking-tighter leading-none">{cat}</span>
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-black/20 rotate-12 neo-border" />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                      {isLoading ? (
                        <div className="col-span-full flex justify-center py-20">
                          <div className="w-16 h-16 border-8 border-neo-yellow border-t-black rounded-full animate-spin" />
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
                        <div className="col-span-full text-center py-20 font-black text-2xl uppercase italic">
                          No results for "{searchQuery}"
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
                  className="flex flex-col items-center justify-center h-[60vh] gap-6"
                >
                  <div className="w-24 h-24 bg-neo-orange neo-border neo-shadow flex items-center justify-center">
                    <User size={48} strokeWidth={3} className="text-black" />
                  </div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter">Empty Library</h2>
                  <p className="text-xl font-bold italic">Follow artists to see them here.</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="bg-neo-yellow text-black font-black px-10 py-4 neo-border neo-shadow-hover uppercase tracking-tighter text-xl"
                  >
                    Find Music
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
