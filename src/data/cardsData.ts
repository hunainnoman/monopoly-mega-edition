export interface DeckCard {
  id: string;
  type: 'chance' | 'community_chest';
  title: string;
  description: string;
  action: (state: any, playerId: string) => { text: string; updates: any };
}

export interface CardDefinition {
  id: string;
  type: 'chance' | 'community_chest';
  title: string;
  description: string;
  actionType: 
    | 'ADVANCE_TO_GO'
    | 'ADVANCE_TO_SPACE'
    | 'ADVANCE_NEAREST_RAILROAD'
    | 'ADVANCE_NEAREST_UTILITY'
    | 'COLLECT_MONEY'
    | 'PAY_MONEY'
    | 'PAY_EACH_PLAYER'
    | 'COLLECT_FROM_EACH_PLAYER'
    | 'GO_BACK_3'
    | 'GO_TO_JAIL'
    | 'JAIL_FREE'
    | 'REPAIRS';
  targetIndex?: number;
  amount?: number;
  houseCost?: number;
  hotelCost?: number;
}

export const CHANCE_CARDS: CardDefinition[] = [
  {
    id: 'ch-1',
    type: 'chance',
    title: 'Advance to GO',
    description: 'Advance to GO. (Collect $200)',
    actionType: 'ADVANCE_TO_GO',
    targetIndex: 0,
  },
  {
    id: 'ch-2',
    type: 'chance',
    title: 'Advance to Illinois Avenue',
    description: 'Advance to Illinois Avenue. If you pass GO, collect $200.',
    actionType: 'ADVANCE_TO_SPACE',
    targetIndex: 29,
  },
  {
    id: 'ch-3',
    type: 'chance',
    title: 'Advance to St. Charles Place',
    description: 'Advance to St. Charles Place. If you pass GO, collect $200.',
    actionType: 'ADVANCE_TO_SPACE',
    targetIndex: 14,
  },
  {
    id: 'ch-4',
    type: 'chance',
    title: 'Advance to California Avenue',
    description: 'Advance to California Avenue. If you pass GO, collect $200.',
    actionType: 'ADVANCE_TO_SPACE',
    targetIndex: 37,
  },
  {
    id: 'ch-5',
    type: 'chance',
    title: 'Advance to Nearest Railroad',
    description: 'Advance to the nearest Railroad. If unowned, you may buy it. If owned, pay owner twice the rent to which they are otherwise entitled.',
    actionType: 'ADVANCE_NEAREST_RAILROAD',
  },
  {
    id: 'ch-6',
    type: 'chance',
    title: 'Advance to Nearest Utility',
    description: 'Advance to nearest Utility. If unowned, you may buy it. If owned, throw dice and pay owner 10 times the amount thrown.',
    actionType: 'ADVANCE_NEAREST_UTILITY',
  },
  {
    id: 'ch-7',
    type: 'chance',
    title: 'Bank Dividend',
    description: 'Bank pays you dividend of $50.',
    actionType: 'COLLECT_MONEY',
    amount: 50,
  },
  {
    id: 'ch-8',
    type: 'chance',
    title: 'Get Out of Jail Free',
    description: 'This card may be kept until needed or traded.',
    actionType: 'JAIL_FREE',
  },
  {
    id: 'ch-9',
    type: 'chance',
    title: 'Go Back 3 Spaces',
    description: 'Go Back 3 Spaces.',
    actionType: 'GO_BACK_3',
  },
  {
    id: 'ch-10',
    type: 'chance',
    title: 'Go to Jail',
    description: 'Go directly to Jail. Do not pass GO, do not collect $200.',
    actionType: 'GO_TO_JAIL',
  },
  {
    id: 'ch-11',
    type: 'chance',
    title: 'General Repairs',
    description: 'Make general repairs on all your property: Pay $25 for each house, $100 for each hotel and skyscraper.',
    actionType: 'REPAIRS',
    houseCost: 25,
    hotelCost: 100,
  },
  {
    id: 'ch-12',
    type: 'chance',
    title: 'Speeding Fine',
    description: 'Pay poor tax / speeding fine of $15.',
    actionType: 'PAY_MONEY',
    amount: 15,
  },
  {
    id: 'ch-13',
    type: 'chance',
    title: 'Trip to Reading Railroad',
    description: 'Take a trip to Reading Railroad. If you pass GO, collect $200.',
    actionType: 'ADVANCE_TO_SPACE',
    targetIndex: 6,
  },
  {
    id: 'ch-14',
    type: 'chance',
    title: 'Advance to Boardwalk',
    description: 'Take a walk on the Boardwalk. Advance token to Boardwalk.',
    actionType: 'ADVANCE_TO_SPACE',
    targetIndex: 51,
  },
  {
    id: 'ch-15',
    type: 'chance',
    title: 'Elected Chairman of the Board',
    description: 'You have been elected Chairman of the Board. Pay each player $50.',
    actionType: 'PAY_EACH_PLAYER',
    amount: 50,
  },
  {
    id: 'ch-16',
    type: 'chance',
    title: 'Building Loan Matures',
    description: 'Your building loan matures. Collect $150.',
    actionType: 'COLLECT_MONEY',
    amount: 150,
  },
];

export const COMMUNITY_CHEST_CARDS: CardDefinition[] = [
  {
    id: 'cc-1',
    type: 'community_chest',
    title: 'Advance to GO',
    description: 'Advance to GO (Collect $200).',
    actionType: 'ADVANCE_TO_GO',
    targetIndex: 0,
  },
  {
    id: 'cc-2',
    type: 'community_chest',
    title: 'Bank Error in Your Favor',
    description: 'Bank error in your favor. Collect $200.',
    actionType: 'COLLECT_MONEY',
    amount: 200,
  },
  {
    id: 'cc-3',
    type: 'community_chest',
    title: "Doctor's Fees",
    description: "Doctor's fees. Pay $50.",
    actionType: 'PAY_MONEY',
    amount: 50,
  },
  {
    id: 'cc-4',
    type: 'community_chest',
    title: 'Sale of Stock',
    description: 'From sale of stock you get $50.',
    actionType: 'COLLECT_MONEY',
    amount: 50,
  },
  {
    id: 'cc-5',
    type: 'community_chest',
    title: 'Get Out of Jail Free',
    description: 'This card may be kept until needed or traded.',
    actionType: 'JAIL_FREE',
  },
  {
    id: 'cc-6',
    type: 'community_chest',
    title: 'Go to Jail',
    description: 'Go to Jail. Go directly to Jail, do not pass GO, do not collect $200.',
    actionType: 'GO_TO_JAIL',
  },
  {
    id: 'cc-7',
    type: 'community_chest',
    title: 'Holiday Fund Matures',
    description: 'Holiday Fund matures. Receive $100.',
    actionType: 'COLLECT_MONEY',
    amount: 100,
  },
  {
    id: 'cc-8',
    type: 'community_chest',
    title: 'Income Tax Refund',
    description: 'Income tax refund. Collect $20.',
    actionType: 'COLLECT_MONEY',
    amount: 20,
  },
  {
    id: 'cc-9',
    type: 'community_chest',
    title: 'It is Your Birthday',
    description: 'It is your birthday. Collect $10 from every player.',
    actionType: 'COLLECT_FROM_EACH_PLAYER',
    amount: 10,
  },
  {
    id: 'cc-10',
    type: 'community_chest',
    title: 'Life Insurance Matures',
    description: 'Life insurance matures. Collect $100.',
    actionType: 'COLLECT_MONEY',
    amount: 100,
  },
  {
    id: 'cc-11',
    type: 'community_chest',
    title: 'Hospital Fees',
    description: 'Pay hospital fees of $100.',
    actionType: 'PAY_MONEY',
    amount: 100,
  },
  {
    id: 'cc-12',
    type: 'community_chest',
    title: 'School Fees',
    description: 'Pay school fees of $50.',
    actionType: 'PAY_MONEY',
    amount: 50,
  },
  {
    id: 'cc-13',
    type: 'community_chest',
    title: 'Consultancy Fee',
    description: 'Receive $25 consultancy fee.',
    actionType: 'COLLECT_MONEY',
    amount: 25,
  },
  {
    id: 'cc-14',
    type: 'community_chest',
    title: 'Street Repairs',
    description: 'You are assessed for street repairs: Pay $40 per house, $115 per hotel and skyscraper.',
    actionType: 'REPAIRS',
    houseCost: 40,
    hotelCost: 115,
  },
  {
    id: 'cc-15',
    type: 'community_chest',
    title: 'Beauty Contest',
    description: 'You have won second prize in a beauty contest. Collect $10.',
    actionType: 'COLLECT_MONEY',
    amount: 10,
  },
  {
    id: 'cc-16',
    type: 'community_chest',
    title: 'You Inherit $100',
    description: 'You inherit $100.',
    actionType: 'COLLECT_MONEY',
    amount: 100,
  },
];
