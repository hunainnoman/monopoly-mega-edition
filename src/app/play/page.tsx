'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameState, PeerMessage, Player } from '../../types/game';
import { MobileLobbyJoin } from '../../components/mobile/MobileLobbyJoin';
import { MobileController } from '../../components/mobile/MobileController';
import { Loader2 } from 'lucide-react';

function PlayContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams?.get('code') || '';

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [roomCode, setRoomCode] = useState<string>(initialCode);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeRoomCodeRef = useRef<string>('');
  activeRoomCodeRef.current = roomCode;

  // Polling loop to stay synchronized in real-time
  useEffect(() => {
    if (!player || !roomCode) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/game?roomCode=${encodeURIComponent(activeRoomCodeRef.current)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.state) {
            setGameState(data.state);
          }
        }
      } catch (e) {
        // Silently retry on next poll interval
      }
    }, 600);

    return () => clearInterval(interval);
  }, [player, roomCode]);

  const handleJoin = async (targetRoomCode: string, name: string, color: string, tokenIcon: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const cleanCode = targetRoomCode.toUpperCase().trim();
      setRoomCode(cleanCode);

      const playerId = `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newPlayer: Player = {
        id: playerId,
        name,
        color,
        tokenIcon,
        balance: 2500,
        position: 0,
        inJail: false,
        jailTurns: 0,
        getOutOfJailCards: 0,
        busTickets: [],
        isBankrupt: false,
        isConnected: true,
      };

      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'JOIN_LOBBY',
          roomCode: cleanCode,
          player: newPlayer,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to join room. Verify the room code on your laptop.');
        setIsLoading(false);
        return;
      }

      setGameState(data.state);
      setPlayer(newPlayer);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to join:', err);
      setErrorMessage(err?.message || 'Could not connect to host. Make sure host board is open.');
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (msg: PeerMessage) => {
    if (!player || !roomCode) return;

    try {
      // Map PeerMessage to API Action payload
      const { type, ...restMsg } = msg as any;
      const payload: any = {
        action: type,
        roomCode,
        playerId: player.id,
        ...restMsg,
      };

      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setGameState(data.state);
        }
      }
    } catch (err) {
      console.error('Error sending action:', err);
    }
  };

  if (!gameState || !player) {
    return (
      <MobileLobbyJoin
        initialRoomCode={initialCode}
        onJoin={handleJoin}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <MobileController
      player={player}
      gameState={gameState}
      onSendMessage={handleSendMessage}
    />
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    }>
      <PlayContent />
    </Suspense>
  );
}
