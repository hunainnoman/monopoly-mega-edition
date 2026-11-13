'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuctionState, Player } from '../../types/game';
import { Gavel, Sparkles } from 'lucide-react';
import { audio } from '../../lib/audio';

interface AuctionStage3DProps {
  auctionState: AuctionState;
  players: Player[];
}

export function AuctionStage3D({ auctionState, players }: AuctionStage3DProps) {
  const [strikeGavel, setStrikeGavel] = useState(false);
  const highestBidder = players.find((p) => p.id === auctionState.highestBidderId);

  useEffect(() => {
    if (auctionState.currentBid > 0) {
      setStrikeGavel(true);
      audio.playAuctionGavel();
      const timer = setTimeout(() => setStrikeGavel(false), 500);
      return () => clearTimeout(timer);
    }
  }, [auctionState.currentBid]);

  return (
    <div className="w-full p-3 bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-purple-950/90 border-2 border-purple-400 rounded-2xl shadow-xl flex items-center justify-between gap-3 overflow-hidden relative">
      
      {/* Ambient Auction Spotlight Beam */}
      <div className="absolute inset-0 bg-radial from-purple-500/20 via-transparent to-transparent pointer-events-none" />

      {/* Left: 3D Animated Gavel & Sound Block */}
      <div className="relative w-16 h-14 flex items-center justify-center shrink-0">
        {/* Sound Block */}
        <div className="absolute bottom-1 w-12 h-3 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-950 rounded-md border border-amber-500/40 shadow-md" />

        {/* Shockwave ripple when struck */}
        {strikeGavel && (
          <motion.div
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute bottom-2 w-10 h-10 rounded-full border-2 border-amber-400 pointer-events-none"
          />
        )}

        {/* 3D Swinging Gavel */}
        <motion.div
          animate={strikeGavel ? { rotate: [-40, 25, 0], y: [0, 6, 0] } : { rotate: -15, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="relative origin-bottom-right z-10"
        >
          <svg viewBox="0 0 40 40" className="w-10 h-10 drop-shadow-md">
            {/* Gavel Handle */}
            <rect x="18" y="14" width="22" height="4" rx="2" fill="#78350f" transform="rotate(-30 20 20)" />
            {/* Brass Ring */}
            <rect x="21" y="14" width="4" height="4" fill="#fbbf24" transform="rotate(-30 20 20)" />
            {/* Gavel Head */}
            <rect x="6" y="8" width="12" height="18" rx="3" fill="#92400e" stroke="#fbbf24" strokeWidth="1" transform="rotate(-30 20 20)" />
          </svg>
        </motion.div>
      </div>

      {/* Center: Live Bidding Stats & Title */}
      <div className="flex-1 text-center min-w-0">
        <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-mono font-bold text-purple-300 tracking-wider">
          <Gavel className="w-3.5 h-3.5" />
          <span>Live Property Auction</span>
        </div>
        <div className="text-xl font-black font-mono tracking-tight text-white mt-0.5 truncate">
          ${auctionState.currentBid}
        </div>
        <div className="text-[10px] text-purple-300/80 font-medium truncate">
          {highestBidder ? (
            <span>Leading: <span className="text-white font-bold">{highestBidder.name}</span></span>
          ) : (
            'Awaiting Opening Bid from Mobile...'
          )}
        </div>
      </div>

      {/* Right: Animated Leader Paddle */}
      {highestBidder ? (
        <motion.div
          key={highestBidder.id + auctionState.currentBid}
          initial={{ y: 25, scale: 0.6, rotate: -10, opacity: 0 }}
          animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 18 }}
          className="shrink-0 flex flex-col items-center"
        >
          {/* Paddle Head */}
          <div
            className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center border-2 border-white text-white shadow-lg text-[9px] font-black"
            style={{ backgroundColor: highestBidder.color }}
          >
            <span className="text-xs">{highestBidder.tokenIcon || highestBidder.name.charAt(0)}</span>
            <span className="leading-none text-[8px] mt-0.5">${auctionState.currentBid}</span>
          </div>
          {/* Paddle Handle */}
          <div className="w-1.5 h-3 bg-stone-300 rounded-b border-x border-stone-400" />
        </motion.div>
      ) : (
        <div className="shrink-0 w-12 flex justify-center">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
        </div>
      )}
    </div>
  );
}
