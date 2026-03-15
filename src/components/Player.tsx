import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2 } from 'lucide-react';
import { Track } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Player: React.FC<PlayerProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

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

  return (
    <div className="h-24 bg-neo-pink border-t-4 border-black px-6 flex items-center justify-between neo-shadow-[0_-4px_0_0_#000]">
      <audio
        ref={audioRef}
        src={currentTrack.previewUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
      />

      {/* Track Info */}
      <div className="flex items-center gap-4 w-[30%]">
        <img
          src={currentTrack.cover}
          alt={currentTrack.title}
          className="w-16 h-16 neo-border neo-shadow-sm"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col overflow-hidden">
          <span className="text-black text-lg font-display uppercase truncate tracking-tighter hover:underline cursor-pointer">
            {currentTrack.title}
          </span>
          <span className="text-black/70 text-sm font-bold uppercase truncate tracking-wider hover:underline cursor-pointer">
            {currentTrack.artist}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 max-w-[40%] w-full">
        <div className="flex items-center gap-6">
          <button className="text-black hover:text-white transition-colors">
            <Shuffle size={20} />
          </button>
          <button onClick={onPrev} className="text-black hover:text-white transition-colors">
            <SkipBack size={28} fill="currentColor" />
          </button>
          <button
            onClick={onTogglePlay}
            className="w-12 h-12 bg-neo-green neo-border neo-shadow-sm flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
          >
            {isPlaying ? (
              <Pause size={24} fill="black" className="text-black" />
            ) : (
              <Play size={24} fill="black" className="text-black ml-1" />
            )}
          </button>
          <button onClick={onNext} className="text-black hover:text-white transition-colors">
            <SkipForward size={28} fill="currentColor" />
          </button>
          <button className="text-black hover:text-white transition-colors">
            <Repeat size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4 w-full">
          <span className="text-xs font-bold text-black min-w-[40px] text-right">
            {formatTime(progress)}
          </span>
          <div className="flex-1 relative h-4 neo-border bg-white neo-shadow-sm overflow-hidden">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={progress}
              onChange={handleProgressChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <motion.div 
              className="absolute inset-y-0 left-0 bg-neo-yellow border-r-4 border-black"
              initial={false}
              animate={{ width: `${(progress / (duration || 1)) * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
          <span className="text-xs font-bold text-black min-w-[40px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume & Extra */}
      <div className="flex items-center justify-end gap-4 w-[30%]">
        <Volume2 size={20} className="text-black" />
        <div className="w-32 relative h-4 neo-border bg-white neo-shadow-sm overflow-hidden">
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
            className="absolute inset-y-0 left-0 bg-neo-blue border-r-4 border-black"
            initial={false}
            animate={{ width: `${volume * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        <Maximize2 size={20} className="text-black" />
      </div>
    </div>
  );
};
