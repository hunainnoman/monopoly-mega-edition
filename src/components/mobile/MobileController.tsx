'use client';

import React, { useState } from 'react';
import { GameState, PeerMessage, Player } from '../../types/game';
import { BOARD_SPACES, COLOR_HEX_MAP } from '../../data/boardData';
import { canBuildHouse, canBuildSkyscraper, canBuildTrainDepot, canPlayBusTicketToSpace, getMonopolyTier } from '../../lib/gameEngine';
import { audio } from '../../lib/audio';
import { House3D, Hotel3D, Skyscraper3D, TrainDepot3D } from '../3d/Buildings3D';
import { 
  Building2, 
  Bus, 
  Dices, 
  Gavel, 
  Play, 
  Sparkles, 
  Ticket 
} from 'lucide-react';

interface MobileControllerProps {
  player: Player;
  gameState: GameState;
  onSendMessage: (msg: PeerMessage) => void;
}

export function MobileController({ player, gameState, onSendMessage }: MobileControllerProps) {
  const [activeTab, setActiveTab] = useState<'ACTIONS' | 'DEEDS' | 'BUS_TICKETS'>('ACTIONS');

  // Screen Wake Lock to prevent phone from locking during game night
  React.useEffect(() => {
    let wakeLock: any = null;
    async function requestWakeLock() {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.warn('WakeLock not granted:', err);
        }
      }
    }
    requestWakeLock();
    return () => {
      if (wakeLock) wakeLock.release().catch(() => {});
    };
  }, []);

  // Sync fresh player object from gameState
  const currentPlayer = gameState.players.find((p) => p.id === player.id) || player;
  const activePlayer = gameState.players[gameState.activePlayerIndex];
  const isMyTurn = activePlayer?.id === currentPlayer.id;

  const currentSpace = BOARD_SPACES[currentPlayer.position];

  // Haptic feedback helper
  const handleTap = (action: () => void) => {
    audio.triggerHaptic(40);
    action();
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white flex flex-col justify-between select-none">
      
      {/* 1. TOP STICKY BAR: Wallet & Status */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          
          {/* Player Identity */}
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md border-2 border-white/20"
              style={{ backgroundColor: currentPlayer.color }}
            >
              {currentPlayer.tokenIcon || currentPlayer.name.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">{currentPlayer.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {currentSpace?.name || 'On Board'}
              </div>
            </div>
          </div>

          {/* Cash Balance Display */}
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Balance</div>
            <div className="text-xl font-mono font-black text-emerald-400">
              ${currentPlayer.balance}
            </div>
          </div>
        </div>

        {/* Turn Status Alert Pill */}
        <div className={`mt-2.5 py-1 px-3 rounded-lg text-center text-xs font-bold transition-all ${
          isMyTurn 
            ? 'bg-amber-500 text-slate-950 animate-pulse' 
            : 'bg-slate-800 text-slate-400'
        }`}>
          {isMyTurn ? "IT'S YOUR TURN!" : `Waiting for ${activePlayer?.name || 'others'}...`}
        </div>
      </header>

      {/* 2. MAIN BODY AREA */}
      <main className="flex-1 p-4 overflow-y-auto">

        {/* ================= TAB 1: ACTIONS ================= */}
        {activeTab === 'ACTIONS' && (
          <div className="space-y-4">
            
            {/* LOBBY STATE */}
            {gameState.status === 'LOBBY' && (
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">In Pre-Game Lobby</h3>
                <p className="text-xs text-slate-400">
                  Waiting for host to start the game on the laptop screen.
                </p>
                <div className="text-xs text-emerald-400 font-mono font-bold">
                  Starting Bankroll: $2,500
                </div>
              </div>
            )}

            {/* ROLLING DICE & JAIL CONTROLS (When it's your turn and waiting for roll) */}
            {gameState.status === 'PLAYING' && isMyTurn && gameState.turnPhase === 'WAITING_FOR_ROLL' && (
              <div className="space-y-3">
                {/* JAILED PLAYER DECISIONS */}
                {currentPlayer.inJail ? (
                  <div className="p-4 bg-red-950/50 border-2 border-red-500/60 rounded-2xl space-y-3 text-center">
                    <div className="text-xs font-black uppercase tracking-wider text-red-400">
                      🔒 You Are In Jail (Turn {currentPlayer.jailTurns + 1}/3)
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Choose an exit option before rolling or try for doubles:
                    </p>

                    <div className="space-y-2 pt-1">
                      {/* Pay $50 Bail */}
                      <button
                        onClick={() => handleTap(() => onSendMessage({ type: 'PAY_JAIL_FEE' }))}
                        disabled={currentPlayer.balance < 50}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Pay $50 Bail Fee</span>
                        <span className="text-[10px] text-emerald-200">(Rolls 3 dice)</span>
                      </button>

                      {/* Use Jail Free Card */}
                      {currentPlayer.getOutOfJailCards > 0 && (
                        <button
                          onClick={() => handleTap(() => onSendMessage({ type: 'USE_JAIL_CARD' }))}
                          className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Use Jail Card ({currentPlayer.getOutOfJailCards} held)</span>
                          <span className="text-[10px] text-amber-200">(Rolls 3 dice)</span>
                        </button>
                      )}

                      {/* Roll White Dice for Doubles */}
                      <button
                        onClick={() => handleTap(() => onSendMessage({ type: 'ROLL_DICE' }))}
                        className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Dices className="w-4 h-4" />
                        <span>Roll White Dice (Free - Doubles to Exit)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* STANDARD 3-DICE ROLL */
                  <>
                    <button
                      onClick={() => handleTap(() => onSendMessage({ type: 'ROLL_DICE' }))}
                      className="w-full py-6 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 rounded-2xl shadow-xl font-black text-xl tracking-wider uppercase text-white flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Dices className="w-7 h-7" />
                        <span>ROLL 3 DICE</span>
                      </div>
                      <span className="text-[11px] font-normal tracking-normal text-white/80">
                        2 White Dice + Blue Speed Die
                      </span>
                    </button>

                    {/* Option to play Bus Ticket instead of rolling */}
                    {currentPlayer.busTickets.length > 0 && (
                      <button
                        onClick={() => setActiveTab('BUS_TICKETS')}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-yellow-400 flex items-center justify-center gap-2 transition-all"
                      >
                        <Bus className="w-4 h-4" />
                        Play Bus Ticket Instead ({currentPlayer.busTickets.length} held)
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* SPEED DIE BUS ICON RESOLUTION */}
            {gameState.status === 'PLAYING' && isMyTurn && gameState.turnPhase === 'SPEED_BUS_CHOICE' && (
              <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl space-y-3 text-center">
                <div className="inline-block p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Bus className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wide">
                  Speed Die: Bus Icon Rolled!
                </h3>
                <p className="text-xs text-slate-300">Choose one action:</p>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  <button
                    onClick={() => handleTap(() => onSendMessage({ type: 'RESOLVE_BUS_CHOICE', choice: 'ticket' }))}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs text-white shadow-md transition-all"
                  >
                    🎫 Draw a Bus Ticket
                  </button>
                  <button
                    onClick={() => handleTap(() => onSendMessage({ type: 'RESOLVE_BUS_CHOICE', choice: 'chance_chest' }))}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-xs text-white shadow-md transition-all"
                  >
                    ⏩ Advance to Nearest Chance / Community Chest
                  </button>
                </div>
              </div>
            )}

            {/* TRIPLES RESOLUTION (Pick ANY space on the board) */}
            {gameState.status === 'PLAYING' && isMyTurn && gameState.turnPhase === 'TRIPLES_CHOICE' && (
              <div className="p-4 bg-purple-500/10 border-2 border-purple-500/40 rounded-2xl space-y-3">
                <div className="text-center">
                  <h3 className="text-sm font-black text-purple-300 uppercase tracking-wide">
                    🎉 Triples Rolled! Teleport Anywhere!
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">Select any space on the 52-space board:</p>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {BOARD_SPACES.map((space) => (
                    <button
                      key={space.index}
                      onClick={() => handleTap(() => onSendMessage({ type: 'RESOLVE_TRIPLES_CHOICE', targetIndex: space.index }))}
                      className="w-full p-2 bg-slate-900 hover:bg-purple-900/40 border border-slate-800 rounded-xl text-left flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-200">{space.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">#{space.index}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* UNOWNED PROPERTY DECISION: BUY OR AUCTION */}
            {gameState.status === 'PLAYING' && isMyTurn && gameState.turnPhase === 'SPACE_RESOLUTION' && (
              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div className="text-center">
                  <div className="text-xs text-slate-400 uppercase font-semibold">You Landed On</div>
                  <h3 className="text-base font-black text-white mt-0.5">{currentSpace.name}</h3>
                  <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                    Price: ${currentSpace.cost}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleTap(() => onSendMessage({ type: 'BUY_PROPERTY', propertyIndex: currentSpace.index }))}
                    disabled={currentPlayer.balance < (currentSpace.cost || 0)}
                    className="py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Buy for ${currentSpace.cost}
                  </button>
                  <button
                    onClick={() => handleTap(() => onSendMessage({ type: 'PASS_PROPERTY_TO_AUCTION', propertyIndex: currentSpace.index }))}
                    className="py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    Auction
                  </button>
                </div>
              </div>
            )}

            {/* LIVE AUCTION PADDLE */}
            {gameState.auctionState && (
              <div className="p-5 bg-purple-950/40 border-2 border-purple-500/50 rounded-2xl shadow-xl space-y-4">
                <div className="text-center">
                  <div className="text-xs text-purple-300 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
                    <Gavel className="w-3.5 h-3.5" /> Live Auction
                  </div>
                  <h3 className="text-base font-black text-white mt-1">
                    {BOARD_SPACES[gameState.auctionState.propertyIndex]?.name}
                  </h3>
                  <div className="text-2xl font-mono font-black text-purple-300 mt-1">
                    Current Bid: ${gameState.auctionState.currentBid}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Leader: {gameState.auctionState.highestBidderId ? (
                      gameState.players.find(p => p.id === gameState.auctionState?.highestBidderId)?.name
                    ) : 'None'}
                  </div>
                </div>

                {/* Quick Bid Increments */}
                <div className="grid grid-cols-3 gap-2">
                  {[10, 50, 100].map((inc) => {
                    const newBid = (gameState.auctionState?.currentBid || 0) + inc;
                    return (
                      <button
                        key={inc}
                        onClick={() => handleTap(() => onSendMessage({ type: 'PLACE_BID', amount: newBid }))}
                        disabled={currentPlayer.balance < newBid}
                        className="py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        +${inc}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleTap(() => onSendMessage({ type: 'FOLD_BID' }))}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                >
                  Pass / Fold
                </button>
              </div>
            )}

            {/* END TURN / ACTION BUTTON */}
            {gameState.status === 'PLAYING' && isMyTurn && gameState.turnPhase === 'TURN_ACTIONS' && (
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => handleTap(() => onSendMessage({ type: 'END_TURN' }))}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-black text-base text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Play className="w-5 h-5" />
                  END TURN
                </button>
              </div>
            )}

            {/* NOT YOUR TURN STATUS CARD */}
            {gameState.status === 'PLAYING' && !isMyTurn && (
              <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800/80 text-center space-y-2">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Active Turn</div>
                <div className="text-base font-bold text-slate-200">
                  {activePlayer?.name}&apos;s Turn
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your property deeds or review Bus Tickets below.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: MY PROPERTY DEEDS ================= */}
        {activeTab === 'DEEDS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                My Title Deeds
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Majority Monopoly = 2/3 or 3/4
              </span>
            </div>

            {/* Deeds Grid */}
            <div className="space-y-2.5">
              {BOARD_SPACES.filter(
                (space) => gameState.properties[space.index]?.ownerId === currentPlayer.id
              ).map((space) => {
                const prop = gameState.properties[space.index];
                const colorHex = space.color ? COLOR_HEX_MAP[space.color] : '#475569';
                const tier = space.color ? getMonopolyTier(currentPlayer.id, space.color, gameState.properties) : 'NONE';
                const houseCheck = canBuildHouse(currentPlayer.id, space.index, gameState.properties, gameState.bankInventory.houses, currentPlayer.balance);
                const skyCheck = canBuildSkyscraper(currentPlayer.id, space.index, gameState.properties, gameState.bankInventory.skyscrapers, currentPlayer.balance);
                const depotCheck = canBuildTrainDepot(currentPlayer.id, space.index, gameState.properties, gameState.bankInventory.depots, currentPlayer.balance);

                return (
                  <div key={space.index} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    
                    {/* Color Banner & Space Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: colorHex }} />
                        <span className="text-xs font-bold text-white">{space.name}</span>
                      </div>
                      
                      {/* Monopoly Tier Badge */}
                      {tier === 'COMPLETE' ? (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                          Complete (3x Rent)
                        </span>
                      ) : tier === 'MAJORITY' ? (
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-500/30">
                          Majority (Can Build)
                        </span>
                      ) : null}
                    </div>

                    {/* Current Upgrades status with 3D Models */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono py-1">
                      {prop.hasSkyscraper && (
                        <div className="flex items-center gap-1.5">
                          <Skyscraper3D />
                          <span className="text-blue-400 font-bold">Skyscraper</span>
                        </div>
                      )}
                      {prop.hasHotel && !prop.hasSkyscraper && (
                        <div className="flex items-center gap-1.5">
                          <Hotel3D />
                          <span className="text-red-400 font-bold">Hotel</span>
                        </div>
                      )}
                      {prop.houses > 0 && !prop.hasHotel && !prop.hasSkyscraper && (
                        <div className="flex items-center gap-1.5">
                          <House3D count={prop.houses} />
                          <span className="text-emerald-400 font-bold">{prop.houses} House{prop.houses > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {prop.hasDepot && (
                        <div className="flex items-center gap-1.5">
                          <TrainDepot3D />
                          <span className="text-red-400 font-bold">Train Depot</span>
                        </div>
                      )}
                      {!prop.hasSkyscraper && !prop.hasHotel && prop.houses === 0 && !prop.hasDepot && (
                        <span>Unimproved</span>
                      )}
                    </div>

                    {/* Building Upgrade Buttons */}
                    <div className="flex gap-1.5 pt-1">
                      {space.type === 'street' && (
                        <>
                          {/* House Button */}
                          <button
                            onClick={() => handleTap(() => onSendMessage({ type: 'BUILD_HOUSE', propertyIndex: space.index }))}
                            disabled={!houseCheck.canBuild}
                            className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-[10px] font-bold text-white rounded-lg transition-all"
                            title={houseCheck.reason}
                          >
                            + House (${space.streetDeed?.buildCost})
                          </button>

                          {/* Skyscraper Button */}
                          {prop.hasHotel && (
                            <button
                              onClick={() => handleTap(() => onSendMessage({ type: 'BUILD_SKYSCRAPER', propertyIndex: space.index }))}
                              disabled={!skyCheck.canBuild}
                              className="flex-1 py-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-40 text-[10px] font-bold text-white rounded-lg transition-all"
                              title={skyCheck.reason}
                            >
                              + Skyscraper (${space.streetDeed?.buildCost})
                            </button>
                          )}
                        </>
                      )}

                      {/* Train Depot Button for Railroads */}
                      {space.type === 'railroad' && !prop.hasDepot && (
                        <button
                          onClick={() => handleTap(() => onSendMessage({ type: 'BUILD_DEPOT', propertyIndex: space.index }))}
                          disabled={!depotCheck.canBuild}
                          className="flex-1 py-1.5 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-[10px] font-bold text-white rounded-lg transition-all"
                          title={depotCheck.reason}
                        >
                          + Train Depot ($100)
                        </button>
                      )}
                    </div>

                    {/* Mortgage / Unmortgage Action */}
                    <div className="pt-1.5 border-t border-slate-800 flex gap-2">
                      {!prop.isMortgaged ? (
                        <button
                          onClick={() => handleTap(() => onSendMessage({ type: 'MORTGAGE_PROPERTY', propertyIndex: space.index }))}
                          disabled={prop.houses > 0 || prop.hasHotel || prop.hasSkyscraper || prop.hasDepot}
                          className="flex-1 py-1 bg-slate-800 hover:bg-amber-950/60 border border-amber-600/40 disabled:opacity-30 text-[9.5px] font-bold text-amber-300 rounded-lg transition-all"
                          title={prop.houses > 0 || prop.hasHotel ? "Must sell buildings first" : "Mortgage property for cash"}
                        >
                          Mortgage (+${space.streetDeed?.mortgageValue || Math.floor((space.cost || 100) / 2)})
                        </button>
                      ) : (
                        <button
                          onClick={() => handleTap(() => onSendMessage({ type: 'UNMORTGAGE_PROPERTY', propertyIndex: space.index }))}
                          disabled={currentPlayer.balance < Math.ceil((space.streetDeed?.mortgageValue || Math.floor((space.cost || 100) / 2)) * 1.1)}
                          className="flex-1 py-1 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-500/50 disabled:opacity-30 text-[9.5px] font-bold text-emerald-300 rounded-lg transition-all"
                        >
                          Lift Mortgage (-${Math.ceil((space.streetDeed?.mortgageValue || Math.floor((space.cost || 100) / 2)) * 1.1)})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* No properties owned yet */}
              {BOARD_SPACES.filter((s) => gameState.properties[s.index]?.ownerId === currentPlayer.id).length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  You do not own any properties yet. Land on spaces or bid in auctions to acquire title deeds!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: BUS TICKETS HAND ================= */}
        {activeTab === 'BUS_TICKETS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                My Bus Tickets ({currentPlayer.busTickets.length})
              </h3>
              <span className="text-[10px] text-yellow-500 font-mono">
                Ride along your current board side
              </span>
            </div>

            <div className="space-y-2.5">
              {currentPlayer.busTickets.map((ticket, idx) => (
                <div key={ticket.id || idx} className="p-3 bg-yellow-950/30 border border-yellow-600/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-bold text-yellow-300">{ticket.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{ticket.description}</p>

                  {/* Play Ticket Action (Only during roll pending on your turn) */}
                  {isMyTurn && gameState.turnPhase === 'WAITING_FOR_ROLL' && (
                    <div className="pt-1">
                      <div className="text-[10px] text-slate-400 mb-1">Pick a destination on your board side:</div>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {BOARD_SPACES.filter((s) => canPlayBusTicketToSpace(currentPlayer.position, s.index)).map((target) => (
                          <button
                            key={target.index}
                            onClick={() => handleTap(() => onSendMessage({
                              type: 'PLAY_BUS_TICKET',
                              ticketId: ticket.id,
                              targetIndex: target.index,
                            }))}
                            className="w-full p-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded text-left flex items-center justify-between text-[11px] text-white"
                          >
                            <span>{target.name}</span>
                            <span className="text-yellow-400 text-[10px]">Select</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {currentPlayer.busTickets.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No Bus Tickets held. Draw tickets by landing on Bus Ticket spaces or rolling the Bus icon on the Speed Die!
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3. BOTTOM TAB NAVIGATION */}
      <nav className="sticky bottom-0 z-30 bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('ACTIONS')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all ${
            activeTab === 'ACTIONS' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Dices className="w-5 h-5" />
          <span>Game Turn</span>
        </button>

        <button
          onClick={() => setActiveTab('DEEDS')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all ${
            activeTab === 'DEEDS' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span>My Deeds</span>
        </button>

        <button
          onClick={() => setActiveTab('BUS_TICKETS')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all ${
            activeTab === 'BUS_TICKETS' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Ticket className="w-5 h-5" />
          <span>Bus Hand</span>
        </button>
      </nav>
    </div>
  );
}
