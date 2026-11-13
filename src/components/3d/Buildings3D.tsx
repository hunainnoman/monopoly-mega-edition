'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Isometric 3D House (Green with pitched roof, illuminated faces & chimney)
export function House3D({ count = 1 }: { count?: number }) {
  return (
    <div className="flex items-end gap-0.5 filter drop-shadow-[0_3px_2px_rgba(0,0,0,0.35)]">
      {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, y: -10, rotate: -5 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: i * 0.08 }}
          className="relative w-4 h-4.5"
        >
          <svg viewBox="0 0 32 36" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`house-roof-left-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id={`house-roof-right-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <linearGradient id={`house-wall-left-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <linearGradient id={`house-wall-right-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#14532d" />
              </linearGradient>
            </defs>

            {/* Chimney */}
            <path d="M22 6 L25 8 L25 14 L22 12 Z" fill="#15803d" />
            <path d="M22 6 L19 8 L19 14 L22 12 Z" fill="#16a34a" />
            <ellipse cx="22" cy="6" rx="2" ry="1" fill="#0f172a" />

            {/* Roof Ridge & Slopes */}
            {/* Left Roof Slope */}
            <polygon points="16,4 4,12 16,19 28,11" fill={`url(#house-roof-left-${i})`} />
            {/* Right Roof Slope */}
            <polygon points="16,4 28,11 28,13 16,6" fill={`url(#house-roof-right-${i})`} />

            {/* Left Front Wall */}
            <polygon points="4,12 16,19 16,32 4,25" fill={`url(#house-wall-left-${i})`} />
            {/* Right Wall */}
            <polygon points="16,19 28,11 28,24 16,32" fill={`url(#house-wall-right-${i})`} />

            {/* Windows & Door */}
            <polygon points="7,17 11,19 11,23 7,21" fill="#fef08a" opacity="0.9" />
            <polygon points="12,24 15,26 15,31 12,29" fill="#14532d" />
            <polygon points="19,17 23,15 23,19 19,21" fill="#fef08a" opacity="0.9" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// Isometric 3D Hotel (Red with dual pitched roof & lit luxury windows)
export function Hotel3D() {
  return (
    <div className="relative">
      {/* Ground Impact Shockwave */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 2.2], opacity: [1, 0] }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full border-2 border-red-500 pointer-events-none"
      />
      <motion.div
        initial={{ scale: 0.2, y: -35 }}
        animate={{ scale: 1, y: 0, scaleY: [0.2, 1.3, 0.85, 1.05, 1] }}
        transition={{ type: 'spring', stiffness: 380, damping: 16 }}
        className="relative w-6 h-6 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.45)]"
      >
      <svg viewBox="0 0 40 40" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="hotel-roof-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="hotel-roof-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id="hotel-wall-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="hotel-wall-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>

        {/* Roof Structure */}
        <polygon points="20,4 4,14 20,22 36,12" fill="url(#hotel-roof-1)" />
        <polygon points="20,4 36,12 36,14 20,6" fill="url(#hotel-roof-2)" />

        {/* Front & Side Walls */}
        <polygon points="4,14 20,22 20,38 4,30" fill="url(#hotel-wall-left)" />
        <polygon points="20,22 36,12 36,28 20,38" fill="url(#hotel-wall-right)" />

        {/* Hotel Windows (Lit Golden) */}
        <polygon points="7,19 11,21 11,24 7,22" fill="#fef08a" />
        <polygon points="13,22 17,24 17,27 13,25" fill="#fef08a" />
        <polygon points="7,25 11,27 11,30 7,28" fill="#fef08a" />
        <polygon points="13,28 17,30 17,33 13,31" fill="#fef08a" />

        {/* Right Wall Windows */}
        <polygon points="23,20 27,18 27,21 23,23" fill="#fef08a" />
        <polygon points="29,17 33,15 33,18 29,20" fill="#fef08a" />
        <polygon points="23,25 27,23 27,26 23,28" fill="#fef08a" />
        <polygon points="29,22 33,20 33,23 29,25" fill="#fef08a" />

        {/* Grand Hotel Entrance */}
        <polygon points="9,31 15,34 15,38 9,35" fill="#450a0a" />
        <polygon points="8,31 16,35 16,36 8,32" fill="#fef08a" />
      </svg>
    </motion.div>
  </div>
  );
}

// Isometric 3D Skyscraper (High-rise metallic blue tower with setbacks, antenna & glowing glass)
export function Skyscraper3D() {
  return (
    <div className="relative">
      {/* Skyward Spotlight Beam */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: [0, 0.9, 0], height: [0, 90, 0] }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-2 bg-gradient-to-t from-cyan-400 via-sky-300 to-transparent blur-[1px] pointer-events-none"
      />
      {/* Ground Impact Shockwave */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 2.5], opacity: [1, 0] }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-4 rounded-full border-2 border-sky-400 pointer-events-none"
      />
      <motion.div
        initial={{ scale: 0.2, y: -50, rotateX: 25 }}
        animate={{ scale: 1, y: 0, rotateX: 0, scaleY: [0.2, 1.35, 0.85, 1.05, 1] }}
        transition={{ type: 'spring', stiffness: 340, damping: 16 }}
        className="relative w-7 h-10 filter drop-shadow-[0_8px_8px_rgba(2,132,199,0.5)]"
      >
      <svg viewBox="0 0 44 64" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="sky-glass-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="sky-glass-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>
          <linearGradient id="sky-roof" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <linearGradient id="antenna-glow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Spire / Antenna with glowing red warning light */}
        <line x1="22" y1="2" x2="22" y2="12" stroke="url(#antenna-glow)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="22" cy="2" r="1.5" fill="#ef4444" className="animate-ping" />
        <circle cx="22" cy="2" r="1" fill="#fee2e2" />

        {/* Top Tier Tower (Setback 2) */}
        <polygon points="22,12 16,15 22,18 28,15" fill="url(#sky-roof)" />
        <polygon points="16,15 22,18 22,25 16,22" fill="url(#sky-glass-light)" />
        <polygon points="22,18 28,15 28,22 22,25" fill="url(#sky-glass-dark)" />

        {/* Middle Tier Tower (Setback 1) */}
        <polygon points="22,24 12,28 22,33 32,28" fill="url(#sky-roof)" />
        <polygon points="12,28 22,33 22,42 12,37" fill="url(#sky-glass-light)" />
        <polygon points="22,33 32,28 32,37 22,42" fill="url(#sky-glass-dark)" />

        {/* Base Tower (Main High-rise) */}
        <polygon points="22,40 6,46 22,52 38,46" fill="url(#sky-roof)" />
        <polygon points="6,46 22,52 22,64 6,58" fill="url(#sky-glass-light)" />
        <polygon points="22,52 38,46 38,58 22,64" fill="url(#sky-glass-dark)" />

        {/* Glowing Window Strips (Floor by Floor) */}
        <line x1="9" y1="48" x2="19" y2="52" stroke="#bae6fd" strokeWidth="0.8" opacity="0.9" />
        <line x1="9" y1="51" x2="19" y2="55" stroke="#bae6fd" strokeWidth="0.8" opacity="0.9" />
        <line x1="9" y1="54" x2="19" y2="58" stroke="#bae6fd" strokeWidth="0.8" opacity="0.9" />
        <line x1="9" y1="57" x2="19" y2="61" stroke="#bae6fd" strokeWidth="0.8" opacity="0.9" />

        <line x1="25" y1="52" x2="35" y2="48" stroke="#7dd3fc" strokeWidth="0.8" opacity="0.8" />
        <line x1="25" y1="55" x2="35" y2="51" stroke="#7dd3fc" strokeWidth="0.8" opacity="0.8" />
        <line x1="25" y1="58" x2="35" y2="54" stroke="#7dd3fc" strokeWidth="0.8" opacity="0.8" />
      </svg>
    </motion.div>
  </div>
  );
}

// Isometric 3D Train Depot (Industrial steel shed on railroad tracks)
export function TrainDepot3D() {
  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 2], opacity: [1, 0] }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full border border-slate-400 pointer-events-none"
      />
      <motion.div
        initial={{ scale: 0.2, y: -25 }}
        animate={{ scale: 1, y: 0, scaleY: [0.2, 1.25, 0.9, 1] }}
        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
        className="relative w-5 h-5 filter drop-shadow-[0_3px_3px_rgba(0,0,0,0.4)]"
      >
      <svg viewBox="0 0 36 36" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="depot-roof" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="depot-wall" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>

        {/* Arched Roof */}
        <polygon points="18,4 4,12 18,19 32,11" fill="url(#depot-roof)" />
        <polygon points="4,12 18,19 18,32 4,25" fill="url(#depot-wall)" />
        <polygon points="18,19 32,11 32,24 18,32" fill="#1e293b" />

        {/* Train Tunnel Portal */}
        <ellipse cx="11" cy="26" rx="4" ry="5" fill="#0f172a" />
        <rect x="7" y="26" width="8" height="5" fill="#0f172a" />

        {/* Tracks */}
        <line x1="9" y1="31" x2="13" y2="33" stroke="#94a3b8" strokeWidth="1" />
        <line x1="8" y1="33" x2="12" y2="35" stroke="#94a3b8" strokeWidth="1" />
      </svg>
    </motion.div>
  </div>
  );
}
