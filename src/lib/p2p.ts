import type Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { PeerMessage } from '../types/game';

export interface HostPeerManager {
  peer: Peer;
  hostPeerId: string;
  connections: Map<string, DataConnection>;
  broadcast: (message: PeerMessage) => void;
  sendTo: (playerId: string, message: PeerMessage) => void;
  close: () => void;
}

export interface ClientPeerManager {
  peer: Peer;
  connection: DataConnection;
  send: (message: PeerMessage) => void;
  close: () => void;
}

export function generateRoomCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return code;
}

export function getHostPeerId(roomCode: string): string {
  return `monopoly-mega-${roomCode.toUpperCase().trim()}-host`;
}

export async function createHostPeer(
  roomCode: string,
  onClientMessage: (conn: DataConnection, msg: PeerMessage) => void,
  onClientConnect: (conn: DataConnection) => void,
  onClientDisconnect: (conn: DataConnection) => void
): Promise<HostPeerManager> {
  if (typeof window === 'undefined') {
    throw new Error('Host Peer can only be created in the browser.');
  }

  const PeerJS = (await import('peerjs')).default;
  const cleanCode = roomCode.toUpperCase().trim();

  // Try preferred fixed ID first; if taken, generate unique session ID
  const preferredId = getHostPeerId(cleanCode);

  const connections = new Map<string, DataConnection>();

  const setupConnectionListeners = (conn: DataConnection) => {
    conn.on('open', () => {
      connections.set(conn.peer, conn);
      onClientConnect(conn);
    });

    conn.on('data', (data) => {
      try {
        const msg = data as PeerMessage;
        onClientMessage(conn, msg);
      } catch (err) {
        console.error('Error handling client message:', err);
      }
    });

    conn.on('close', () => {
      connections.delete(conn.peer);
      onClientDisconnect(conn);
    });

    conn.on('error', (err) => {
      console.warn('Connection error for peer:', conn.peer, err);
      connections.delete(conn.peer);
      onClientDisconnect(conn);
    });
  };

  const peerConfig = {
    debug: 1,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    },
  };

  return new Promise((resolve) => {
    let hasResolved = false;

    const tryInitPeer = (idToTry: string | undefined) => {
      const peer = idToTry ? new PeerJS(idToTry, peerConfig) : new PeerJS(peerConfig);

      peer.on('connection', setupConnectionListeners);

      peer.on('open', (id) => {
        console.log('Host Peer open with ID:', id);

        // Notify local serverless registry
        fetch('/api/room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomCode: cleanCode, hostPeerId: id }),
        }).catch((e) => console.warn('Could not post to /api/room:', e));

        if (!hasResolved) {
          hasResolved = true;
          const broadcast = (message: PeerMessage) => {
            connections.forEach((conn) => {
              if (conn.open) {
                conn.send(message);
              }
            });
          };

          const sendTo = (playerId: string, message: PeerMessage) => {
            connections.forEach((conn) => {
              if ((conn.metadata as any)?.playerId === playerId && conn.open) {
                conn.send(message);
              }
            });
          };

          const close = () => {
            connections.forEach((conn) => conn.close());
            connections.clear();
            peer.destroy();
          };

          resolve({ peer, hostPeerId: id, connections, broadcast, sendTo, close });
        }
      });

      peer.on('disconnected', () => {
        console.log('Host peer disconnected from signaling server, attempting reconnect...');
        if (!peer.destroyed) {
          peer.reconnect();
        }
      });

      peer.on('error', (err: any) => {
        console.warn('Host Peer notice:', err?.type, err?.message);
        if (err?.type === 'unavailable-id' && !hasResolved) {
          console.log(`Preferred ID ${preferredId} is already held. Generating dynamic host ID...`);
          peer.destroy();
          // Fall back to server-assigned unique peer ID
          tryInitPeer(undefined);
          return;
        }

        // Automatic reconnect for transient network errors
        if (err?.type === 'network' && !peer.destroyed) {
          peer.reconnect();
        }
      });
    };

    tryInitPeer(preferredId);
  });
}

export async function createClientPeer(
  roomCode: string,
  onMessage: (msg: PeerMessage) => void,
  onConnected: () => void,
  onDisconnected: () => void,
  directHostPeerId?: string
): Promise<ClientPeerManager> {
  if (typeof window === 'undefined') {
    throw new Error('Client Peer can only be created in the browser.');
  }

  const PeerJS = (await import('peerjs')).default;
  const cleanCode = roomCode.toUpperCase().trim();

  // Determine target Host Peer ID:
  // 1. Direct param (from QR Code)
  // 2. Or query /api/room registry
  // 3. Fallback to standard fixed ID
  let targetHostId = directHostPeerId;

  if (!targetHostId) {
    try {
      const res = await fetch(`/api/room?code=${cleanCode}`);
      if (res.ok) {
        const data = await res.json();
        if (data.hostPeerId) {
          targetHostId = data.hostPeerId;
        }
      }
    } catch (e) {
      console.warn('Could not query /api/room, falling back to standard ID:', e);
    }
  }

  if (!targetHostId) {
    targetHostId = getHostPeerId(cleanCode);
  }

  const peer = new PeerJS({
    debug: 1,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    },
  });

  return new Promise((resolve, reject) => {
    peer.on('open', () => {
      console.log('Connecting to host peer:', targetHostId);
      const conn = peer.connect(targetHostId!, {
        reliable: true,
      });

      conn.on('open', () => {
        onConnected();
        resolve({
          peer,
          connection: conn,
          send: (msg: PeerMessage) => {
            if (conn.open) conn.send(msg);
          },
          close: () => {
            conn.close();
            peer.destroy();
          },
        });
      });

      conn.on('data', (data) => {
        try {
          const msg = data as PeerMessage;
          onMessage(msg);
        } catch (err) {
          console.error('Error handling host message:', err);
        }
      });

      conn.on('close', () => {
        onDisconnected();
      });

      conn.on('error', (err) => {
        console.error('Host connection error:', err);
        onDisconnected();
      });
    });

    peer.on('disconnected', () => {
      if (!peer.destroyed) {
        peer.reconnect();
      }
    });

    peer.on('error', (err) => {
      console.error('PeerJS Client Error:', err);
      reject(err);
    });
  });
}
