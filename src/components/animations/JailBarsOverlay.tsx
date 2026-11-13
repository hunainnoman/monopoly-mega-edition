'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert } from 'lucide-react';
import { audio } from '../../lib/audio';

interface JailBarsOverlayProps {
  jailedPlayerName?: string | null;
  onDismiss: () => void;
}

export function JailBarsOverlay({ jailedPlayerName, onDismiss }: JailBarsOverlayProps) {
  const [screenShake, setScreenShake] = useState(false);

  useEffect(() => {
    if (!jailedPlayerName) return;

    audio.playJailDoorSlam();
    
    // Trigger screen shake on impact
    const shakeTimer = setTimeout(() => {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 400);
    }, 280);

    const dismissTimer = setTimeout(() => {
      onDismiss();
    }, 3200);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(dismissTimer);
    };
  }, [jailedPlayerName, onDismiss]);

  if (!jailedPlayerName) return null;

  return (
    <AnimatePresence>
      <div 
        className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden transition-transform duration-75 ${
          screenShake ? 'translate-x-1.5 -translate-y-1' : ''
        }`}
      >
        {/* Dark Red Dimmed Vignette */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-red-950/40 backdrop-blur-[2px]"
        />

        {/* Heavy Iron Jail Bars Container */}
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="absolute inset-0 flex flex-col justify-between"
        >
          {/* Top Cross Beam */}
          <div className="w-full h-10 bg-gradient-to-b from-stone-800 via-stone-700 to-stone-900 border-b-4 border-stone-950 shadow-2xl flex items-center justify-around px-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-stone-950 shadow-inner border border-stone-600" />
            ))}
          </div>

          {/* Vertical Iron Bars */}
          <div className="flex-1 w-full flex justify-between px-6 pointer-events-none">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-full bg-gradient-to-r from-stone-800 via-stone-500 to-stone-900 border-x-2 border-stone-950 shadow-[0_0_12px_rgba(0,0,0,0.8)] relative"
              >
                {/* Metallic highlights & rivets */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-stone-950 border border-stone-600" />
                <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-stone-950 border border-stone-600" />
              </div>
            ))}
          </div>

          {/* Bottom Cross Beam */}
          <div className="w-full h-10 bg-gradient-to-t from-stone-800 via-stone-700 to-stone-900 border-t-4 border-stone-950 shadow-2xl flex items-center justify-around px-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-stone-950 shadow-inner border border-stone-600" />
            ))}
          </div>
        </motion.div>

        {/* Golden Padlock & Sentence Banner */}
        <motion.div
          initial={{ scale: 0, rotate: -45, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 18 }}
          className="relative z-10 bg-gradient-to-b from-stone-900 via-black to-stone-950 border-4 border-red-600 text-white rounded-3xl p-6 shadow-[0_0_50px_rgba(220,38,38,0.7)] text-center max-w-sm"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 border-2 border-amber-300 flex items-center justify-center text-stone-950 shadow-lg">
            <Lock className="w-9 h-9" />
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-3 text-red-500 font-mono font-bold text-xs uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4" />
            <span>ARREST WARRANT EXECUTED</span>
          </div>

          <h2 className="text-2xl font-black uppercase tracking-wider text-red-400 mt-1">
            GO TO JAIL!
          </h2>
          <p className="text-sm font-semibold text-stone-300 mt-1">
            <span className="text-white font-bold">{jailedPlayerName}</span> has been locked up!
          </p>
          <div className="mt-3 px-3 py-1.5 bg-red-950/60 border border-red-500/40 rounded-xl text-[11px] font-mono text-red-300">
            Do not pass GO. Do not collect $200.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
