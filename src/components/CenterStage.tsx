'use client';

import React from 'react';
import { GameState } from '../types/game';
import { QRCodeSVG } from 'qrcode.react';
import { Building2, Home, Landmark, Train, Sparkles, ScrollText, Play, HelpCircle, Gift, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Die3D } from './3d/Dice3D';
import { AuctionStage3D } from './3d/AuctionStage3D';
import { generateRoomCode } from '../lib/p2p';
import { audio } from '../lib/audio';

interface CenterStageProps {
  gameState: GameState;
  originUrl: string;
  onStartGame?: () => void;
}

export function CenterStage({ gameState, originUrl, onStartGame }: CenterStageProps) {
  const [isMuted, setIsMuted] = React.useState(audio.getMuted());

  const toggleAudio = () => {
    const next = audio.toggleMute();
    setIsMuted(next);
  };

  const joinUrl = gameState.hostPeerId
    ? `${originUrl}/play?code=${gameState.roomCode}&hostId=${encodeURIComponent(gameState.hostPeerId)}`
    : `${originUrl}/play?code=${gameState.roomCode}`;

  const handleResetGame = () => {
    if (typeof window !== 'undefined') {
      const confirmReset = window.confirm(
        'Are you sure you want to reset the game?\nThis will remove all players and generate a fresh room code.'
      );
      if (confirmReset) {
        const newCode = generateRoomCode();
        window.location.href = `/host/${newCode}`;
      }
    }
  };

  return (
    <div className="relative w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-[#f8f6ed] via-[#ede8d5] to-[#e4dec5] rounded-xl border-2 border-[#b89758]/60 shadow-inner select-none overflow-hidden">
      
      {/* Decorative Vintage Corner Flourishes */}
      <div className="absolute top-1 left-1 text-[9px] font-mono text-[#b89758]/40 pointer-events-none">✦</div>
      <div className="absolute top-1 right-1 text-[9px] font-mono text-[#b89758]/40 pointer-events-none">✦</div>
      <div className="absolute bottom-1 left-1 text-[9px] font-mono text-[#b89758]/40 pointer-events-none">✦</div>
      <div className="absolute bottom-1 right-1 text-[9px] font-mono text-[#b89758]/40 pointer-events-none">✦</div>

      {/* Top Header: Game Title & Bank Inventory Supply & Reset Button */}
      <div className="flex items-center justify-between border-b-2 border-[#b89758]/40 pb-2 z-10">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white font-black text-xs tracking-widest uppercase rounded-md shadow-md border border-red-500/40">
            MONOPOLY
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-400/20 border border-amber-500/40 px-2 py-0.5 rounded shadow-2xs">
            THE MEGA EDITION • 52 SPACES
          </span>
        </div>

        {/* Physical Component Supply Counters + Reset Button */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1 bg-[#fdfcfa] px-2 py-1 rounded-md border border-[#b89758]/40 shadow-xs" title="Bank Houses Remaining">
            <Home className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-black text-slate-800">{gameState.bankInventory.houses}</span>
            <span className="text-[9px] text-slate-400">/ 32</span>
          </div>
          <div className="flex items-center gap-1 bg-[#fdfcfa] px-2 py-1 rounded-md border border-[#b89758]/40 shadow-xs" title="Bank Hotels Remaining">
            <Building2 className="w-3.5 h-3.5 text-red-600" />
            <span className="font-black text-slate-800">{gameState.bankInventory.hotels}</span>
            <span className="text-[9px] text-slate-400">/ 12</span>
          </div>
          <div className="flex items-center gap-1 bg-[#fdfcfa] px-2 py-1 rounded-md border border-[#b89758]/40 shadow-xs" title="Bank Skyscrapers Remaining">
            <Landmark className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-black text-slate-800">{gameState.bankInventory.skyscrapers}</span>
            <span className="text-[9px] text-slate-400">/ 8</span>
          </div>
          <div className="flex items-center gap-1 bg-[#fdfcfa] px-2 py-1 rounded-md border border-[#b89758]/40 shadow-xs" title="Bank Train Depots Remaining">
            <Train className="w-3.5 h-3.5 text-slate-700" />
            <span className="font-black text-slate-800">{gameState.bankInventory.depots}</span>
            <span className="text-[9px] text-slate-400">/ 4</span>
          </div>

          {/* Host Sound / Volume Toggle */}
          <button
            onClick={toggleAudio}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#fdfcfa] hover:bg-slate-100 text-slate-700 font-mono font-bold text-[10px] rounded-md shadow-xs border border-[#b89758]/40 transition-all active:scale-95 ml-1"
            title={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-600" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isMuted ? 'Muted' : 'Sound'}</span>
          </button>

          {/* Reset / New Room Button */}
          <button
            onClick={handleResetGame}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-600/90 hover:bg-red-700 text-white font-mono font-bold text-[10px] uppercase rounded-md shadow-sm border border-red-500/70 transition-all active:scale-95"
            title="Reset Game, Remove Players & Generate New Room Code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Center Content: LOBBY vs ACTIVE GAMEPLAY */}
      {gameState.status === 'LOBBY' ? (
        <div className="flex-1 flex flex-col items-center justify-center py-2 z-10">
          <div className="text-center mb-3">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Scan to Join with Mobile Phones</h2>
            <p className="text-xs text-slate-600 mt-0.5">Up to 4 players can connect from phone browsers</p>
          </div>

          <div className="flex items-center gap-6 bg-[#fdfcfa] p-4 rounded-2xl border-2 border-[#b89758]/60 shadow-lg">
            <div className="p-2 bg-white rounded-xl border border-slate-300 shadow-sm">
              <QRCodeSVG value={joinUrl} size={135} />
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Room Code</div>
              <div className="text-4xl font-mono font-black tracking-widest text-indigo-700 bg-indigo-50/80 px-4 py-2 rounded-xl border-2 border-indigo-200 shadow-inner">
                {gameState.roomCode}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                or visit: <span className="text-slate-800 font-bold">{originUrl}/play</span>
              </div>
            </div>
          </div>

          {/* Connected Players in Lobby */}
          <div className="mt-5 w-full max-w-lg">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Connected Players ({gameState.players.length})</span>
              {gameState.players.length >= 1 && onStartGame && (
                <button
                  onClick={onStartGame}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all uppercase tracking-wider active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" /> Start Mega Game
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {gameState.players.map((p) => (
                <div key={p.id} className="flex items-center gap-2 p-2 bg-[#fdfcfa] rounded-xl border border-[#b89758]/40 shadow-xs">
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs border border-white"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.tokenIcon || p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">{p.name}</div>
                    <div className="text-[10px] text-emerald-700 font-mono font-bold">$2,500 Bankroll</div>
                  </div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - gameState.players.length) }).map((_, i) => (
                <div key={i} className="flex items-center justify-center p-2 rounded-xl border-2 border-dashed border-[#b89758]/40 text-slate-400 text-xs font-mono">
                  Waiting for player {gameState.players.length + i + 1}...
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE GAMEPLAY STAGE */
        <div className="flex-1 flex gap-3 my-2 overflow-hidden z-10">
          
          {/* Left Column: Player Leaderboard / Wallets */}
          <div className="w-[30%] flex flex-col gap-1.5 overflow-y-auto pr-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#785b2e]">
              Players & Wallets
            </div>
            {gameState.players.map((p, idx) => {
              const isActive = idx === gameState.activePlayerIndex;
              return (
                <div
                  key={p.id}
                  className={`p-2 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-[#fdfcfa] border-amber-500 ring-2 ring-amber-400/50 shadow-md' 
                      : 'bg-[#fdfcfa]/70 border-[#b89758]/30 opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-xs border border-white"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.tokenIcon || p.name.charAt(0)}
                      </div>
                      <span className={`text-[11px] font-bold ${isActive ? 'text-amber-950 font-black' : 'text-slate-800'}`}>
                        {p.name}
                      </span>
                    </div>

                    {isActive && (
                      <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase tracking-wider">
                        Turn
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                    <span className="font-black text-emerald-700">${p.balance}</span>
                    {p.inJail && (
                      <span className="text-[8px] bg-red-100 text-red-700 font-bold px-1 rounded">
                        JAIL ({p.jailTurns})
                      </span>
                    )}
                    {p.busTickets.length > 0 && (
                      <span className="text-[8px] bg-yellow-100 text-yellow-800 font-bold px-1 rounded">
                        {p.busTickets.length} Bus
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Vintage Chance & Community Chest Card Slots */}
            <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-[#b89758]/30">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-md border border-amber-400/50 flex flex-col items-center justify-center text-center">
                <HelpCircle className="w-4 h-4 text-white mb-0.5" />
                <span className="text-[8px] font-black uppercase tracking-wider leading-none">CHANCE</span>
              </div>
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl shadow-md border border-blue-400/50 flex flex-col items-center justify-center text-center">
                <Gift className="w-4 h-4 text-white mb-0.5" />
                <span className="text-[8px] font-black uppercase tracking-wider leading-none">COMMUNITY</span>
              </div>
            </div>
          </div>

          {/* Center Column: Sunken Casino Felt Dice Tray & Current Event Box */}
          <div className="flex-1 flex flex-col items-center justify-between bg-[#064e3b] p-3 rounded-2xl border-4 border-[#b89758] shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] text-center">
            
            {/* Active Turn Banner */}
            <div className="w-full bg-slate-950/40 backdrop-blur-xs py-1.5 px-3 rounded-xl border border-white/10">
              <span className="text-[9px] uppercase tracking-widest text-amber-300 font-black">Current Action</span>
              <h3 className="text-sm font-black text-white mt-0.5 leading-snug">
                {gameState.currentActionText}
              </h3>
            </div>

            {/* 3D Animated Tumbling Dice Tray on Emerald Felt */}
            <div className="flex flex-col items-center justify-center my-auto py-2 w-full">
              {gameState.lastDiceRoll ? (
                <>
                  <div className="flex items-center justify-center gap-4 py-1">
                    {/* White Die 1 */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[8px] uppercase font-black text-emerald-200 font-mono">White Die 1</span>
                      <Die3D 
                        value={gameState.lastDiceRoll.die1} 
                        rollKey={gameState.lastDiceRoll.die1 * 13 + gameState.lastDiceRoll.die2} 
                      />
                    </div>

                    {/* White Die 2 */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[8px] uppercase font-black text-emerald-200 font-mono">White Die 2</span>
                      <Die3D 
                        value={gameState.lastDiceRoll.die2} 
                        rollKey={gameState.lastDiceRoll.die2 * 17 + gameState.lastDiceRoll.die1} 
                      />
                    </div>

                    {/* Blue Speed Die */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[8px] uppercase font-black text-blue-300 font-mono">Speed Die</span>
                      <Die3D 
                        value={typeof gameState.lastDiceRoll.speedDie === 'number' ? gameState.lastDiceRoll.speedDie : 1}
                        isSpeedDie={true}
                        speedFace={gameState.lastDiceRoll.speedDie}
                        rollKey={gameState.lastDiceRoll.totalMovement + 99}
                      />
                    </div>
                  </div>

                  {/* Dice Total Calculation & Action Explanation */}
                  <div className="mt-2 px-3 py-1 bg-slate-950/60 border border-white/20 rounded-xl text-xs font-mono font-bold text-white shadow-md">
                    {typeof gameState.lastDiceRoll.speedDie === 'number' ? (
                      <span>
                        Movement: {gameState.lastDiceRoll.die1} + {gameState.lastDiceRoll.die2} + {gameState.lastDiceRoll.speedDie} = <span className="text-emerald-400 font-black">{gameState.lastDiceRoll.totalMovement} spaces</span>
                      </span>
                    ) : gameState.lastDiceRoll.speedDie === 'bus' ? (
                      <span className="text-amber-300">
                        Moved {gameState.lastDiceRoll.die1 + gameState.lastDiceRoll.die2} spaces + 🚌 Bus Choice
                      </span>
                    ) : (
                      <span className="text-purple-300">
                        Moved {gameState.lastDiceRoll.die1 + gameState.lastDiceRoll.die2} spaces + 🎩 Mr. Monopoly Leap
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-xs text-emerald-200/80 font-bold py-4 px-4 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  Waiting for active player to roll from mobile...
                </div>
              )}
            </div>

            {/* 3D Live Auction Stage with Gavel & Bid Paddles */}
            {gameState.auctionState && (
              <AuctionStage3D
                auctionState={gameState.auctionState}
                players={gameState.players}
              />
            )}
          </div>

          {/* Right Column: Live Event Log */}
          <div className="w-[30%] flex flex-col bg-[#fdfcfa] p-2.5 rounded-2xl border-2 border-[#b89758]/40 shadow-sm overflow-hidden">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider pb-1.5 border-b border-[#b89758]/30">
              <ScrollText className="w-3.5 h-3.5 text-slate-600" />
              Game Feed
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 mt-2 pr-1 text-left text-[10px] font-mono leading-tight">
              {gameState.log.slice(0, 15).map((entry) => (
                <div 
                  key={entry.id} 
                  className={`p-1.5 rounded-lg border ${
                    entry.type === 'money' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' :
                    entry.type === 'card' ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' :
                    entry.type === 'auction' ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold' :
                    entry.type === 'jail' ? 'bg-red-50 border-red-300 text-red-900 font-bold' :
                    entry.type === 'build' ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' :
                    'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {entry.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer */}
      <div className="flex items-center justify-between border-t border-[#b89758]/30 pt-1.5 text-[9px] text-[#785b2e] font-mono z-10">
        <div>Monopoly: The Mega Edition (Philip E. Orbanes / Winning Moves Games)</div>
        <div>Vercel Deployment • Real-Time Engine Active</div>
      </div>
    </div>
  );
}
