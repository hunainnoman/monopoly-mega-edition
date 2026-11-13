'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Gift, Sparkles, X } from 'lucide-react';

interface CardFlipModalProps {
  cardDraw?: {
    type: 'chance' | 'community_chest';
    title: string;
    description: string;
    playerName: string;
    timestamp: number;
  } | null;
  onDismiss: () => void;
}

export function CardFlipModal({ cardDraw, onDismiss }: CardFlipModalProps) {
  useEffect(() => {
    if (!cardDraw) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [cardDraw, onDismiss]);

  if (!cardDraw) return null;

  const isChance = cardDraw.type === 'chance';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        {/* Confetti & sparkle ambient rays */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className={`w-[600px] h-[600px] rounded-full blur-3xl opacity-25 ${
              isChance ? 'bg-amber-500' : 'bg-blue-600'
            }`}
          />
        </div>

        {/* 3D Flipping Card Container */}
        <motion.div
          initial={{ scale: 0.3, y: 100, rotateY: 180, opacity: 0 }}
          animate={{ scale: 1, y: 0, rotateY: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{ perspective: 1200 }}
          className="relative w-full max-w-sm"
        >
          {/* Card Border & Vintage Frame */}
          <div
            className={`relative rounded-3xl p-6 shadow-2xl border-4 text-center select-none overflow-hidden ${
              isChance
                ? 'bg-gradient-to-b from-[#fff7ed] via-[#ffedd5] to-[#fed7aa] border-amber-600 text-amber-950 shadow-amber-900/40'
                : 'bg-gradient-to-b from-[#eff6ff] via-[#dbeafe] to-[#bfdbfe] border-blue-600 text-blue-950 shadow-blue-900/40'
            }`}
          >
            {/* Top decorative header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
              <span className="text-[11px] font-mono uppercase font-bold tracking-widest opacity-70">
                Mega Edition Deck
              </span>
              <button
                onClick={onDismiss}
                className="w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>

            {/* Icon & Deck Category Banner */}
            <div className="py-4 flex flex-col items-center">
              <motion.div
                animate={{ rotate: [-6, 6, -6], scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-2 ${
                  isChance
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-300 text-white'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-300 text-white'
                }`}
              >
                {isChance ? <HelpCircle className="w-10 h-10" /> : <Gift className="w-10 h-10" />}
              </motion.div>

              <h2 className="text-xl font-black uppercase tracking-widest mt-3">
                {isChance ? 'CHANCE' : 'COMMUNITY CHEST'}
              </h2>
              <p className="text-xs font-semibold opacity-75 mt-0.5">
                Drawn by <span className="font-bold underline">{cardDraw.playerName}</span>
              </p>
            </div>

            {/* Card Content & Action Text */}
            <div className="bg-white/70 backdrop-blur-xs rounded-2xl p-4 border border-black/10 shadow-inner my-2">
              <h3 className="text-base font-black tracking-tight leading-snug">
                {cardDraw.title}
              </h3>
              <p className="text-xs font-medium opacity-85 mt-2 leading-relaxed">
                {cardDraw.description}
              </p>
            </div>

            {/* Bottom Dismiss Tip */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase font-bold opacity-60">
              <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
              <span>Resolving on board...</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
