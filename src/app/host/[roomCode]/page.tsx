'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { GameState } from '../../../types/game';
import { HostBoard } from '../../../components/HostBoard';
import { audio } from '../../../lib/audio';
import { fireAuctionWonCelebration, firePassGOCelebration, fireSkyscraperCelebration } from '../../../lib/celebrations';

export default function HostRoomPage() {
  const params = useParams();
  const roomCode = ((params?.roomCode as string) || 'MEGA').toUpperCase().trim();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [originUrl, setOriginUrl] = useState<string>('');

  const prevRollRef = useRef<any>(null);
  const prevLogCountRef = useRef<number>(0);

  // Initialize Room in central store
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
    }

    async function initRoom() {
      try {
        const res = await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'CREATE_ROOM', roomCode }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.state) {
            setGameState(data.state);
            prevLogCountRef.current = data.state.log?.length || 0;
          }
        }
      } catch (err) {
        console.warn('Init room error:', err);
      }
    }

    initRoom();

    // Fast polling loop for Host Screen (every 500ms)
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/game?roomCode=${encodeURIComponent(roomCode)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.state) {
            const newState: GameState = data.state;

            // Trigger audio effects on state changes
            if (newState.lastDiceRoll && JSON.stringify(newState.lastDiceRoll) !== JSON.stringify(prevRollRef.current)) {
              audio.playDiceRoll();
              prevRollRef.current = newState.lastDiceRoll;
            }

            if (newState.log && newState.log.length > prevLogCountRef.current) {
              const latest = newState.log[0];
              if (latest.type === 'money') {
                audio.playCashCollect();
                if (latest.text.includes('GO')) firePassGOCelebration();
              } else if (latest.type === 'jail') {
                audio.playJail();
              } else if (latest.type === 'auction') {
                audio.playAuctionGavel();
                if (latest.text.includes('WON the auction')) fireAuctionWonCelebration();
              } else if (latest.type === 'build') {
                audio.playBuyProperty();
                if (latest.text.includes('SKYSCRAPER')) fireSkyscraperCelebration();
              }
              prevLogCountRef.current = newState.log.length;
            }

            setGameState(newState);
          }
        }
      } catch (e) {
        // Silently retry on next tick
      }
    }, 500);

    return () => clearInterval(interval);
  }, [roomCode]);

  const handleStartGame = async () => {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START_GAME', roomCode }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) setGameState(data.state);
      }
    } catch (err) {
      console.error('Failed to start game:', err);
    }
  };

  if (!gameState) {
    return (
      <div className="w-full h-screen bg-slate-900 flex items-center justify-center text-white font-mono text-sm">
        Initializing Monopoly: The Mega Edition Board...
      </div>
    );
  }

  return (
    <HostBoard
      gameState={gameState}
      originUrl={originUrl}
      onStartGame={handleStartGame}
    />
  );
}
