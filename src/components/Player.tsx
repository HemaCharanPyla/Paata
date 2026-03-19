import React, { useRef, useEffect, useState } from 'react';
import { get, set, del, keys } from 'idb-keyval';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2, Mic2, Music, X, Heart, Share2, ListPlus, Download, CheckCircle2 } from 'lucide-react';
import { Track } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  isQueueOpen: boolean;
  onToggleQueue: () => void;
  likedTracks: Track[];
  onToggleLike: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onDownload?: (track: Track) => void;
  isDownloaded?: boolean;
  isDownloading?: boolean;
}

export const Player: React.FC<PlayerProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  isQueueOpen,
  onToggleQueue,
  likedTracks,
  onToggleLike,
  onAddToPlaylist,
  onDownload,
  isDownloaded: isDownloadedProp = false,
  isDownloading = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    const checkOffline = async () => {
      if (!currentTrack) return;
      const blob = await get(`audio_${currentTrack.id}`);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setIsDownloaded(true);
      } else {
        setAudioUrl(currentTrack.previewUrl);
        setIsDownloaded(false);
      }
    };
    checkOffline();

    return () => {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  const isLiked = likedTracks.some(t => t.id === currentTrack.id);

  return (
    <>
      <div className="h-auto md:h-24 bg-neo-pink border-t-4 border-black px-4 md:px-6 py-3 md:py-0 flex flex-col md:flex-row items-center justify-between neo-shadow-[0_-4px_0_0_#000] gap-4 md:gap-0 z-40 relative">
        <audio
          ref={audioRef}
          src={currentTrack.previewUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={onNext}
        />

        {/* Track Info */}
        <div className="flex items-center gap-3 md:gap-5 w-full md:w-[35%]">
          <img
            src={currentTrack.cover}
            alt={currentTrack.title}
            className="w-14 h-14 md:w-20 md:h-20 neo-border-2 border-black neo-shadow-sm flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
            onClick={() => setIsFullScreen(true)}
          />
          <div className="flex flex-col overflow-hidden flex-1">
            <span 
              onClick={() => setIsFullScreen(true)}
              className="text-black text-base md:text-2xl font-display uppercase truncate tracking-tighter hover:underline cursor-pointer leading-tight"
            >
              {currentTrack.title}
            </span>
            <span className="text-black/70 text-xs md:text-base font-bold uppercase truncate tracking-wider hover:underline cursor-pointer">
              {currentTrack.artist}
            </span>
          </div>
          <div className="flex items-center gap-2 md:hidden">
             <button 
              onClick={() => onToggleLike(currentTrack)}
              className="text-black p-1"
            >
              <Heart size={20} fill={isLiked ? "black" : "none"} />
            </button>
          </div>
        </div>

        {/* Controls & Progress */}
        <div className="flex flex-col items-center gap-1 md:gap-2 w-full md:max-w-[35%]">
          {/* Main Controls (Desktop & Mobile) */}
          <div className="flex items-center justify-center gap-4 md:gap-6 w-full">
            <button className="text-black hover:text-white transition-colors hidden md:block">
              <Shuffle size={18} className="md:w-5 md:h-5" />
            </button>
            <button onClick={onPrev} className="text-black hover:text-white transition-colors">
              <SkipBack size={24} fill="currentColor" className="md:w-7 md:h-7" />
            </button>
            <button
              onClick={onTogglePlay}
              className="w-12 h-12 md:w-14 md:h-14 bg-neo-green neo-border-2 border-black neo-shadow-sm flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
            >
              {isPlaying ? (
                <Pause size={24} fill="black" className="text-black md:w-8 md:h-8" />
              ) : (
                <Play size={24} fill="black" className="text-black ml-1 md:w-8 md:h-8" />
              )}
            </button>
            <button onClick={onNext} className="text-black hover:text-white transition-colors">
              <SkipForward size={24} fill="currentColor" className="md:w-7 md:h-7" />
            </button>
            <button className="text-black hover:text-white transition-colors hidden md:block">
              <Repeat size={18} className="md:w-5 md:h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4 w-full">
            <span className="text-[10px] md:text-xs font-bold text-black min-w-[30px] md:min-w-[40px] text-right">
              {formatTime(progress)}
            </span>
            <div className="flex-1 relative h-3 md:h-4 neo-border-2 border-black bg-white neo-shadow-sm overflow-hidden">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={progress}
                onChange={handleProgressChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <motion.div 
                className="absolute inset-y-0 left-0 bg-neo-yellow border-r-2 border-black"
                initial={false}
                animate={{ width: `${(progress / (duration || 1)) * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
            <span className="text-[10px] md:text-xs font-bold text-black min-w-[30px] md:min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume & Extra - hidden on mobile */}
        <div className="hidden md:flex items-center justify-end gap-3 w-[30%]">
          <button 
            onClick={() => onToggleLike(currentTrack)}
            className={cn(
              "neo-btn p-2 transition-colors",
              isLiked ? "bg-neo-pink text-white" : "bg-white hover:bg-neo-pink/20"
            )}
            title={isLiked ? "Unlike" : "Like"}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          </button>

          <button 
            onClick={() => onAddToPlaylist(currentTrack)}
            className="neo-btn p-2 bg-white hover:bg-neo-blue hover:text-white transition-colors"
            title="Add to Playlist"
          >
            <ListPlus size={20} />
          </button>

          <button 
            onClick={() => onDownload?.(currentTrack)}
            className={cn(
              "neo-btn p-2 transition-colors",
              isDownloadedProp ? "bg-neo-green" : "bg-white hover:bg-neo-green/20"
            )}
            title={isDownloadedProp ? "Downloaded" : "Download"}
          >
            {isDownloadedProp ? <CheckCircle2 size={20} /> : <Download size={20} className={cn(isDownloading && "animate-bounce")} />}
          </button>

          <div className="h-8 w-[1px] bg-black/20 mx-1" />

          <div className="flex items-center gap-2">
            <Volume2 size={20} className="text-black" />
            <div className="w-24 relative h-4 neo-border-2 border-black bg-white neo-shadow-sm overflow-hidden">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <motion.div 
                className="absolute inset-y-0 left-0 bg-neo-blue border-r-2 border-black"
                initial={false}
                animate={{ width: `${volume * 100}%` }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
              />
            </div>
          </div>
          
          <button 
            onClick={onToggleQueue}
            className={cn(
              "neo-btn p-2 transition-colors",
              isQueueOpen ? "bg-neo-green" : "bg-white hover:bg-neo-yellow"
            )}
            title="Queue"
          >
            <Music size={20} />
          </button>
        </div>
      </div>

      {/* Full Screen Mode Overlay */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-50 bg-neo-yellow flex flex-col items-center justify-center p-8 overflow-y-auto"
          >
            <button 
              onClick={() => setIsFullScreen(false)}
              className="absolute top-8 right-8 neo-btn bg-neo-pink p-3 hover:scale-110 transition-transform"
            >
              <X size={32} />
            </button>

            <div className="flex flex-col items-center gap-12 max-w-4xl w-full">
              {/* Large Rotating Poster */}
              <div className="relative group">
                <motion.div
                  animate={isPlaying ? { rotate: 360 } : {}}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-64 h-64 md:w-96 md:h-96 rounded-full neo-border-4 border-black overflow-hidden neo-shadow-lg relative z-10"
                >
                  <img 
                    src={currentTrack.cover} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Center Hole */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-neo-yellow rounded-full neo-border-4 border-black z-20" />
                  </div>
                </motion.div>
                {/* Decorative Vinyl Lines */}
                <div className="absolute inset-0 rounded-full border-8 border-black/10 pointer-events-none z-15" />
                <div className="absolute inset-4 rounded-full border-4 border-black/5 pointer-events-none z-15" />
              </div>

              {/* Track Info */}
              <div className="text-center flex flex-col gap-4">
                <h1 className="text-4xl md:text-6xl font-display uppercase tracking-tighter bg-neo-pink px-6 py-2 neo-border neo-shadow-lg inline-block">
                  {currentTrack.title}
                </h1>
                <p className="text-xl md:text-3xl font-bold uppercase tracking-widest text-black/70">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Progress Bar (Large) */}
              <div className="w-full flex flex-col gap-4">
                <div className="flex items-center gap-6 w-full">
                  <span className="text-lg font-bold min-w-[60px] text-right">{formatTime(progress)}</span>
                  <div className="flex-1 relative h-6 neo-border bg-white neo-shadow overflow-hidden">
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      value={progress}
                      onChange={handleProgressChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-neo-green border-r-4 border-black"
                      initial={false}
                      animate={{ width: `${(progress / (duration || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold min-w-[60px]">{formatTime(duration)}</span>
                </div>

                {/* Controls (Large) */}
                <div className="flex items-center justify-center gap-8 md:gap-12 mt-4">
                  <button onClick={onPrev} className="neo-btn bg-white p-4 hover:bg-neo-blue hover:text-white transition-all">
                    <SkipBack size={40} fill="currentColor" />
                  </button>
                  <button
                    onClick={onTogglePlay}
                    className="w-24 h-24 bg-neo-green neo-border-4 border-black neo-shadow-lg flex items-center justify-center hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all"
                  >
                    {isPlaying ? (
                      <Pause size={48} fill="black" />
                    ) : (
                      <Play size={48} fill="black" className="ml-2" />
                    )}
                  </button>
                  <button onClick={onNext} className="neo-btn bg-white p-4 hover:bg-neo-blue hover:text-white transition-all">
                    <SkipForward size={40} fill="currentColor" />
                  </button>
                </div>
              </div>

              {/* More Options */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-2xl mt-8">
                <button 
                  onClick={() => onToggleLike(currentTrack)}
                  className={cn(
                    "neo-card flex flex-col items-center gap-3 py-6 transition-all hover:-translate-y-1",
                    isLiked ? "bg-neo-pink text-white" : "bg-white"
                  )}
                >
                  <Heart size={32} fill={isLiked ? "currentColor" : "none"} />
                  <span className="font-bold uppercase text-sm">{isLiked ? 'Liked' : 'Like'}</span>
                </button>
                <button 
                  onClick={() => onAddToPlaylist(currentTrack)}
                  className="neo-card bg-neo-blue text-white flex flex-col items-center gap-3 py-6 transition-all hover:-translate-y-1"
                >
                  <ListPlus size={32} />
                  <span className="font-bold uppercase text-sm">Add to Playlist</span>
                </button>
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: currentTrack.title,
                        text: `Check out ${currentTrack.title} by ${currentTrack.artist} on AURA CLIP!`,
                        url: window.location.href,
                      }).catch(console.error);
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="neo-card bg-neo-green flex flex-col items-center gap-3 py-6 transition-all hover:-translate-y-1"
                >
                  <Share2 size={32} />
                  <span className="font-bold uppercase text-sm">Share</span>
                </button>
                <button 
                  onClick={() => currentTrack && onDownload?.(currentTrack)}
                  className={cn(
                    "neo-card flex flex-col items-center gap-3 py-6 transition-all hover:-translate-y-1",
                    isDownloadedProp ? "bg-neo-green text-black" : "bg-white",
                    isDownloading && "animate-pulse"
                  )}
                >
                  {isDownloadedProp ? <CheckCircle2 size={32} /> : <Download size={32} className={cn(isDownloading && "animate-bounce")} />}
                  <span className="font-bold uppercase text-sm">{isDownloadedProp ? 'Downloaded' : 'Download'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
