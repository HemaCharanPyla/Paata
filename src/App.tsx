import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { TrackCard } from './components/TrackCard';
import { SearchInput } from './components/SearchInput';
import { Track, Playlist } from './types';
import { cn } from './lib/utils';
import { searchTracks, getTrendingTracks } from './services/musicService';
import { fetchLyrics } from './services/lyricsService';
import { LyricsModal } from './components/LyricsModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Plus, 
  Trash2, 
  Edit2, 
  Home, 
  Search, 
  Library, 
  PlusSquare,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('aura_playlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [currentLyrics, setCurrentLyrics] = useState('');

  // Save playlists to localStorage
  useEffect(() => {
    localStorage.setItem('aura_playlists', JSON.stringify(playlists));
  }, [playlists]);

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

  // Handle search and category fetch
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery) {
        setIsLoading(true);
        const results = await searchTracks(searchQuery);
        setTracks(results);
        setIsLoading(false);
      } else if (selectedCategory) {
        setIsLoading(true);
        const results = await searchTracks(selectedCategory);
        setTracks(results);
        setIsLoading(false);
      } else if (activeTab === 'search') {
        setTracks([]);
      } else {
        setTracks(trendingTracks);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab, trendingTracks, selectedCategory]);

  const handlePlay = (track: Track, trackList?: Track[]) => {
    if (trackList) {
      setTracks(trackList);
    }
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
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
  }, [currentTrack, tracks]);

  const handlePrev = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
  }, [currentTrack, tracks]);

  const handleShowLyrics = async () => {
    if (!currentTrack) return;
    setIsLyricsOpen(true);
    setIsLyricsLoading(true);
    const lyrics = await fetchLyrics(currentTrack.title, currentTrack.artist);
    setCurrentLyrics(lyrics);
    setIsLyricsLoading(false);
  };

  const createPlaylist = () => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: `NEW PLAYLIST #${playlists.length + 1}`,
      tracks: []
    };
    setPlaylists([...playlists, newPlaylist]);
    setSelectedPlaylistId(newPlaylist.id);
    setActiveTab('playlist');
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(playlists.filter(p => p.id !== id));
    if (selectedPlaylistId === id) {
      setSelectedPlaylistId(null);
      setActiveTab('home');
    }
  };

  const renamePlaylist = (id: string, newName: string) => {
    setPlaylists(playlists.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        if (p.tracks.find(t => t.id === track.id)) return p;
        return { ...p, tracks: [...p.tracks, track] };
      }
      return p;
    }));
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: number) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
      }
      return p;
    }));
  };

  const currentPlaylist = playlists.find(p => p.id === selectedPlaylistId);

  return (
    <div className="flex flex-col h-screen bg-neo-yellow text-black font-sans overflow-hidden">
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            playlists={playlists}
            selectedPlaylistId={selectedPlaylistId}
            setSelectedPlaylistId={setSelectedPlaylistId}
            onCreatePlaylist={createPlaylist}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-white overflow-y-auto scrollbar-hide border-l-0 md:border-l-4 border-black pb-48 md:pb-24">
          {/* Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between p-4 bg-white border-b-4 border-black">
            <div className="flex items-center gap-2 md:gap-4 flex-1">
              <div className="flex items-center gap-1 md:gap-2">
                <button 
                  onClick={() => {
                    if (selectedCategory) setSelectedCategory(null);
                    else if (activeTab === 'playlist') setActiveTab('library');
                  }}
                  className="w-8 h-8 md:w-10 md:h-10 bg-neo-pink neo-border neo-shadow-sm flex items-center justify-center text-black hover:-translate-y-0.5 transition-transform"
                >
                  <ChevronLeft size={20} />
                </button>
                <button className="w-8 h-8 md:w-10 md:h-10 bg-neo-pink neo-border neo-shadow-sm flex items-center justify-center text-black hover:-translate-y-0.5 transition-transform">
                  <ChevronRight size={20} />
                </button>
              </div>
              {activeTab === 'search' && (
                <div className="flex-1 max-w-md">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onClear={() => setSearchQuery('')}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 md:gap-4 ml-2">
              <button className="w-8 h-8 md:w-10 md:h-10 bg-neo-green neo-border neo-shadow-sm flex items-center justify-center text-black hover:-translate-y-0.5 transition-transform">
                <User size={18} />
              </button>
            </div>
          </header>

          <div className="p-4 md:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <motion.section
                  key="home"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-8"
                >
                  <h1 className="text-6xl font-display uppercase tracking-tighter bg-neo-green inline-block px-4 py-2 neo-border neo-shadow-lg self-start">
                    VIBE CHECK
                  </h1>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingTracks.slice(0, 6).map((track, i) => (
                      <div
                        key={track.id}
                        onClick={() => handlePlay(track)}
                        className={cn(
                          "flex items-center gap-4 neo-card cursor-pointer group",
                          i % 3 === 0 ? "bg-neo-pink" : i % 3 === 1 ? "bg-neo-yellow" : "bg-neo-blue text-white"
                        )}
                      >
                        <img src={track.cover} alt={track.title} className="w-20 h-20 neo-border" referrerPolicy="no-referrer" />
                        <span className="font-display text-xl uppercase truncate">{track.title}</span>
                        <div className="ml-auto mr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 bg-white neo-border neo-shadow-sm flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-black border-b-[8px] border-b-transparent ml-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-4xl font-display uppercase tracking-tighter bg-neo-pink px-4 py-1 neo-border neo-shadow">FOR YOU</h2>
                      <span className="text-lg font-bold uppercase underline decoration-4 underline-offset-4 cursor-pointer hover:text-neo-pink">Show all</span>
                    </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                    {trendingTracks.map((track) => (
                      <TrackCard
                        key={track.id}
                        track={track}
                        isActive={currentTrack?.id === track.id}
                        onPlay={(t) => handlePlay(t, trendingTracks)}
                        playlists={playlists}
                        onAddToPlaylist={addTrackToPlaylist}
                      />
                    ))}
                  </div>
                  </div>
                </motion.section>
              )}

              {activeTab === 'search' && (
                <motion.section
                  key="search"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-8"
                >
                  {!searchQuery && !selectedCategory ? (
                    <>
                      <h2 className="text-4xl font-display uppercase tracking-tighter bg-neo-yellow px-4 py-1 neo-border neo-shadow self-start">Browse all</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {['Podcasts', 'Made For You', 'Charts', 'Live Events', 'Pop', 'Hip-Hop', 'Rock', 'Latin', 'Dance', 'Indie'].map((cat, i) => (
                          <div
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className="aspect-square neo-border neo-shadow p-4 relative overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform"
                            style={{ backgroundColor: `hsl(${i * 40}, 100%, 50%)` }}
                          >
                            <span className="text-2xl font-display uppercase tracking-tighter leading-none">{cat}</span>
                            <div className="absolute -bottom-2 -right-4 w-24 h-24 bg-black/20 rotate-12 neo-border" />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {selectedCategory && !searchQuery && (
                        <div className="flex items-center gap-4">
                           <h2 className="text-4xl font-display uppercase tracking-tighter bg-neo-yellow px-4 py-1 neo-border neo-shadow self-start">{selectedCategory}</h2>
                           <button onClick={() => setSelectedCategory(null)} className="neo-btn bg-neo-pink text-sm">Back</button>
                        </div>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                        {isLoading ? (
                          <div className="col-span-full flex justify-center py-20">
                            <div className="w-16 h-16 border-8 border-black border-t-neo-green animate-spin" />
                          </div>
                        ) : tracks.length > 0 ? (
                          tracks.map((track) => (
                            <TrackCard
                              key={track.id}
                              track={track}
                              isActive={currentTrack?.id === track.id}
                              onPlay={(t) => handlePlay(t, tracks)}
                              playlists={playlists}
                              onAddToPlaylist={addTrackToPlaylist}
                            />
                          ))
                        ) : (
                          <div className="col-span-full text-center py-20 text-2xl font-display uppercase neo-border neo-shadow bg-neo-pink">
                            No results found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.section>
              )}

              {activeTab === 'playlist' && currentPlaylist && (
                <motion.section
                  key="playlist"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-8"
                >
                  <div className="flex flex-col md:flex-row items-end gap-6 bg-neo-blue p-8 neo-border neo-shadow-lg text-white">
                    <div className="w-48 h-48 bg-white/20 neo-border neo-shadow flex items-center justify-center">
                      <Plus size={64} />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <span className="text-sm font-bold uppercase tracking-widest">Playlist</span>
                      <input
                        type="text"
                        value={currentPlaylist.name}
                        onChange={(e) => renamePlaylist(currentPlaylist.id, e.target.value)}
                        className="text-6xl font-display uppercase tracking-tighter bg-transparent border-none focus:outline-none w-full"
                      />
                      <div className="flex items-center gap-4 mt-4">
                        <button 
                          onClick={() => deletePlaylist(currentPlaylist.id)}
                          className="neo-btn bg-neo-pink text-black flex items-center gap-2"
                        >
                          <Trash2 size={18} /> DELETE
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {currentPlaylist.tracks.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {currentPlaylist.tracks.map((track, i) => (
                          <div 
                            key={track.id}
                            className="flex items-center gap-4 p-2 neo-border hover:bg-neo-yellow/20 transition-colors group"
                          >
                            <span className="w-8 text-center font-bold">{i + 1}</span>
                            <img src={track.cover} className="w-12 h-12 neo-border" alt="" />
                            <div className="flex-1 overflow-hidden">
                              <div className="font-bold truncate">{track.title}</div>
                              <div className="text-sm text-black/60 truncate">{track.artist}</div>
                            </div>
                            <button 
                              onClick={() => handlePlay(track, currentPlaylist.tracks)}
                              className="neo-btn bg-neo-green p-2"
                            >
                              <Plus size={16} className="rotate-45" />
                            </button>
                            <button 
                              onClick={() => removeTrackFromPlaylist(currentPlaylist.id, track.id)}
                              className="neo-btn bg-neo-pink p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 neo-border neo-shadow bg-neo-yellow">
                        <p className="text-2xl font-display uppercase">This playlist is empty</p>
                        <button 
                          onClick={() => setActiveTab('search')}
                          className="neo-btn bg-neo-green mt-4"
                        >
                          ADD SOME TRACKS
                        </button>
                      </div>
                    )}
                  </div>
                </motion.section>
              )}

              {activeTab === 'library' && (
                <motion.section
                  key="library"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col items-center justify-center h-[60vh] gap-8"
                >
                  <div className="w-24 h-24 bg-neo-yellow neo-border neo-shadow-lg flex items-center justify-center">
                    <User size={48} className="text-black" />
                  </div>
                  <div className="text-center flex flex-col gap-4">
                    <h2 className="text-4xl font-display uppercase tracking-tighter bg-neo-pink px-4 py-1 neo-border neo-shadow">Your Library is empty</h2>
                    <p className="text-xl font-bold uppercase">Follow artists and podcasts to see them here.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="neo-btn bg-neo-green text-black text-xl"
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
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40">
        <Player
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onNext={handleNext}
          onPrev={handlePrev}
          onShowLyrics={handleShowLyrics}
        />
      </div>

      {/* Lyrics Modal */}
      <LyricsModal
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
        title={currentTrack?.title || ''}
        artist={currentTrack?.artist || ''}
        lyrics={currentLyrics}
        isLoading={isLyricsLoading}
      />

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-neo-yellow border-t-4 border-black flex items-center justify-around z-50">
        <button 
          onClick={() => { setActiveTab('home'); setSelectedPlaylistId(null); }}
          className={cn("flex flex-col items-center gap-1", activeTab === 'home' ? "text-neo-pink" : "text-black")}
        >
          <Home size={20} />
          <span className="text-[10px] font-bold">HOME</span>
        </button>
        <button 
          onClick={() => { setActiveTab('search'); setSelectedPlaylistId(null); }}
          className={cn("flex flex-col items-center gap-1", activeTab === 'search' ? "text-neo-pink" : "text-black")}
        >
          <Search size={20} />
          <span className="text-[10px] font-bold">SEARCH</span>
        </button>
        <button 
          onClick={() => { setActiveTab('library'); setSelectedPlaylistId(null); }}
          className={cn("flex flex-col items-center gap-1", activeTab === 'library' ? "text-neo-pink" : "text-black")}
        >
          <Library size={20} />
          <span className="text-[10px] font-bold">LIBRARY</span>
        </button>
        <button 
          onClick={createPlaylist}
          className="flex flex-col items-center gap-1 text-black"
        >
          <PlusSquare size={20} />
          <span className="text-[10px] font-bold">NEW</span>
        </button>
      </div>
    </div>
  );
}
