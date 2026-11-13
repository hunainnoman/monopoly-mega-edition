import { 
  BoardSpace, 
  ColorGroup, 
  DiceRollResult, 
  GameState, 
  PropertyOwnership, 
  SpeedDieFace 
} from '../types/game';
import { BOARD_SPACES, COLOR_GROUPS_MAP, INITIAL_BUS_TICKETS } from '../data/boardData';

export const INITIAL_BANK_BALANCE = 2500;

export function createInitialGameState(roomCode: string, hostPeerId: string): GameState {
  const initialProperties: Record<number, PropertyOwnership> = {};
  BOARD_SPACES.forEach((space) => {
    if (space.type === 'street' || space.type === 'railroad' || space.type === 'utility') {
      initialProperties[space.index] = {
        ownerId: null,
        houses: 0,
        hasHotel: false,
        hasSkyscraper: false,
        hasDepot: false,
        isMortgaged: false,
      };
    }
  });

  return {
    roomCode,
    hostPeerId,
    status: 'LOBBY',
    players: [],
    activePlayerIndex: 0,
    consecutiveDoubles: 0,
    turnPhase: 'WAITING_FOR_ROLL',
    lastDiceRoll: null,
    currentActionText: 'Waiting for players to join...',
    properties: initialProperties,
    bankInventory: {
      houses: 32,
      hotels: 12,
      skyscrapers: 8,
      depots: 4,
    },
    busTicketsDeck: [...INITIAL_BUS_TICKETS].sort(() => Math.random() - 0.5),
    auctionState: null,
    log: [
      {
        id: 'init-1',
        timestamp: Date.now(),
        text: `Room ${roomCode} created. Mega Edition rules active.`,
        type: 'info',
      },
    ],
  };
}

export function rollMegaDice(inJail: boolean): DiceRollResult {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const isDoubles = die1 === die2;

  if (inJail) {
    return {
      die1,
      die2,
      speedDie: 1, // inactive dummy
      isDoubles,
      isTriples: false,
      totalMovement: die1 + die2,
    };
  }

  const speedFaces: SpeedDieFace[] = [1, 2, 3, 'bus', 'mr_monopoly', 'mr_monopoly'];
  const speedDie = speedFaces[Math.floor(Math.random() * speedFaces.length)];

  const isNumericSpeed = typeof speedDie === 'number';
  const isTriples = isNumericSpeed && die1 === die2 && die1 === speedDie;
  const totalMovement = isNumericSpeed ? die1 + die2 + (speedDie as number) : die1 + die2;

  return {
    die1,
    die2,
    speedDie,
    isDoubles,
    isTriples,
    totalMovement,
  };
}

export type MonopolyTier = 'NONE' | 'MAJORITY' | 'COMPLETE';

export function getMonopolyTier(
  playerId: string, 
  color: ColorGroup, 
  properties: Record<number, PropertyOwnership>
): MonopolyTier {
  const spaceIndices = COLOR_GROUPS_MAP[color];
  if (!spaceIndices) return 'NONE';

  const ownedCount = spaceIndices.filter(
    (idx) => properties[idx]?.ownerId === playerId && !properties[idx]?.isMortgaged
  ).length;

  const total = spaceIndices.length;

  if (ownedCount === total) return 'COMPLETE';

  // Brown and Dark Blue have 3 properties -> 2 is Majority
  if (total === 3 && ownedCount >= 2) return 'MAJORITY';

  // Other colors have 4 properties -> 3 is Majority
  if (total === 4 && ownedCount >= 3) return 'MAJORITY';

  return 'NONE';
}

export function calculateRent(
  space: BoardSpace, 
  properties: Record<number, PropertyOwnership>, 
  lastRollTotal: number,
  isAdvanceCardDoubled: boolean = false
): number {
  const prop = properties[space.index];
  if (!prop || !prop.ownerId || prop.isMortgaged) return 0;

  if (space.type === 'street' && space.streetDeed) {
    const deed = space.streetDeed;
    if (prop.hasSkyscraper) return deed.skyscraperRent;
    if (prop.hasHotel) return deed.hotelRent;
    if (prop.houses > 0) return deed.houseRents[prop.houses - 1];

    const tier = getMonopolyTier(prop.ownerId, space.color!, properties);
    if (tier === 'COMPLETE') return deed.completeRent; // 3x base rent!
    if (tier === 'MAJORITY') return deed.majorityRent;
    return deed.baseRent;
  }

  if (space.type === 'railroad') {
    const railroadIndices = COLOR_GROUPS_MAP['railroad'];
    const ownedRailroads = railroadIndices.filter(
      (idx) => properties[idx]?.ownerId === prop.ownerId && !properties[idx]?.isMortgaged
    ).length;

    let baseRent = 25;
    if (ownedRailroads === 2) baseRent = 50;
    else if (ownedRailroads === 3) baseRent = 100;
    else if (ownedRailroads >= 4) baseRent = 200;

    // Train Depot doubles railroad rent
    if (prop.hasDepot) {
      baseRent *= 2;
    }

    if (isAdvanceCardDoubled) {
      baseRent *= 2;
    }

    return baseRent;
  }

  if (space.type === 'utility') {
    const utilityIndices = COLOR_GROUPS_MAP['utility'];
    const ownedUtilities = utilityIndices.filter(
      (idx) => properties[idx]?.ownerId === prop.ownerId && !properties[idx]?.isMortgaged
    ).length;

    const multiplier = ownedUtilities === 3 ? 20 : ownedUtilities === 2 ? 10 : 4;
    return (lastRollTotal > 0 ? lastRollTotal : 7) * multiplier;
  }

  return 0;
}

export function findNextUnownedProperty(startIndex: number, properties: Record<number, PropertyOwnership>): number | null {
  for (let step = 1; step <= 52; step++) {
    const checkIndex = (startIndex + step) % 52;
    const space = BOARD_SPACES[checkIndex];
    if (space.type === 'street' || space.type === 'railroad' || space.type === 'utility') {
      if (!properties[checkIndex]?.ownerId) {
        return checkIndex;
      }
    }
  }
  return null;
}

export function findFirstOpponentRentSpace(
  startIndex: number, 
  activePlayerId: string, 
  properties: Record<number, PropertyOwnership>
): number | null {
  for (let step = 1; step <= 52; step++) {
    const checkIndex = (startIndex + step) % 52;
    const prop = properties[checkIndex];
    if (prop && prop.ownerId && prop.ownerId !== activePlayerId && !prop.isMortgaged) {
      return checkIndex;
    }
  }
  return null;
}

export function findNearestSpaceOfType(
  startIndex: number, 
  types: Array<'chance' | 'community_chest' | 'railroad' | 'utility'>
): number {
  for (let step = 1; step <= 52; step++) {
    const checkIndex = (startIndex + step) % 52;
    const space = BOARD_SPACES[checkIndex];
    if (types.includes(space.type as any)) {
      return checkIndex;
    }
  }
  return startIndex;
}

export function canPlayBusTicketToSpace(currentSpaceIndex: number, targetSpaceIndex: number): boolean {
  if (currentSpaceIndex === targetSpaceIndex) return false;

  // Sides in Mega Edition:
  // Side 1: 0 to 12
  // Side 2: 12 to 25
  // Side 3: 25 to 38
  // Side 4: 38 to 0 (51)
  // Corner spaces belong to both sides!

  const getSidesForIndex = (idx: number): number[] => {
    if (idx === 0) return [4, 1];
    if (idx > 0 && idx < 12) return [1];
    if (idx === 12) return [1, 2];
    if (idx > 12 && idx < 25) return [2];
    if (idx === 25) return [2, 3];
    if (idx > 25 && idx < 38) return [3];
    if (idx === 38) return [3, 4];
    return [4];
  };

  const currentSides = getSidesForIndex(currentSpaceIndex);
  const targetSides = getSidesForIndex(targetSpaceIndex);

  return currentSides.some((s) => targetSides.includes(s));
}

export function canBuildHouse(
  playerId: string, 
  spaceIndex: number, 
  properties: Record<number, PropertyOwnership>, 
  bankHouses: number,
  playerBalance: number
): { canBuild: boolean; reason?: string } {
  const space = BOARD_SPACES[spaceIndex];
  if (space.type !== 'street' || !space.color || !space.streetDeed) {
    return { canBuild: false, reason: 'Not a buildable street property.' };
  }

  const prop = properties[spaceIndex];
  if (!prop || prop.ownerId !== playerId || prop.isMortgaged) {
    return { canBuild: false, reason: 'You do not own this unmortgaged property.' };
  }

  if (prop.houses >= 4 || prop.hasHotel || prop.hasSkyscraper) {
    return { canBuild: false, reason: 'Already has 4 houses or higher upgrade.' };
  }

  if (bankHouses <= 0) {
    return { canBuild: false, reason: 'Bank housing shortage! No houses available.' };
  }

  if (playerBalance < space.streetDeed.buildCost) {
    return { canBuild: false, reason: 'Insufficient funds to build house.' };
  }

  const tier = getMonopolyTier(playerId, space.color, properties);
  if (tier === 'NONE') {
    return { canBuild: false, reason: 'You need at least a Majority Monopoly to build.' };
  }

  // Even building rule across owned properties of this color:
  const ownedSameColor = COLOR_GROUPS_MAP[space.color]
    .map((idx) => properties[idx])
    .filter((p) => p?.ownerId === playerId);

  const minHouses = Math.min(...ownedSameColor.map((p) => p.houses));
  if (prop.houses > minHouses) {
    return { canBuild: false, reason: 'Must build houses evenly across your owned color set.' };
  }

  return { canBuild: true };
}

export function canBuildSkyscraper(
  playerId: string,
  spaceIndex: number,
  properties: Record<number, PropertyOwnership>,
  bankSkyscrapers: number,
  playerBalance: number
): { canBuild: boolean; reason?: string } {
  const space = BOARD_SPACES[spaceIndex];
  if (space.type !== 'street' || !space.color || !space.streetDeed) {
    return { canBuild: false, reason: 'Not a buildable street.' };
  }

  const prop = properties[spaceIndex];
  if (!prop || prop.ownerId !== playerId || prop.isMortgaged) {
    return { canBuild: false, reason: 'Not owned or mortgaged.' };
  }

  if (prop.hasSkyscraper) {
    return { canBuild: false, reason: 'Already has a Skyscraper.' };
  }

  if (!prop.hasHotel) {
    return { canBuild: false, reason: 'Must upgrade to Hotel first.' };
  }

  const tier = getMonopolyTier(playerId, space.color, properties);
  if (tier !== 'COMPLETE') {
    return { canBuild: false, reason: 'Requires a Complete (100%) Monopoly to build Skyscrapers.' };
  }

  if (bankSkyscrapers <= 0) {
    return { canBuild: false, reason: 'No Skyscrapers remaining in the Bank.' };
  }

  if (playerBalance < space.streetDeed.buildCost) {
    return { canBuild: false, reason: 'Insufficient funds.' };
  }

  return { canBuild: true };
}

export function canBuildTrainDepot(
  playerId: string,
  spaceIndex: number,
  properties: Record<number, PropertyOwnership>,
  bankDepots: number,
  playerBalance: number
): { canBuild: boolean; reason?: string } {
  const space = BOARD_SPACES[spaceIndex];
  if (space.type !== 'railroad') {
    return { canBuild: false, reason: 'Train Depots can only be built on Railroads.' };
  }

  const prop = properties[spaceIndex];
  if (!prop || prop.ownerId !== playerId || prop.isMortgaged) {
    return { canBuild: false, reason: 'You do not own this Railroad or it is mortgaged.' };
  }

  if (prop.hasDepot) {
    return { canBuild: false, reason: 'Railroad already has a Train Depot.' };
  }

  if (bankDepots <= 0) {
    return { canBuild: false, reason: 'No Train Depots remaining in Bank.' };
  }

  if (playerBalance < 100) {
    return { canBuild: false, reason: 'Train Depot costs $100.' };
  }

  return { canBuild: true };
}
