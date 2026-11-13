'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Dices, 
  Laptop, 
  Play, 
  Smartphone, 
  Sparkles, 
  Train, 
  ShieldCheck 
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      router.push(`/play?code=${joinCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-red-500 selection:text-white">
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Navbar Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-sm tracking-widest uppercase rounded-lg shadow-md border border-red-500/30">
            MONOPOLY
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
            THE MEGA EDITION
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Free • WebRTC P2P</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Jackbox-Style Split Architecture: Laptop Board + Phone Controllers</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-2xl leading-none">
          High-Velocity Monopoly on Your Big Screen.
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
          The official Mega Edition rules: 52 spaces, the <span className="text-blue-400 font-semibold">Speed Die</span>, <span className="text-indigo-400 font-semibold">Bus Tickets</span>, <span className="text-emerald-400 font-semibold">Majority Monopolies</span>, <span className="text-blue-400 font-semibold">Skyscrapers</span>, and <span className="text-red-400 font-semibold">Train Depots</span>.
        </p>

        {/* Action Choice Grid: HOST vs JOIN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-10">
          
          {/* Card 1: Host Display */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl hover:border-red-500/50 transition-all flex flex-col justify-between text-left group">
            <div>
              <div className="w-12 h-12 bg-red-600/20 text-red-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Laptop className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-black text-white">Host on Laptop / TV</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Displays the 52-space board, animated player tokens, 3D dice rolling tray, card draws, and room QR code.
              </p>
            </div>

            <Link
              href="/host"
              className="mt-6 w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-white" />
              Launch Host Board
            </Link>
          </div>

          {/* Card 2: Mobile Player Companion */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl hover:border-indigo-500/50 transition-all flex flex-col justify-between text-left group">
            <div>
              <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Smartphone className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-xl font-black text-white">Join with Phone</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Your personal handheld controller: $2,500 wallet, tactile 3-dice roller, deed portfolio, and auction paddle.
              </p>
            </div>

            <form onSubmit={handleJoinSubmit} className="mt-6 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="ROOM CODE"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center font-mono font-bold text-sm tracking-widest text-indigo-300 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Mega Edition Mechanics Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl mt-12 text-left">
          <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
            <div className="text-blue-400 font-bold text-xs flex items-center gap-1.5">
              <Dices className="w-4 h-4" /> Speed Die
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              $1, 2, 3$ pips, Mr. Monopoly leaps, Bus tickets, and Triples board teleports.
            </p>
          </div>

          <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
            <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Majority Rules
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Build houses with 2/3 or 3/4 ownership. Trigger strategic housing shortages!
            </p>
          </div>

          <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
            <div className="text-indigo-400 font-bold text-xs flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Skyscrapers
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Complete monopolies unlock Skyscraper upgrades with massive $3,000 rents.
            </p>
          </div>

          <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
            <div className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
              <Train className="w-4 h-4" /> Train Depots
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              $100 upgrade to double railroad rents up to $400 - $800 payouts.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-2">
        <div>Deployed on Vercel • 100% Free WebRTC Peer-to-Peer DataChannels</div>
        <div>Monopoly: The Mega Edition (Philip E. Orbanes / Winning Moves Games)</div>
      </footer>
    </div>
  );
}
