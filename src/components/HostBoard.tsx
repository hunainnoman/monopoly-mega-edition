'use client';

import React from 'react';
import { GameState } from '../types/game';
import { BOARD_SPACES } from '../data/boardData';
import { BoardTile } from './BoardTile';
import { CenterStage } from './CenterStage';
import { CardFlipModal } from './animations/CardFlipModal';
import { JailBarsOverlay } from './animations/JailBarsOverlay';
import { FloatingMoneyFX } from './animations/FloatingMoneyFX';
import { audio } from '../lib/audio';

interface HostBoardProps {
  gameState: GameState;
  originUrl: string;
  onStartGame?: () => void;
}

export function HostBoard({ gameState, originUrl, onStartGame }: HostBoardProps) {
  const [displayPositions, setDisplayPositions] = React.useState<Record<string, number>>({});
  const [jailedPlayerName, setJailedPlayerName] = React.useState<string | null>(null);
  const isSteppingRef = React.useRef<Record<string, boolean>>({});
  const prevJailStatusRef = React.useRef<Record<string, boolean>>({});

  // Step-by-Step Animated Pawn Hopping
  React.useEffect(() => {
    gameState.players.forEach((player) => {
      // Check if player just got sent to jail
      if (player.inJail && !prevJailStatusRef.current[player.id]) {
        setJailedPlayerName(player.name);
      }
      prevJailStatusRef.current[player.id] = player.inJail;

      const curr = displayPositions[player.id];
      if (curr === undefined) {
        setDisplayPositions((prev) => ({ ...prev, [player.id]: player.position }));
        return;
      }

      if (curr !== player.position && !isSteppingRef.current[player.id]) {
        const target = player.position;
        const forwardDistance = (target - curr + 52) % 52;

        if (forwardDistance > 0 && forwardDistance <= 18 && !player.inJail) {
          // Walk step-by-step clockwise!
          isSteppingRef.current[player.id] = true;
          let step = curr;

          const stepInterval = setInterval(() => {
            step = (step + 1) % 52;
            audio.playTokenHop();
            setDisplayPositions((prev) => ({ ...prev, [player.id]: step }));

            if (step === target) {
              clearInterval(stepInterval);
              isSteppingRef.current[player.id] = false;
            }
          }, 130);
        } else {
          // Instant jump (jail transfer or long teleport)
          setDisplayPositions((prev) => ({ ...prev, [player.id]: target }));
        }
      }
    });
  }, [gameState.players, displayPositions]);

  // Dismiss card draw handler
  const handleDismissCard = async () => {
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DISMISS_CARD_DRAW', roomCode: gameState.roomCode }),
      });
    } catch (e) {}
  };

  // Map players to their current visual animated positions on the board
  const playersByPosition: Record<number, typeof gameState.players> = {};
  gameState.players.forEach((p) => {
    const pos = displayPositions[p.id] !== undefined ? displayPositions[p.id] : p.position;
    if (!playersByPosition[pos]) {
      playersByPosition[pos] = [];
    }
    playersByPosition[pos].push(p);
  });

  const activePlayer = gameState.players[gameState.activePlayerIndex];
  const activeTurnSpaceIndex = activePlayer ? (displayPositions[activePlayer.id] ?? activePlayer.position) : -1;

  // Track layout definitions (4 perimeter tracks + 4 corners):
  // Corner 0: GO (Bottom-Right)
  // Side 1 (Bottom): Spaces 11 down to 1 (Connecticut -> Mediterranean)
  // Corner 12: In Jail (Bottom-Left)
  // Side 2 (Left): Spaces 13 to 24 (Maryland -> Auction)
  // Corner 25: Free Parking (Top-Left)
  // Side 3 (Top): Spaces 26 to 37 (Kentucky -> California)
  // Corner 38: Go To Jail (Top-Right)
  // Side 4 (Right): Spaces 39 to 51 (Pacific -> Boardwalk)

  const bottomSpaces = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((idx) => BOARD_SPACES[idx]);
  const leftSpaces = [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13].map((idx) => BOARD_SPACES[idx]); // top to bottom
  const topSpaces = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37].map((idx) => BOARD_SPACES[idx]);
  const rightSpaces = [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51].map((idx) => BOARD_SPACES[idx]);

  const cornerSize = '12.5%';
  const trackSpan = '75%';

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#0b0f19] via-[#111827] to-[#030712] p-3 flex items-center justify-center select-none overflow-hidden">
      
      {/* Deluxe 3D Embossed Mahogany Board Frame */}
      <div className="relative w-full h-full max-w-[1280px] max-h-[920px] aspect-square rounded-3xl p-3 bg-gradient-to-br from-[#2b1810] via-[#1c0f0a] to-[#0d0705] border-[6px] border-[#52301c] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-2 ring-[#d97706]/30">
        
        {/* Inner Board Mat (Authentic Cream/Parchment finish with vintage feel) */}
        <div className="relative w-full h-full bg-[#f4f1e6] rounded-2xl overflow-hidden border-2 border-[#1e293b]">
          
          {/* ================= CORNER 0: GO (Bottom-Right) ================= */}
          <div 
            style={{ width: cornerSize, height: cornerSize, right: 0, bottom: 0 }}
            className="absolute z-10"
          >
            <BoardTile
              space={BOARD_SPACES[0]}
              orientation="corner"
              playersOnSpace={playersByPosition[0] || []}
              allPlayers={gameState.players}
              isActiveTurnSpace={0 === activeTurnSpaceIndex}
            />
          </div>

          {/* ================= SIDE 1: BOTTOM TRACK (Spaces 11 down to 1) ================= */}
          <div 
            style={{ width: trackSpan, height: cornerSize, left: cornerSize, bottom: 0 }}
            className="absolute flex flex-row z-0"
          >
            {bottomSpaces.map((space) => (
              <div key={space.index} className="flex-1 h-full">
                <BoardTile
                  space={space}
                  orientation="bottom"
                  property={gameState.properties[space.index]}
                  playersOnSpace={playersByPosition[space.index] || []}
                  allPlayers={gameState.players}
                  isActiveTurnSpace={space.index === activeTurnSpaceIndex}
                />
              </div>
            ))}
          </div>

          {/* ================= CORNER 12: IN JAIL (Bottom-Left) ================= */}
          <div 
            style={{ width: cornerSize, height: cornerSize, left: 0, bottom: 0 }}
            className="absolute z-10"
          >
            <BoardTile
              space={BOARD_SPACES[12]}
              orientation="corner"
              playersOnSpace={playersByPosition[12] || []}
              allPlayers={gameState.players}
              isActiveTurnSpace={12 === activeTurnSpaceIndex}
            />
          </div>

          {/* ================= SIDE 2: LEFT TRACK (Spaces 24 down to 13) ================= */}
          <div 
            style={{ width: cornerSize, height: trackSpan, left: 0, top: cornerSize }}
            className="absolute flex flex-col z-0"
          >
            {leftSpaces.map((space) => (
              <div key={space.index} className="flex-1 w-full">
                <BoardTile
                  space={space}
                  orientation="left"
                  property={gameState.properties[space.index]}
                  playersOnSpace={playersByPosition[space.index] || []}
                  allPlayers={gameState.players}
                  isActiveTurnSpace={space.index === activeTurnSpaceIndex}
                />
              </div>
            ))}
          </div>

          {/* ================= CORNER 25: FREE PARKING (Top-Left) ================= */}
          <div 
            style={{ width: cornerSize, height: cornerSize, left: 0, top: 0 }}
            className="absolute z-10"
          >
            <BoardTile
              space={BOARD_SPACES[25]}
              orientation="corner"
              playersOnSpace={playersByPosition[25] || []}
              allPlayers={gameState.players}
              isActiveTurnSpace={25 === activeTurnSpaceIndex}
            />
          </div>

          {/* ================= SIDE 3: TOP TRACK (Spaces 26 to 37) ================= */}
          <div 
            style={{ width: trackSpan, height: cornerSize, left: cornerSize, top: 0 }}
            className="absolute flex flex-row z-0"
          >
            {topSpaces.map((space) => (
              <div key={space.index} className="flex-1 h-full">
                <BoardTile
                  space={space}
                  orientation="top"
                  property={gameState.properties[space.index]}
                  playersOnSpace={playersByPosition[space.index] || []}
                  allPlayers={gameState.players}
                  isActiveTurnSpace={space.index === activeTurnSpaceIndex}
                />
              </div>
            ))}
          </div>

          {/* ================= CORNER 38: GO TO JAIL (Top-Right) ================= */}
          <div 
            style={{ width: cornerSize, height: cornerSize, right: 0, top: 0 }}
            className="absolute z-10"
          >
            <BoardTile
              space={BOARD_SPACES[38]}
              orientation="corner"
              playersOnSpace={playersByPosition[38] || []}
              allPlayers={gameState.players}
              isActiveTurnSpace={38 === activeTurnSpaceIndex}
            />
          </div>

          {/* ================= SIDE 4: RIGHT TRACK (Spaces 39 to 51) ================= */}
          <div 
            style={{ width: cornerSize, height: trackSpan, right: 0, top: cornerSize }}
            className="absolute flex flex-col z-0"
          >
            {rightSpaces.map((space) => (
              <div key={space.index} className="flex-1 w-full">
                <BoardTile
                  space={space}
                  orientation="right"
                  property={gameState.properties[space.index]}
                  playersOnSpace={playersByPosition[space.index] || []}
                  allPlayers={gameState.players}
                  isActiveTurnSpace={space.index === activeTurnSpaceIndex}
                />
              </div>
            ))}
          </div>

          {/* ================= CENTER STAGE (Lobby, Dice Tray, Supply) ================= */}
          <div 
            style={{ 
              width: trackSpan, 
              height: trackSpan, 
              left: cornerSize, 
              top: cornerSize 
            }}
            className="absolute z-10 p-2"
          >
            <CenterStage
              gameState={gameState}
              originUrl={originUrl}
              onStartGame={onStartGame}
            />
          </div>
        </div>
      </div>

      {/* Global Animation FX Overlays */}
      <CardFlipModal cardDraw={gameState.activeCardDraw} onDismiss={handleDismissCard} />
      <JailBarsOverlay jailedPlayerName={jailedPlayerName} onDismiss={() => setJailedPlayerName(null)} />
      <FloatingMoneyFX players={gameState.players} />
    </div>
  );
}
