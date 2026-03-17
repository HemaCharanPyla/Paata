import React from 'react';
import { X, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  artist: string;
  lyrics: string;
  isLoading: boolean;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  isOpen,
  onClose,
  title,
  artist,
  lyrics,
  isLoading,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-2xl max-h-[80vh] bg-neo-pink neo-border neo-shadow-lg flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b-4 border-black flex items-center justify-between bg-neo-yellow">
              <div className="flex items-center gap-3">
                <Music size={24} className="text-black" />
                <div className="flex flex-col">
                  <h2 className="text-black font-display text-xl uppercase tracking-tighter leading-none">
                    {title}
                  </h2>
                  <p className="text-black/60 font-bold text-xs uppercase tracking-widest">
                    {artist}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white neo-border neo-shadow-sm flex items-center justify-center hover:bg-neo-pink transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide bg-white/50">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                  <div className="w-12 h-12 border-4 border-black border-t-neo-green rounded-full animate-spin" />
                  <p className="font-display uppercase text-black tracking-widest animate-pulse">
                    FETCHING VIBES...
                  </p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div className="text-black font-display text-2xl md:text-3xl uppercase tracking-tighter leading-relaxed whitespace-pre-wrap">
                    <Markdown>{lyrics}</Markdown>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-black text-neo-green font-mono text-[10px] uppercase tracking-[0.2em] text-center">
              AURA LYRICS ENGINE v1.0 // POWERED BY GEMINI
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
