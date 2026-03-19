import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { TrackCard } from './components/TrackCard';
import { SearchInput } from './components/SearchInput';
import { SplashScreen } from './components/SplashScreen';
import { Track, Playlist, QuickUser } from './types';
import { cn } from './lib/utils';
import { searchTracks, getTrendingTracks } from './services/musicService';
import { db } from './firebase';
import { doc, setDoc, onSnapshot, collection, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';
import { get, set, del, keys } from 'idb-keyval';
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
  X,
  Music,
  Heart,
  Play,
  Download,
  CheckCircle2,
  AlertCircle
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
  const [showSplash, setShowSplash] = useState(true);
  
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('aura_playlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  
  const [user, setUser] = useState<QuickUser | null>(() => {
    const saved = localStorage.getItem('aura_quick_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [history, setHistory] = useState<Track[]>(() => {
    const saved = localStorage.getItem('aura_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [likedTracks, setLikedTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem('aura_liked_tracks');
    return saved ? JSON.parse(saved) : [];
  });
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [lastSearch, setLastSearch] = useState<string>(() => localStorage.getItem('aura_last_search') || '');
  const [searchBasedTracks, setSearchBasedTracks] = useState<Track[]>([]);
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadDownloads = async () => {
      const allKeys = await keys();
      const tracks: Track[] = [];
      for (const key of allKeys) {
        if (typeof key === 'string' && key.startsWith('track_')) {
          const track = await get(key);
          if (track) tracks.push(track);
        }
      }
      setDownloadedTracks(tracks);
    };
    loadDownloads();
  }, []);

  const handleDownload = async (track: Track) => {
    if (downloadedTracks.some(t => t.id === track.id)) {
      // Already downloaded, remove it
      await del(`track_${track.id}`);
      await del(`audio_${track.id}`);
      setDownloadedTracks(prev => prev.filter(t => t.id !== track.id));
      return;
    }

    setDownloadingIds(prev => new Set(prev).add(track.id));
    try {
      const response = await fetch(track.previewUrl);
      const blob = await response.blob();
      await set(`audio_${track.id}`, blob);
      await set(`track_${track.id}`, track);
      setDownloadedTracks(prev => [...prev, track]);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Auth listener removed in favor of local state
  useEffect(() => {
    if (user) {
      localStorage.setItem('aura_quick_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aura_quick_user');
    }
  }, [user]);

  // Firestore sync for playlists and liked tracks
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.playlists) {
          setPlaylists(data.playlists);
        }
        if (data.likedTracks) {
          setLikedTracks(data.likedTracks);
        }
        if (data.history) {
          setHistory(data.history);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.id}`);
    });
    return () => unsubscribe();
  }, [user]);

  // Save playlists, liked tracks, and history to Firestore or localStorage
  useEffect(() => {
    const saveData = async () => {
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.id), { 
            playlists,
            likedTracks,
            history
          }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
        }
      } else {
        localStorage.setItem('aura_playlists', JSON.stringify(playlists));
        localStorage.setItem('aura_liked_tracks', JSON.stringify(likedTracks));
        localStorage.setItem('aura_history', JSON.stringify(history));
      }
    };
    saveData();
  }, [playlists, likedTracks, history, user]);

  // Recommendations fetch removed
  useEffect(() => {
    if (currentTrack) {
      // Add to history
      setHistory(prev => {
        const filtered = prev.filter(t => t.id !== currentTrack.id);
        return [currentTrack, ...filtered].slice(0, 10);
      });
    }
  }, [currentTrack]);

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
        
        // Update last search for the feed
        if (results.length > 0) {
          setLastSearch(searchQuery);
          localStorage.setItem('aura_last_search', searchQuery);
        }
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

  // Fetch search-based feed
  useEffect(() => {
    if (lastSearch) {
      const fetchSearchBased = async () => {
        const results = await searchTracks(lastSearch);
        setSearchBasedTracks(results.slice(0, 12));
      };
      fetchSearchBased();
    }
  }, [lastSearch]);

  // Fetch recommendations based on history and liked tracks
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (history.length === 0 && likedTracks.length === 0) {
        setRecommendations([]);
        return;
      }

      // Combine history and liked tracks to find artists
      const sourceTracks = [...likedTracks.slice(0, 5), ...history.slice(0, 5)];
      const artists = Array.from(new Set(sourceTracks.map(t => t.artist))).slice(0, 3);
      
      if (artists.length === 0) return;

      const allRecs: Track[] = [];
      for (const artist of artists) {
        const results = await searchTracks(artist);
        // Filter out tracks already in history or liked
        const filtered = results.filter(t => 
          !history.some(h => h.id === t.id) && 
          !likedTracks.some(l => l.id === t.id)
        );
        allRecs.push(...filtered.slice(0, 4));
      }

      // Shuffle and take top 12
      setRecommendations(allRecs.sort(() => Math.random() - 0.5).slice(0, 12));
    };

    const timer = setTimeout(fetchRecommendations, 1000);
    return () => clearTimeout(timer);
  }, [history.length, likedTracks.length]);

  const refreshTrending = async () => {
    setIsLoading(true);
    const data = await getTrendingTracks();
    setTrendingTracks(data);
    setIsLoading(false);
  };

  const handlePlay = (track: Track, trackList?: Track[]) => {
    if (trackList) {
      setTracks(trackList);
    }
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      addToHistory(track);
    }
  };

  const addToHistory = (track: Track) => {
    setHistory(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      return [track, ...filtered].slice(0, 20); // Keep last 20
    });
  };

  const toggleLike = (track: Track) => {
    setLikedTracks(prev => {
      const isLiked = prev.some(t => t.id === track.id);
      if (isLiked) {
        return prev.filter(t => t.id !== track.id);
      } else {
        return [track, ...prev];
      }
    });
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length === 0) return;
    setTracks(playlist.tracks);
    setCurrentTrack(playlist.tracks[0]);
    setIsPlaying(true);
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

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const submitLogin = async () => {
    if (!loginUsername.trim()) return;
    setIsLoggingIn(true);
    const id = loginUsername.trim().toLowerCase();
    const newUser: QuickUser = {
      id,
      name: loginUsername.trim()
    };
    
    // Try to fetch existing data to see if user exists
    try {
      const docSnap = await getDoc(doc(db, 'users', id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.playlists) setPlaylists(data.playlists);
      }
      setUser(newUser);
      setShowLoginModal(false);
      setLoginUsername('');
    } catch (error) {
      console.error("Quick login failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPlaylists([]);
    setSelectedPlaylistId(null);
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

  const removeFromQueue = (trackId: number) => {
    setTracks(prev => prev.filter(t => t.id !== trackId));
  };

  const moveInQueue = (index: number, direction: 'up' | 'down') => {
    setTracks(prev => {
      const newQueue = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newQueue.length) return prev;
      
      const temp = newQueue[index];
      newQueue[index] = newQueue[targetIndex];
      newQueue[targetIndex] = temp;
      return newQueue;
    });
  };

  const currentPlaylist = playlists.find(p => p.id === selectedPlaylistId);

  return (
    <div className="flex flex-col h-screen bg-neo-yellow text-black font-sans overflow-hidden">
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>
      
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
            onRenamePlaylist={renamePlaylist}
            onPlayPlaylist={handlePlayPlaylist}
            user={user}
            isLoggingIn={isLoggingIn}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-white overflow-y-auto scrollbar-hide border-l-0 md:border-l-4 border-black pb-48 md:pb-24">
          {/* Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between p-4 bg-white border-b-4 border-black">
            <div className="flex items-center gap-2 md:gap-4 flex-1 font-mono font-bold">
              <div className="flex flex-col leading-none mr-2 md:mr-4">
                <span className="text-xl md:text-2xl tracking-tighter">AURA CLIP</span>
                <span className="text-[8px] md:text-[10px] uppercase opacity-70">Neo-Brutalist Music Feed</span>
              </div>
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
                  <p className="text-lg font-bold uppercase tracking-tight max-w-xl bg-neo-yellow p-4 neo-border neo-shadow-sm">
                    Welcome to AURA CLIP. Your high-energy destination for trending tracks and personalized music feeds. Discover, play, and vibe out.
                  </p>
                  
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
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={refreshTrending}
                          className="text-lg font-bold uppercase underline decoration-4 underline-offset-4 cursor-pointer hover:text-neo-pink"
                        >
                          Refresh
                        </button>
                        <span className="text-lg font-bold uppercase underline decoration-4 underline-offset-4 cursor-pointer hover:text-neo-pink">Show all</span>
                      </div>
                    </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                    {trendingTracks.map((track) => (
                      <TrackCard
                        key={track.id}
                        track={track}
                        isActive={currentTrack?.id === track.id}
                        isLiked={likedTracks.some(t => t.id === track.id)}
                        onPlay={(t) => handlePlay(t, trendingTracks)}
                        onLike={toggleLike}
                        playlists={playlists}
                        onAddToPlaylist={addTrackToPlaylist}
                        onDownload={handleDownload}
                        isDownloaded={downloadedTracks.some(t => t.id === track.id)}
                        isDownloading={downloadingIds.has(track.id)}
                      />
                    ))}
                  </div>
                  </div>

                  {recommendations.length > 0 && (
                    <div className="mt-12">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-4xl font-display uppercase tracking-tighter bg-neo-blue text-white px-4 py-1 neo-border neo-shadow">
                          RECOMMENDATIONS
                        </h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                        {recommendations.map((track) => (
                          <TrackCard
                            key={track.id}
                            track={track}
                            isActive={currentTrack?.id === track.id}
                            isLiked={likedTracks.some(t => t.id === track.id)}
                            onPlay={(t) => handlePlay(t, recommendations)}
                            onLike={toggleLike}
                            playlists={playlists}
                            onAddToPlaylist={addTrackToPlaylist}
                            onDownload={handleDownload}
                            isDownloaded={downloadedTracks.some(t => t.id === track.id)}
                            isDownloading={downloadingIds.has(track.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {searchBasedTracks.length > 0 && (
                    <div className="mt-12">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-4xl font-display uppercase tracking-tighter bg-neo-yellow px-4 py-1 neo-border neo-shadow">
                          BASED ON "{lastSearch.toUpperCase()}"
                        </h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                        {searchBasedTracks.map((track) => (
                          <TrackCard
                            key={track.id}
                            track={track}
                            isActive={currentTrack?.id === track.id}
                            isLiked={likedTracks.some(t => t.id === track.id)}
                            onPlay={(t) => handlePlay(t, searchBasedTracks)}
                            onLike={toggleLike}
                            playlists={playlists}
                            onAddToPlaylist={addTrackToPlaylist}
                            onDownload={handleDownload}
                            isDownloaded={downloadedTracks.some(t => t.id === track.id)}
                            isDownloading={downloadingIds.has(track.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
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
                              isLiked={likedTracks.some(t => t.id === track.id)}
                              onPlay={(t) => handlePlay(t, tracks)}
                              onLike={toggleLike}
                              playlists={playlists}
                              onAddToPlaylist={addTrackToPlaylist}
                              onDownload={handleDownload}
                              isDownloaded={downloadedTracks.some(t => t.id === track.id)}
                              isDownloading={downloadingIds.has(track.id)}
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
                          onClick={() => handlePlayPlaylist(currentPlaylist)}
                          className="neo-btn bg-neo-green text-black flex items-center gap-2"
                          disabled={currentPlaylist.tracks.length === 0}
                        >
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1" />
                          PLAY ALL
                        </button>
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

              {activeTab === 'liked' && (
                <motion.section
                  key="liked"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-8"
                >
                  <div className="flex flex-col md:flex-row items-end gap-6 bg-neo-pink p-8 neo-border neo-shadow-lg text-white">
                    <div className="w-48 h-48 bg-white/20 neo-border neo-shadow flex items-center justify-center">
                      <Heart size={64} fill="white" />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <span className="text-sm font-bold uppercase tracking-widest">Playlist</span>
                      <h2 className="text-6xl font-display uppercase tracking-tighter">Liked Songs</h2>
                      <div className="flex items-center gap-4 mt-4">
                        <button 
                          onClick={() => handlePlayPlaylist({ id: 'liked', name: 'Liked Songs', tracks: likedTracks })}
                          className="neo-btn bg-neo-green text-black flex items-center gap-2"
                          disabled={likedTracks.length === 0}
                        >
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1" />
                          PLAY ALL
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                    {likedTracks.length > 0 ? (
                      likedTracks.map((track) => (
                        <TrackCard
                          key={track.id}
                          track={track}
                          isActive={currentTrack?.id === track.id}
                          isLiked={true}
                          onPlay={(t) => handlePlay(t, likedTracks)}
                          onLike={toggleLike}
                          playlists={playlists}
                          onAddToPlaylist={addTrackToPlaylist}
                          onDownload={handleDownload}
                          isDownloaded={downloadedTracks.some(t => t.id === track.id)}
                          isDownloading={downloadingIds.has(track.id)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-20 text-2xl font-display uppercase neo-border neo-shadow bg-neo-yellow">
                        No liked songs yet
                      </div>
                    )}
                  </div>
                </motion.section>
              )}


              {activeTab === 'downloads' && (
                <motion.section
                  key="downloads"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-8"
                >
                  <div className="flex flex-col md:flex-row items-end gap-6 bg-neo-green p-8 neo-border neo-shadow-lg text-black">
                    <div className="w-48 h-48 bg-white/20 neo-border neo-shadow flex items-center justify-center">
                      <Download size={64} />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <span className="text-sm font-bold uppercase tracking-widest">Offline</span>
                      <h2 className="text-6xl font-display uppercase tracking-tighter">Downloads</h2>
                      <p className="text-sm font-bold uppercase tracking-wider opacity-70">
                        {downloadedTracks.length} tracks available offline
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <button 
                          onClick={() => handlePlayPlaylist({ id: 'downloads', name: 'Downloads', tracks: downloadedTracks })}
                          className="neo-btn bg-neo-yellow text-black flex items-center gap-2"
                          disabled={downloadedTracks.length === 0}
                        >
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1" />
                          PLAY ALL
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                    {downloadedTracks.length > 0 ? (
                      downloadedTracks.map((track) => (
                        <TrackCard
                          key={track.id}
                          track={track}
                          isActive={currentTrack?.id === track.id}
                          isLiked={likedTracks.some(t => t.id === track.id)}
                          onPlay={(t) => handlePlay(t, downloadedTracks)}
                          onLike={toggleLike}
                          playlists={playlists}
                          onAddToPlaylist={addTrackToPlaylist}
                          onDownload={handleDownload}
                          isDownloaded={true}
                          isDownloading={downloadingIds.has(track.id)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-20 text-2xl font-display uppercase neo-border neo-shadow bg-neo-yellow">
                        No downloads yet
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
                  className="flex flex-col gap-8"
                >
                  <h2 className="text-4xl font-display uppercase tracking-tighter bg-neo-yellow px-4 py-1 neo-border neo-shadow self-start">Your Library</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div 
                      onClick={createPlaylist}
                      className="neo-card bg-neo-green flex flex-col items-center justify-center gap-4 py-12 cursor-pointer hover:-translate-y-1 transition-transform"
                    >
                      <PlusSquare size={48} />
                      <span className="font-display text-2xl uppercase">Create Playlist</span>
                    </div>
                    <div 
                      onClick={() => setActiveTab('liked')}
                      className="neo-card bg-neo-pink flex flex-col items-center justify-center gap-4 py-12 cursor-pointer hover:-translate-y-1 transition-transform"
                    >
                      <Heart size={48} fill="black" />
                      <span className="font-display text-2xl uppercase">Liked Songs</span>
                    </div>
                    <div 
                      onClick={() => setActiveTab('downloads')}
                      className="neo-card bg-neo-yellow flex flex-col items-center justify-center gap-4 py-12 cursor-pointer hover:-translate-y-1 transition-transform"
                    >
                      <Download size={48} />
                      <span className="font-display text-2xl uppercase">Downloads</span>
                    </div>
                    {playlists.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          setSelectedPlaylistId(p.id);
                          setActiveTab('playlist');
                        }}
                        className="neo-card bg-neo-blue text-white flex flex-col items-center justify-center gap-4 py-12 cursor-pointer hover:-translate-y-1 transition-transform"
                      >
                        <Music size={48} />
                        <span className="font-display text-2xl uppercase truncate px-4 w-full text-center">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {activeTab === 'queue' && (
                <motion.section
                  key="queue"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-8"
                >
                  <h1 className="text-6xl font-display uppercase tracking-tighter bg-neo-blue text-white inline-block px-4 py-2 neo-border neo-shadow-lg self-start">
                    PLAYBACK QUEUE
                  </h1>
                  
                  <div className="flex flex-col gap-4">
                    {tracks.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {tracks.map((track, i) => (
                          <div 
                            key={`${track.id}-${i}`}
                            className={cn(
                              "flex items-center gap-4 p-4 neo-border transition-colors group",
                              currentTrack?.id === track.id ? "bg-neo-green/20 border-neo-green" : "hover:bg-neo-yellow/10"
                            )}
                          >
                            <span className="w-8 text-center font-bold text-xl">{i + 1}</span>
                            <img src={track.cover} className="w-16 h-16 neo-border" alt="" />
                            <div className="flex-1 overflow-hidden">
                              <div className={cn("font-display text-xl uppercase truncate", currentTrack?.id === track.id && "text-neo-green")}>
                                {track.title}
                                {currentTrack?.id === track.id && " (PLAYING)"}
                              </div>
                              <div className="text-sm font-bold uppercase text-black/60 truncate">{track.artist}</div>
                            </div>
                            
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => moveInQueue(i, 'up')}
                                disabled={i === 0}
                                className="neo-btn bg-white p-2 disabled:opacity-30"
                                title="Move Up"
                              >
                                <ChevronLeft className="rotate-90" size={18} />
                              </button>
                              <button 
                                onClick={() => moveInQueue(i, 'down')}
                                disabled={i === tracks.length - 1}
                                className="neo-btn bg-white p-2 disabled:opacity-30"
                                title="Move Down"
                              >
                                <ChevronLeft className="-rotate-90" size={18} />
                              </button>
                              <button 
                                onClick={() => removeFromQueue(track.id)}
                                className="neo-btn bg-neo-pink p-2"
                                title="Remove"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => handlePlay(track)}
                              className="neo-btn bg-neo-green p-3"
                            >
                              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-black border-b-[8px] border-b-transparent ml-1" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 neo-border neo-shadow bg-neo-yellow">
                        <p className="text-2xl font-display uppercase">Your queue is empty</p>
                        <button 
                          onClick={() => setActiveTab('home')}
                          className="neo-btn bg-neo-green mt-4"
                        >
                          GO FIND SOME VIBES
                        </button>
                      </div>
                    )}
                  </div>
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
          isQueueOpen={activeTab === 'queue'}
          onToggleQueue={() => setActiveTab(activeTab === 'queue' ? 'home' : 'queue')}
          likedTracks={likedTracks}
          onToggleLike={toggleLike}
          onAddToPlaylist={(track) => {
            setSelectedPlaylistId(null);
            setActiveTab('library');
          }}
          onDownload={handleDownload}
          isDownloaded={currentTrack ? downloadedTracks.some(t => t.id === currentTrack.id) : false}
          isDownloading={currentTrack ? downloadingIds.has(currentTrack.id) : false}
        />
      </div>

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
          onClick={() => { setActiveTab('queue'); setSelectedPlaylistId(null); }}
          className={cn("flex flex-col items-center gap-1", activeTab === 'queue' ? "text-neo-pink" : "text-black")}
        >
          <Music size={20} />
          <span className="text-[10px] font-bold">QUEUE</span>
        </button>
        <button 
          onClick={createPlaylist}
          className="flex flex-col items-center gap-1 text-black"
        >
          <PlusSquare size={20} />
          <span className="text-[10px] font-bold">NEW</span>
        </button>
      </div>

      {/* Quick Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-md bg-neo-yellow neo-border neo-shadow-lg p-8 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-display uppercase tracking-tighter bg-neo-pink px-4 py-1 neo-border neo-shadow">QUICK LOGIN</h2>
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="w-10 h-10 bg-white neo-border neo-shadow-sm flex items-center justify-center hover:bg-neo-pink transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-widest">ENTER USERNAME</label>
                <input 
                  type="text" 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitLogin()}
                  placeholder="e.g. vibe_master"
                  className="w-full p-4 text-xl font-bold uppercase tracking-tight neo-border bg-white outline-none focus:ring-4 focus:ring-neo-green/30"
                  autoFocus
                />
                <p className="text-xs font-bold uppercase text-black/60">No password required. Just a name to save your playlists.</p>
              </div>

              <button 
                onClick={submitLogin}
                disabled={isLoggingIn || !loginUsername.trim()}
                className={cn(
                  "w-full py-4 bg-neo-green text-2xl font-display uppercase tracking-tighter neo-border neo-shadow transition-all",
                  (isLoggingIn || !loginUsername.trim()) ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-1 active:translate-y-0"
                )}
              >
                {isLoggingIn ? 'SYNCING...' : 'START VIBING'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
