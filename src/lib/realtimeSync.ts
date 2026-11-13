import { GameState, PropertyOwnership } from '../types/game';

const NTFY_BASE = 'https://ntfy.sh';

export function getActionTopic(roomCode: string): string {
  return `monopoly-mega-${roomCode.toUpperCase().trim()}-act-v3`;
}

export function getStateTopic(roomCode: string): string {
  return `monopoly-mega-${roomCode.toUpperCase().trim()}-state-v3`;
}

// Compact the state so payload is always < 2.5 KB (well below ntfy's 4096-byte inline limit)
export function packState(state: GameState): any {
  if (!state) return state;

  const compactProperties: Record<number, PropertyOwnership> = {};
  if (state.properties) {
    for (const [key, prop] of Object.entries(state.properties)) {
      if (
        prop.ownerId !== null ||
        prop.houses > 0 ||
        prop.hasHotel ||
        prop.hasSkyscraper ||
        prop.hasDepot ||
        prop.isMortgaged
      ) {
        compactProperties[Number(key)] = prop;
      }
    }
  }

  return {
    ...state,
    properties: compactProperties,
    busTicketsDeck: [], // Managed host-side; omit deck array from broadcast wire
    log: state.log ? state.log.slice(0, 15) : [],
  };
}

// Hydrate state so all 52 properties exist with default fields for all client components
export function unpackState(data: any): GameState {
  if (!data || typeof data !== 'object') return data;

  const properties: Record<number, PropertyOwnership> = {};
  for (let i = 0; i < 52; i++) {
    if (data.properties && data.properties[i]) {
      properties[i] = {
        ownerId: data.properties[i].ownerId ?? null,
        houses: data.properties[i].houses ?? 0,
        hasHotel: Boolean(data.properties[i].hasHotel),
        hasSkyscraper: Boolean(data.properties[i].hasSkyscraper),
        hasDepot: Boolean(data.properties[i].hasDepot),
        isMortgaged: Boolean(data.properties[i].isMortgaged),
      };
    } else {
      properties[i] = {
        ownerId: null,
        houses: 0,
        hasHotel: false,
        hasSkyscraper: false,
        hasDepot: false,
        isMortgaged: false,
      };
    }
  }

  return {
    ...data,
    players: Array.isArray(data.players) ? data.players : [],
    properties,
    busTicketsDeck: Array.isArray(data.busTicketsDeck) ? data.busTicketsDeck : [],
    log: Array.isArray(data.log) ? data.log : [],
    bankInventory: data.bankInventory || { houses: 32, hotels: 12, skyscrapers: 8, depots: 4 },
  };
}

// Safely extract JSON from an ntfy message (handles both inline message and file attachments)
async function extractPayload(item: any): Promise<any | null> {
  if (!item) return null;

  if (item.attachment && item.attachment.url) {
    try {
      const res = await fetch(item.attachment.url, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        return JSON.parse(text);
      }
    } catch (e) {
      console.warn('Failed to fetch attachment:', e);
    }
  }

  if (item.message) {
    try {
      return JSON.parse(item.message);
    } catch (e) {}
  }

  return null;
}

// Publish an action from a player/client to the host
export async function publishAction(roomCode: string, actionPayload: any): Promise<boolean> {
  try {
    const topic = getActionTopic(roomCode);
    const enriched = {
      actionId: actionPayload.actionId || `act-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      timestamp: Date.now(),
      ...actionPayload,
    };
    const bodyStr = JSON.stringify(enriched);
    const res = await fetch(`${NTFY_BASE}/${topic}`, {
      method: 'POST',
      body: bodyStr,
      headers: {
        'Title': enriched.action || 'action',
      },
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to publish action:', err);
    return false;
  }
}

// Publish updated state from the host to all players
export async function publishState(roomCode: string, state: GameState): Promise<boolean> {
  try {
    const topic = getStateTopic(roomCode);
    const packed = packState(state);
    const bodyStr = JSON.stringify(packed);
    const res = await fetch(`${NTFY_BASE}/${topic}`, {
      method: 'POST',
      body: bodyStr,
      headers: {
        'Title': 'state',
      },
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to publish state:', err);
    return false;
  }
}

// Fetch the most recent state (used for instant initial sync or fallback polling)
export async function fetchLatestState(roomCode: string): Promise<GameState | null> {
  try {
    const topic = getStateTopic(roomCode);
    const res = await fetch(`${NTFY_BASE}/${topic}/json?poll=1`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const text = await res.text();
    if (!text.trim()) return null;

    const lines = text.trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const item = JSON.parse(lines[i]);
        if (item.event === 'message') {
          const parsed = await extractPayload(item);
          if (parsed && parsed.roomCode) {
            return unpackState(parsed);
          }
        }
      } catch (e) {
        // Continue searching backwards
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Subscribe to state updates via SSE with polling fallback
export function subscribeToState(
  roomCode: string,
  onState: (state: GameState) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const topic = getStateTopic(roomCode);
  let isClosed = false;
  let eventSource: EventSource | null = null;

  try {
    eventSource = new EventSource(`${NTFY_BASE}/${topic}/sse`);
    eventSource.onmessage = async (event) => {
      if (isClosed) return;
      try {
        const raw = JSON.parse(event.data);
        if (raw.event === 'message') {
          const stateData = await extractPayload(raw);
          if (stateData && stateData.roomCode) {
            onState(unpackState(stateData));
          }
        }
      } catch (e) {}
    };
  } catch (err) {
    console.warn('EventSource error for state:', err);
  }

  // Backup polling loop every 750ms to ensure 100% sync reliability
  const pollInterval = setInterval(async () => {
    if (isClosed) return;
    const latest = await fetchLatestState(roomCode);
    if (latest && !isClosed) {
      onState(latest);
    }
  }, 750);

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
    }
    clearInterval(pollInterval);
  };
}

// Subscribe to incoming client actions (Host screen only)
export function subscribeToActions(
  roomCode: string,
  onAction: (actionPayload: any) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const topic = getActionTopic(roomCode);
  let isClosed = false;
  let eventSource: EventSource | null = null;
  const processedActionIds = new Set<string>();

  // Only process actions published from the time host opened
  const hostStartTime = Math.floor(Date.now() / 1000) - 2;

  try {
    eventSource = new EventSource(`${NTFY_BASE}/${topic}/sse?since=${hostStartTime}`);
    eventSource.onmessage = async (event) => {
      if (isClosed) return;
      try {
        const raw = JSON.parse(event.data);
        if (raw.event === 'message') {
          const action = await extractPayload(raw);
          if (action) {
            const actId = action.actionId || raw.id;
            if (actId && processedActionIds.has(actId)) return;
            if (actId) processedActionIds.add(actId);
            onAction(action);
          }
        }
      } catch (e) {}
    };
  } catch (err) {
    console.warn('EventSource error for actions:', err);
  }

  // Fallback action poller with since
  const pollInterval = setInterval(async () => {
    if (isClosed) return;
    try {
      const res = await fetch(`${NTFY_BASE}/${topic}/json?poll=1&since=${hostStartTime}`, { cache: 'no-store' });
      if (!res.ok) return;
      const text = await res.text();
      if (!text.trim()) return;

      const lines = text.trim().split('\n');
      for (const line of lines) {
        try {
          const item = JSON.parse(line);
          if (item.event === 'message') {
            const action = await extractPayload(item);
            if (action) {
              const actId = action.actionId || item.id;
              if (actId && processedActionIds.has(actId)) continue;
              if (actId) processedActionIds.add(actId);
              onAction(action);
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
  }, 600);

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
    }
    clearInterval(pollInterval);
  };
}
