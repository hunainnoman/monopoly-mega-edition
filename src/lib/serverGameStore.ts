import { HostGameManager } from './hostGameManager';
import { GameState } from '../types/game';

// Global singleton map to persist rooms across API calls in the same Node.js process
const globalRooms = (global as any).__monopoly_rooms || new Map<string, HostGameManager>();
if (!(global as any).__monopoly_rooms) {
  (global as any).__monopoly_rooms = globalRooms;
}

export function getOrCreateGame(roomCode: string): HostGameManager {
  const cleanCode = roomCode.toUpperCase().trim();
  let manager = globalRooms.get(cleanCode);
  if (!manager) {
    manager = new HostGameManager(cleanCode, `host-${cleanCode}`, () => {});
    globalRooms.set(cleanCode, manager);
  }
  return manager;
}

export function getGame(roomCode: string): HostGameManager | null {
  const cleanCode = roomCode.toUpperCase().trim();
  return globalRooms.get(cleanCode) || null;
}
