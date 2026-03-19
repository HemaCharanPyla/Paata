import React from 'react';
import { motion } from 'motion/react';

export const SplashScreen: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-neo-yellow flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Shapes */}
      <motion.div 
        animate={{ 
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.2, 1, 0.8, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute -top-20 -left-20 w-64 h-64 bg-neo-pink neo-border opacity-20"
      />
      <motion.div 
        animate={{ 
          rotate: [360, 270, 180, 90, 0],
          scale: [1, 0.8, 1, 1.2, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-20 -right-20 w-80 h-80 bg-neo-blue neo-border opacity-20"
      />

      {/* Main Logo Animation */}
      <div className="relative">
        <motion.div 
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2
          }}
          className="w-32 h-32 bg-neo-pink neo-border neo-shadow-lg flex items-center justify-center relative z-10"
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [45, 55, 45]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 bg-black neo-border rotate-45" 
          />
        </motion.div>
        
        {/* Shadow/Ghost elements */}
        <motion.div 
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: 0.5, x: 10, y: 10 }}
          transition={{ delay: 0.4 }}
          className="absolute inset-0 bg-black neo-border -z-0"
        />
      </div>

      {/* Text Animation */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-7xl font-display uppercase tracking-tighter text-black"
        >
          AURA <span className="bg-neo-green px-2 neo-border neo-shadow-sm">CLIP</span>
        </motion.h1>
        
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
          className="h-2 bg-black neo-border w-48"
        />
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-sm font-bold uppercase tracking-[0.3em] text-black/60"
        >
          Loading Sonic Experience
        </motion.p>
      </div>

      {/* Progress Bar (Visual only) */}
      <div className="absolute bottom-12 w-64 h-4 bg-white neo-border p-1 overflow-hidden">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="h-full bg-neo-blue"
        />
      </div>
    </motion.div>
  );
};
