'use client';

import React from 'react';
import { BoardSpace, Player, PropertyOwnership } from '../types/game';
import { COLOR_HEX_MAP } from '../data/boardData';
import { House3D, Hotel3D, Skyscraper3D, TrainDepot3D } from './3d/Buildings3D';
import { motion } from 'framer-motion';
import { 
  Train, 
  Zap, 
  Droplets, 
  Flame, 
  HelpCircle, 
  Gift, 
  Compass, 
  DollarSign, 
  Building2, 
  Landmark, 
  Gavel, 
  Bus 
} from 'lucide-react';

export type TileOrientation = 'bottom' | 'left' | 'top' | 'right' | 'corner';

interface BoardTileProps {
  space: BoardSpace;
  orientation: TileOrientation;
  property?: PropertyOwnership;
  playersOnSpace: Player[];
  allPlayers: Player[];
  isActiveTurnSpace?: boolean;
}

export function BoardTile({ space, orientation, property, playersOnSpace, allPlayers, isActiveTurnSpace }: BoardTileProps) {
  const isStreet = space.type === 'street';
  const colorHex = space.color ? COLOR_HEX_MAP[space.color] : undefined;
  const owner = property?.ownerId ? allPlayers.find((p) => p.id === property.ownerId) : null;

  // Icon for non-street spaces
  const renderIcon = (size = 'w-4 h-4') => {
    if (space.type === 'railroad') return <Train className={`${size} text-slate-800`} />;
    if (space.type === 'utility') {
      if (space.name.includes('Electric')) return <Zap className={`${size} text-amber-500 fill-amber-400`} />;
      if (space.name.includes('Water')) return <Droplets className={`${size} text-blue-500 fill-blue-400`} />;
      if (space.name.includes('Gas')) return <Flame className={`${size} text-orange-500 fill-orange-400`} />;
    }
    if (space.type === 'chance') return <HelpCircle className={`${size} text-amber-600 fill-amber-100`} />;
    if (space.type === 'community_chest') return <Gift className={`${size} text-blue-600 fill-blue-100`} />;
    if (space.type === 'tax') return <DollarSign className={`${size} text-red-600`} />;
    if (space.actionType === 'auction') return <Gavel className={`${size} text-purple-700`} />;
    if (space.actionType === 'bus_ticket') return <Bus className={`${size} text-amber-600 fill-amber-200`} />;
    if (space.actionType === 'birthday_gift') return <Gift className={`${size} text-pink-500 fill-pink-200`} />;
    return null;
  };

  // ================= 1. CORNER TILES =================
  if (space.type === 'corner') {
    if (space.cornerType === 'go') {
      return (
        <div className="relative w-full h-full bg-[#fbf9f1] border-2 border-[#1e293b] p-1 flex flex-col items-center justify-between shadow-inner select-none overflow-hidden">
          <div className="text-[7.5px] font-black uppercase text-red-600 text-center leading-none mt-0.5">
            COLLECT $200 SALARY
          </div>
          <div className="flex flex-col items-center justify-center my-auto">
            <span className="text-3xl font-black tracking-tighter text-red-600 leading-none">
              GO
            </span>
            <div className="flex items-center text-red-600 mt-0.5">
              <span className="text-[8px] font-black uppercase tracking-wider">AS YOU PASS</span>
              <span className="text-base font-black ml-1 leading-none">←</span>
            </div>
          </div>
          <div className="text-[6.5px] font-mono font-bold text-slate-500 uppercase">Start Track</div>
          <TokenOverlay players={playersOnSpace} />
        </div>
      );
    }

    if (space.cornerType === 'jail') {
      return (
        <div className="relative w-full h-full bg-[#fbf9f1] border-2 border-[#1e293b] flex shadow-inner select-none overflow-hidden">
          {/* Outer L-band: JUST VISITING */}
          <div className="w-1/3 h-full bg-slate-200 border-r border-slate-400 flex flex-col justify-around items-center text-[7px] font-black tracking-widest text-slate-700 uppercase writing-mode-vertical py-1">
            <span>VISITING</span>
            <span>JUST</span>
          </div>
          {/* Inner Jail Cell */}
          <div className="flex-1 h-full bg-amber-500/20 p-1 flex flex-col items-center justify-center text-center">
            <div className="p-1 bg-slate-800 text-white rounded-md mb-0.5">
              <Landmark className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] font-black tracking-wider text-slate-900 leading-none">
              IN JAIL
            </span>
          </div>
          <TokenOverlay players={playersOnSpace} />
        </div>
      );
    }

    if (space.cornerType === 'free_parking') {
      return (
        <div className="relative w-full h-full bg-[#fbf9f1] border-2 border-[#1e293b] p-1 flex flex-col items-center justify-between shadow-inner select-none overflow-hidden">
          <div className="text-[8px] font-black text-red-600 uppercase">FREE</div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-2xl">🚗</div>
            <span className="text-[8px] font-black text-red-600 uppercase mt-0.5">PARKING</span>
          </div>
          <div className="text-[6.5px] font-mono text-slate-400">SAFE HAVEN</div>
          <TokenOverlay players={playersOnSpace} />
        </div>
      );
    }

    if (space.cornerType === 'go_to_jail') {
      return (
        <div className="relative w-full h-full bg-[#fbf9f1] border-2 border-[#1e293b] p-1 flex flex-col items-center justify-between shadow-inner select-none overflow-hidden">
          <div className="text-[8px] font-black text-blue-700 uppercase">GO TO</div>
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-1.5 bg-blue-600 text-white rounded-full shadow-sm">
              <Compass className="w-4 h-4 animate-spin text-white" />
            </div>
            <span className="text-[9px] font-black text-blue-900 uppercase mt-1 leading-none">JAIL</span>
          </div>
          <div className="text-[6px] font-mono text-red-600 font-bold uppercase text-center leading-tight">
            DO NOT PASS GO
          </div>
          <TokenOverlay players={playersOnSpace} />
        </div>
      );
    }
  }

  // ================= 2. PERIMETER STREET & UTILITY TILES =================
  // Directional layouts based on track orientation:
  // - bottom: Color bar at top (facing center)
  // - top: Color bar at bottom (facing center)
  // - left: Color bar on right (facing center)
  // - right: Color bar on left (facing center)

  const isVerticalTrack = orientation === 'left' || orientation === 'right';

  return (
    <div className={`relative w-full h-full bg-[#fbf9f1] border border-[#334155]/60 hover:border-indigo-600 select-none transition-all flex shadow-xs ${
      isVerticalTrack ? (orientation === 'right' ? 'flex-row' : 'flex-row-reverse') : (orientation === 'bottom' ? 'flex-col' : 'flex-col-reverse')
    }`}>
      
      {/* 3D BUILDINGS LAYER (Pops out with true 3D isometric height) */}
      <div className="absolute -top-3.5 right-0.5 z-20 pointer-events-none filter drop-shadow-md">
        {property?.hasSkyscraper && <Skyscraper3D />}
        {property?.hasHotel && !property.hasSkyscraper && <Hotel3D />}
        {property && property.houses > 0 && !property.hasHotel && !property.hasSkyscraper && (
          <House3D count={property.houses} />
        )}
        {space.type === 'railroad' && property?.hasDepot && <TrainDepot3D />}
      </div>

      {/* Street Color Banner */}
      {isStreet && colorHex && (
        <div 
          className={`border-[#334155]/40 flex items-center justify-center ${
            isVerticalTrack 
              ? `w-3 h-full ${orientation === 'right' ? 'border-r rounded-l-xs' : 'border-l rounded-r-xs'}` 
              : `w-full h-3 ${orientation === 'bottom' ? 'border-b rounded-t-xs' : 'border-t rounded-b-xs'}`
          }`}
          style={{ backgroundColor: colorHex }}
        />
      )}

      {/* Main Tile Body */}
      <div className="flex-1 flex flex-col justify-between p-0.5 overflow-hidden text-center z-0">
        
        {/* Name and Icon */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {renderIcon()}
          <span className="font-bold text-[7.5px] leading-[9px] text-slate-800 line-clamp-2 px-0.5 mt-0.5">
            {space.name}
          </span>
        </div>

        {/* Cost / Rent / Owner Footer */}
        <div className="flex items-center justify-between px-0.5 pt-0.5 border-t border-slate-200/80 text-[7px] font-mono">
          {space.cost ? (
            <span className="font-bold text-slate-700">${space.cost}</span>
          ) : space.taxAmount ? (
            <span className="font-bold text-red-600">${space.taxAmount}</span>
          ) : (
            <span />
          )}

          {owner && (
            <div 
              className="w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-black text-white shadow-xs border border-white"
              style={{ backgroundColor: owner.color }}
              title={`Owned by ${owner.name}`}
            >
              {owner.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Mortgaged stamp */}
      {property?.isMortgaged && (
        <div className="absolute inset-0 bg-red-950/80 backdrop-blur-[0.5px] flex items-center justify-center z-10">
          <span className="text-white font-black text-[7px] uppercase tracking-wider rotate-[-25deg] border border-white px-1 shadow-md">
            MORTGAGED
          </span>
        </div>
      )}

      {/* Active Turn Tile Spotlight Aura */}
      {isActiveTurnSpace && (
        <div className="absolute inset-0 ring-2 ring-amber-400 shadow-[inset_0_0_15px_rgba(251,191,36,0.5),0_0_15px_rgba(251,191,36,0.7)] animate-pulse pointer-events-none z-20" />
      )}

      {/* 3D Player Tokens */}
      <TokenOverlay players={playersOnSpace} />
    </div>
  );
}

// Token Overlay Component with Floor Shadow and Isometric Hop Physics
function TokenOverlay({ players }: { players: Player[] }) {
  if (players.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center gap-0.5 p-0.5 flex-wrap z-30">
      {players.map((player) => (
        <div key={player.id} className="relative flex flex-col items-center">
          {/* Floor Shadow Squashing under token */}
          <motion.div
            animate={{
              scaleX: [1, 0.65, 1],
              opacity: [0.6, 0.25, 0.6],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: 'easeInOut',
            }}
            className="absolute -bottom-0.5 w-3.5 h-1.5 bg-black/40 rounded-full blur-[0.5px]"
          />

          {/* 3D Floating / Hopping Token Body */}
          <motion.div
            animate={{ 
              y: [0, -8, 0],
              scale: [1, 1.18, 1],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.2, 
              ease: 'easeInOut',
              repeatDelay: Math.random() * 0.2
            }}
            className="relative w-4.5 h-4.5 rounded-full border border-white shadow-lg flex items-center justify-center text-[8px] font-black text-white"
            style={{ backgroundColor: player.color }}
            title={player.name}
          >
            {player.tokenIcon || player.name.charAt(0)}
            <div 
              className="absolute inset-0 rounded-full animate-ping opacity-35 pointer-events-none" 
              style={{ backgroundColor: player.color }} 
            />
          </motion.div>
        </div>
      ))}
    </div>
  );
}
