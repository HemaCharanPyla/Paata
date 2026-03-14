import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2 } from 'lucide-react';
import { Track } from '../types';
import { cn } from '../lib/utils';

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
    <div className="h-24 bg-neutral-100 dark:bg-black border-t border-neutral-200 dark:border-neutral-800 px-4 flex items-center justify-between transition-colors duration-300">
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
          className="w-14 h-14 rounded shadow-lg"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col overflow-hidden">
          <span className="text-neutral-900 dark:text-white text-sm font-medium truncate hover:underline cursor-pointer">
            {currentTrack.title}
          </span>
          <span className="text-neutral-500 dark:text-neutral-400 text-xs truncate hover:underline cursor-pointer">
            {currentTrack.artist}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 max-w-[40%] w-full">
        <div className="flex items-center gap-6">
          <button className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
            <Shuffle size={18} />
          </button>
          <button onClick={onPrev} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
            <SkipBack size={24} fill="currentColor" />
          </button>
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" className="text-white dark:text-black" />
            ) : (
              <Play size={20} fill="currentColor" className="text-white dark:text-black ml-1" />
            )}
          </button>
          <button onClick={onNext} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
            <SkipForward size={24} fill="currentColor" />
          </button>
          <button className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
            <Repeat size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full">
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 min-w-[30px] text-right">
            {formatTime(progress)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={handleProgressChange}
            className="flex-1 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full appearance-none cursor-pointer accent-neutral-900 dark:accent-white hover:accent-[#1DB954]"
          />
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 min-w-[30px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume & Extra */}
      <div className="flex items-center justify-end gap-3 w-[30%]">
        <Volume2 size={18} className="text-neutral-500 dark:text-neutral-400" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-24 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full appearance-none cursor-pointer accent-neutral-900 dark:accent-white hover:accent-[#1DB954]"
        />
        <Maximize2 size={18} className="text-neutral-500 dark:text-neutral-400" />
      </div>
    </div>
  );
};
