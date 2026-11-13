'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameState, PeerMessage, Player } from '../../types/game';
import { MobileLobbyJoin } from '../../components/mobile/MobileLobbyJoin';
import { MobileController } from '../../components/mobile/MobileController';
import { 
  publishAction, 
  subscribeToState, 
  fetchLatestState 
} from '../../lib/realtimeSync';
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

  // Restore saved player from session storage if page reloaded
  useEffect(() => {
    if (!roomCode) return;
    try {
      const saved = sessionStorage.getItem(`monopoly_player_${roomCode}`);
      if (saved) {
        const p = JSON.parse(saved);
        if (p && p.id) {
          setPlayer(p);
          publishAction(roomCode, {
            actionId: `act-rejoin-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            action: 'JOIN_LOBBY',
            roomCode,
            playerId: p.id,
            player: p,
          });
        }
      }
    } catch (e) {}
  }, [roomCode]);

  // Real-time synchronization subscription to authoritative host state
  useEffect(() => {
    if (!roomCode) return;

    // Fetch initial state immediately
    fetchLatestState(roomCode).then((state) => {
      if (state) setGameState(state);
    });

    // Subscribe to continuous state stream from host
    const unsubscribe = subscribeToState(roomCode, (newState) => {
      if (newState && newState.roomCode === activeRoomCodeRef.current) {
        setGameState(newState);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomCode]);

  const handleJoin = async (targetRoomCode: string, name: string, color: string, tokenIcon: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const cleanCode = targetRoomCode.toUpperCase().trim();
      setRoomCode(cleanCode);

      // Re-use existing player ID for this session if available
      let playerId = '';
      try {
        const savedPid = sessionStorage.getItem(`monopoly_pid_${cleanCode}`);
        if (savedPid) playerId = savedPid;
      } catch (e) {}

      if (!playerId) {
        playerId = `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        try {
          sessionStorage.setItem(`monopoly_pid_${cleanCode}`, playerId);
        } catch (e) {}
      }

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

      try {
        sessionStorage.setItem(`monopoly_player_${cleanCode}`, JSON.stringify(newPlayer));
      } catch (e) {}

      const actionId = `act-join-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

      // 1. Direct real-time action publish to Authoritative Host
      const joinPayload = {
        actionId,
        action: 'JOIN_LOBBY',
        roomCode: cleanCode,
        playerId,
        player: newPlayer,
      };

      await publishAction(cleanCode, joinPayload);

      // 2. Also send to API endpoint as dual-dispatch fallback
      fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(joinPayload),
      }).catch(() => {});

      setPlayer(newPlayer);
      setIsLoading(false);

      // Request immediate sync from host
      publishAction(cleanCode, { 
        actionId: `act-sync-${Date.now()}`,
        action: 'REQUEST_SYNC', 
        roomCode: cleanCode 
      });
    } catch (err: any) {
      console.error('Failed to join:', err);
      setErrorMessage(err?.message || 'Could not connect to host. Make sure host board is open.');
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (msg: PeerMessage) => {
    if (!player || !roomCode) return;

    try {
      const { type, ...restMsg } = msg as any;
      const actionId = `act-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      const payload: any = {
        actionId,
        action: type,
        roomCode,
        playerId: player.id,
        ...restMsg,
      };

      // 1. Publish action to host via realtime pub-sub
      await publishAction(roomCode, payload);

      // 2. Also dual-dispatch to API endpoint
      fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
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

  // Find updated player state from gameState
  const currentSyncedPlayer = gameState.players.find((p) => p.id === player.id) || player;

  return (
    <MobileController
      player={currentSyncedPlayer}
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
