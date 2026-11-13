import { NextResponse } from 'next/server';
import { getGame, getOrCreateGame } from '../../../lib/serverGameStore';
import { fetchLatestState, publishAction } from '../../../lib/realtimeSync';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomCode = searchParams.get('roomCode')?.toUpperCase().trim();

  if (!roomCode) {
    return NextResponse.json({ error: 'Missing roomCode' }, { status: 400 });
  }

  // Check authoritative broadcast state first to unify multi-instance Vercel serverless
  const latestState = await fetchLatestState(roomCode);
  if (latestState) {
    return NextResponse.json({ state: latestState });
  }

  const manager = getGame(roomCode);
  if (!manager) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  return NextResponse.json({ state: manager.getState() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, roomCode, playerId, actionId, ...payload } = body;

    if (!roomCode) {
      return NextResponse.json({ error: 'Missing roomCode' }, { status: 400 });
    }

    const cleanCode = roomCode.toUpperCase().trim();
    const effectiveActionId = actionId || `act-api-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // Broadcast action to authoritative host with deduplication ID
    publishAction(cleanCode, { actionId: effectiveActionId, action, roomCode: cleanCode, playerId, ...payload }).catch(() => {});

    const manager = getOrCreateGame(cleanCode);

    if (action === 'CREATE_ROOM') {
      return NextResponse.json({ success: true, state: manager.getState() });
    }

    if (action === 'JOIN_LOBBY') {
      const result = manager.handlePlayerJoin(payload.player);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, state: manager.getState() });
    }

    if (action === 'START_GAME') {
      manager.handleStartGame();
      return NextResponse.json({ success: true, state: manager.getState() });
    }

    if (action === 'DISMISS_CARD_DRAW') {
      manager.handleDismissCardDraw();
      return NextResponse.json({ success: true, state: manager.getState() });
    }

    if (!playerId) {
      return NextResponse.json({ error: 'Missing playerId for action' }, { status: 400 });
    }

    switch (action) {
      case 'ROLL_DICE':
        manager.handleRollDice(playerId);
        break;
      case 'RESOLVE_BUS_CHOICE':
        manager.handleBusChoice(playerId, payload.choice);
        break;
      case 'RESOLVE_TRIPLES_CHOICE':
        manager.handleTriplesChoice(playerId, payload.targetIndex);
        break;
      case 'RESOLVE_BIRTHDAY_CHOICE':
        manager.handleBirthdayChoice(playerId, payload.choice);
        break;
      case 'BUY_PROPERTY':
        manager.handleBuyProperty(playerId, payload.propertyIndex);
        break;
      case 'PASS_PROPERTY_TO_AUCTION':
        manager.handlePassPropertyToAuction(payload.propertyIndex);
        break;
      case 'PLACE_BID':
        manager.handlePlaceBid(playerId, payload.amount);
        break;
      case 'FOLD_BID':
        manager.handleFoldBid(playerId);
        break;
      case 'PLAY_BUS_TICKET':
        manager.handlePlayBusTicket(playerId, payload.ticketId, payload.targetIndex);
        break;
      case 'BUILD_HOUSE':
        manager.handleBuildHouse(playerId, payload.propertyIndex);
        break;
      case 'BUILD_SKYSCRAPER':
        manager.handleBuildSkyscraper(playerId, payload.propertyIndex);
        break;
      case 'BUILD_DEPOT':
        manager.handleBuildDepot(playerId, payload.propertyIndex);
        break;
      case 'MORTGAGE_PROPERTY':
        manager.handleMortgageProperty(playerId, payload.propertyIndex);
        break;
      case 'UNMORTGAGE_PROPERTY':
        manager.handleUnmortgageProperty(playerId, payload.propertyIndex);
        break;
      case 'PAY_JAIL_FEE':
        manager.handlePayJailFee(playerId);
        break;
      case 'USE_JAIL_CARD':
        manager.handleUseJailCard(playerId);
        break;
      case 'END_TURN':
        manager.handleEndTurn(playerId);
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, state: manager.getState() });
  } catch (err: any) {
    console.error('API /api/game error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
