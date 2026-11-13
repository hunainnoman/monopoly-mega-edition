'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { GameState } from '../../../types/game';
import { HostBoard } from '../../../components/HostBoard';
import { HostGameManager } from '../../../lib/hostGameManager';
import { audio } from '../../../lib/audio';
import { 
  fireAuctionWonCelebration, 
  firePassGOCelebration, 
  fireSkyscraperCelebration 
} from '../../../lib/celebrations';
import { 
  publishState, 
  subscribeToActions 
} from '../../../lib/realtimeSync';

export default function HostRoomPage() {
  const params = useParams();
  const roomCode = ((params?.roomCode as string) || 'MEGA').toUpperCase().trim();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [originUrl, setOriginUrl] = useState<string>('');

  const managerRef = useRef<HostGameManager | null>(null);
  const prevRollRef = useRef<any>(null);
  const prevLogCountRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
    }

    // 1. Initialize Authoritative Host Game Manager in Browser
    const manager = new HostGameManager(roomCode, `host-${roomCode}`, (newState) => {
      setGameState({ ...newState });
      publishState(roomCode, newState);

      // Trigger audio & visual celebrations
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
    });

    managerRef.current = manager;
    const initial = manager.getState();
    setGameState(initial);
    publishState(roomCode, initial);

    // 2. Subscribe to actions coming from mobile phones
    const unsubscribeActions = subscribeToActions(roomCode, (payload) => {
      const mgr = managerRef.current;
      if (!mgr) return;

      const { action, playerId, player, ...extra } = payload;

      switch (action) {
        case 'JOIN_LOBBY':
          if (player) {
            mgr.handlePlayerJoin(player);
          }
          break;
        case 'START_GAME':
          mgr.handleStartGame();
          break;
        case 'ROLL_DICE':
          mgr.handleRollDice(playerId);
          break;
        case 'RESOLVE_BUS_CHOICE':
          mgr.handleBusChoice(playerId, extra.choice);
          break;
        case 'RESOLVE_TRIPLES_CHOICE':
          mgr.handleTriplesChoice(playerId, extra.targetIndex);
          break;
        case 'RESOLVE_BIRTHDAY_CHOICE':
          mgr.handleBirthdayChoice(playerId, extra.choice);
          break;
        case 'BUY_PROPERTY':
          mgr.handleBuyProperty(playerId, extra.propertyIndex);
          break;
        case 'PASS_PROPERTY_TO_AUCTION':
          mgr.handlePassPropertyToAuction(extra.propertyIndex);
          break;
        case 'PLACE_BID':
          mgr.handlePlaceBid(playerId, extra.amount);
          break;
        case 'FOLD_BID':
          mgr.handleFoldBid(playerId);
          break;
        case 'PLAY_BUS_TICKET':
          mgr.handlePlayBusTicket(playerId, extra.ticketId, extra.targetIndex);
          break;
        case 'BUILD_HOUSE':
          mgr.handleBuildHouse(playerId, extra.propertyIndex);
          break;
        case 'BUILD_SKYSCRAPER':
          mgr.handleBuildSkyscraper(playerId, extra.propertyIndex);
          break;
        case 'BUILD_DEPOT':
          mgr.handleBuildDepot(playerId, extra.propertyIndex);
          break;
        case 'MORTGAGE_PROPERTY':
          mgr.handleMortgageProperty(playerId, extra.propertyIndex);
          break;
        case 'UNMORTGAGE_PROPERTY':
          mgr.handleUnmortgageProperty(playerId, extra.propertyIndex);
          break;
        case 'PAY_JAIL_FEE':
          mgr.handlePayJailFee(playerId);
          break;
        case 'USE_JAIL_CARD':
          mgr.handleUseJailCard(playerId);
          break;
        case 'END_TURN':
          mgr.handleEndTurn(playerId);
          break;
        case 'REQUEST_SYNC':
          publishState(roomCode, mgr.getState());
          break;
      }
    });

    // 3. Heartbeat state broadcast (every 1.5s) to guarantee all phones stay in sync
    const broadcastInterval = setInterval(() => {
      const mgr = managerRef.current;
      if (mgr) {
        publishState(roomCode, mgr.getState());
      }
    }, 1500);

    return () => {
      unsubscribeActions();
      clearInterval(broadcastInterval);
    };
  }, [roomCode]);

  const handleStartGame = () => {
    const mgr = managerRef.current;
    if (mgr) {
      mgr.handleStartGame();
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
