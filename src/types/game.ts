export type ColorGroup = 
  | 'brown' 
  | 'light_blue' 
  | 'magenta' 
  | 'orange' 
  | 'red' 
  | 'yellow' 
  | 'green' 
  | 'dark_blue' 
  | 'railroad' 
  | 'utility';

export type SpaceType = 
  | 'street' 
  | 'railroad' 
  | 'utility' 
  | 'tax' 
  | 'chance' 
  | 'community_chest' 
  | 'action' 
  | 'corner';

export type CornerType = 'go' | 'jail' | 'free_parking' | 'go_to_jail';

export type ActionSpaceType = 'auction' | 'bus_ticket' | 'birthday_gift';

export interface StreetDeed {
  cost: number;
  baseRent: number;
  majorityRent: number; // 2x or standard majority
  completeRent: number; // 3x base rent on unimproved complete monopoly
  houseRents: [number, number, number, number]; // 1, 2, 3, 4 houses
  hotelRent: number;
  skyscraperRent: number;
  buildCost: number; // cost per house / hotel / skyscraper
  mortgageValue: number;
}

export interface BoardSpace {
  index: number; // 0 to 51
  side: 1 | 2 | 3 | 4;
  name: string;
  nameUK?: string;
  type: SpaceType;
  color?: ColorGroup;
  cornerType?: CornerType;
  actionType?: ActionSpaceType;
  cost?: number;
  taxAmount?: number;
  streetDeed?: StreetDeed;
}

export type SpeedDieFace = 1 | 2 | 3 | 'bus' | 'mr_monopoly';

export interface DiceRollResult {
  die1: number; // 1-6
  die2: number; // 1-6
  speedDie: SpeedDieFace;
  isDoubles: boolean; // only die1 === die2
  isTriples: boolean; // die1 === die2 === speedDie (1, 2, or 3)
  totalMovement: number; // die1 + die2 + (numeric speedDie ? speedDie : 0)
}

export interface BusTicket {
  id: string;
  title: string;
  description: string;
  isExpirationCard: boolean; // "ALL TICKETS EXPIRE EXCEPT THIS ONE"
}

export interface Player {
  id: string;
  name: string;
  color: string; // hex color code
  tokenIcon: string; // e.g. 'car' | 'ship' | 'hat' | 'dog'
  balance: number; // Starting $2,500
  position: number; // 0 to 51
  inJail: boolean;
  jailTurns: number;
  getOutOfJailCards: number;
  busTickets: BusTicket[];
  isBankrupt: boolean;
  isConnected: boolean;
}

export interface PropertyOwnership {
  ownerId: string | null;
  houses: number; // 0-4
  hasHotel: boolean;
  hasSkyscraper: boolean;
  hasDepot: boolean; // for Railroads
  isMortgaged: boolean;
}

export interface AuctionState {
  propertyIndex: number;
  currentBid: number;
  highestBidderId: string | null;
  activePlayerIds: string[];
  passedPlayerIds: string[];
}

export type TurnPhase = 
  | 'WAITING_FOR_ROLL'
  | 'TOKEN_ANIMATING'
  | 'SPACE_RESOLUTION'
  | 'SPEED_BUS_CHOICE'
  | 'MR_MONOPOLY_ACTION'
  | 'TRIPLES_CHOICE'
  | 'AUCTION'
  | 'TURN_ACTIONS'
  | 'GAME_OVER';

export interface BankInventory {
  houses: number; // max 32
  hotels: number; // max 12
  skyscrapers: number; // max 8
  depots: number; // max 4
}

export interface GameState {
  roomCode: string;
  hostPeerId: string;
  status: 'LOBBY' | 'PLAYING' | 'ENDED';
  players: Player[];
  activePlayerIndex: number;
  consecutiveDoubles: number;
  turnPhase: TurnPhase;
  lastDiceRoll: DiceRollResult | null;
  currentActionText: string;
  properties: Record<number, PropertyOwnership>;
  bankInventory: BankInventory;
  busTicketsDeck: BusTicket[];
  auctionState: AuctionState | null;
  activeCardDraw?: {
    type: 'chance' | 'community_chest';
    title: string;
    description: string;
    playerName: string;
    timestamp: number;
  } | null;
  log: Array<{
    id: string;
    timestamp: number;
    text: string;
    type: 'info' | 'roll' | 'money' | 'card' | 'build' | 'auction' | 'jail';
  }>;
}

export type PeerMessage =
  | { type: 'JOIN_LOBBY'; player: Omit<Player, 'position' | 'inJail' | 'jailTurns' | 'getOutOfJailCards' | 'busTickets' | 'isBankrupt' | 'isConnected'> }
  | { type: 'START_GAME' }
  | { type: 'ROLL_DICE' }
  | { type: 'RESOLVE_BUS_CHOICE'; choice: 'ticket' | 'chance_chest' }
  | { type: 'RESOLVE_TRIPLES_CHOICE'; targetIndex: number }
  | { type: 'RESOLVE_BIRTHDAY_CHOICE'; choice: 'cash' | 'ticket' }
  | { type: 'BUY_PROPERTY'; propertyIndex: number }
  | { type: 'PASS_PROPERTY_TO_AUCTION'; propertyIndex: number }
  | { type: 'PLACE_BID'; amount: number }
  | { type: 'FOLD_BID' }
  | { type: 'PLAY_BUS_TICKET'; ticketId: string; targetIndex: number }
  | { type: 'BUILD_HOUSE'; propertyIndex: number }
  | { type: 'BUILD_SKYSCRAPER'; propertyIndex: number }
  | { type: 'BUILD_DEPOT'; propertyIndex: number }
  | { type: 'SELL_BUILDING'; propertyIndex: number; building: 'house' | 'hotel' | 'skyscraper' | 'depot' }
  | { type: 'MORTGAGE_PROPERTY'; propertyIndex: number }
  | { type: 'UNMORTGAGE_PROPERTY'; propertyIndex: number }
  | { type: 'PAY_JAIL_FEE' }
  | { type: 'USE_JAIL_CARD' }
  | { type: 'END_TURN' }
  | { type: 'SYNC_STATE'; state: GameState }
  | { type: 'PLAYER_RECONNECTED'; playerId: string }
  | { type: 'ERROR'; message: string };
