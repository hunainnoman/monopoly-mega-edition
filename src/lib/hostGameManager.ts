import { 
  BoardSpace, 
  DiceRollResult, 
  GameState, 
  Player 
} from '../types/game';
import { BOARD_SPACES } from '../data/boardData';
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from '../data/cardsData';
import { 
  calculateRent, 
  canBuildHouse, 
  canBuildSkyscraper, 
  canBuildTrainDepot, 
  canPlayBusTicketToSpace, 
  createInitialGameState, 
  findFirstOpponentRentSpace, 
  findNearestSpaceOfType, 
  findNextUnownedProperty, 
  rollMegaDice 
} from './gameEngine';
import { audio } from './audio';

export class HostGameManager {
  private state: GameState;
  private onStateChange: (state: GameState) => void;
  private chanceDeck = [...CHANCE_CARDS].sort(() => Math.random() - 0.5);
  private communityChestDeck = [...COMMUNITY_CHEST_CARDS].sort(() => Math.random() - 0.5);

  constructor(roomCode: string, hostPeerId: string, onStateChange: (state: GameState) => void) {
    this.state = createInitialGameState(roomCode, hostPeerId);
    this.onStateChange = onStateChange;
  }

  getState(): GameState {
    return this.state;
  }

  private updateState(updater: (state: GameState) => void) {
    updater(this.state);
    this.onStateChange({ ...this.state });
  }

  private addLog(text: string, type: 'info' | 'roll' | 'money' | 'card' | 'build' | 'auction' | 'jail' = 'info') {
    this.state.log.unshift({
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      text,
      type,
    });
    if (this.state.log.length > 50) {
      this.state.log.pop();
    }
  }

  handlePlayerJoin(playerData: Omit<Player, 'position' | 'inJail' | 'jailTurns' | 'getOutOfJailCards' | 'busTickets' | 'isBankrupt' | 'isConnected'>): { success: boolean; error?: string } {
    // 1. Check if player is already in room (by ID or matching name)
    const existingById = this.state.players.find((p) => p.id === playerData.id);
    const existingByName = this.state.players.find(
      (p) => p.name.trim().toLowerCase() === playerData.name.trim().toLowerCase()
    );
    const existing = existingById || existingByName;

    if (existing) {
      existing.id = playerData.id;
      existing.name = playerData.name;
      existing.color = playerData.color;
      existing.tokenIcon = playerData.tokenIcon;
      existing.isConnected = true;
      this.addLog(`${existing.name} connected.`, 'info');
      this.updateState(() => {});
      return { success: true };
    }

    // 2. Reject new players if game is already playing
    if (this.state.status !== 'LOBBY') {
      return { success: false, error: 'Game already in progress.' };
    }

    // 3. Mega Edition supports up to 8 players
    if (this.state.players.length >= 8) {
      return { success: false, error: 'Room is full (max 8 players).' };
    }

    const newPlayer: Player = {
      ...playerData,
      position: 0,
      balance: 2500, // Mega edition starting bankroll
      inJail: false,
      jailTurns: 0,
      getOutOfJailCards: 0,
      busTickets: [],
      isBankrupt: false,
      isConnected: true,
    };

    this.updateState((s) => {
      s.players.push(newPlayer);
      this.addLog(`${newPlayer.name} joined the game.`, 'info');
    });

    return { success: true };
  }

  handlePlayerDisconnect(playerId: string) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (player) {
      player.isConnected = false;
      this.addLog(`${player.name} disconnected.`, 'info');
      this.updateState(() => {});
    }
  }

  handleStartGame() {
    if (this.state.players.length < 1) {
      return;
    }
    this.updateState((s) => {
      s.status = 'PLAYING';
      s.activePlayerIndex = 0;
      s.turnPhase = 'WAITING_FOR_ROLL';
      const active = s.players[0];
      s.currentActionText = `It is ${active.name}'s turn to roll!`;
      this.addLog(`Game started! ${active.name} rolls first.`, 'info');
    });
  }

  handleRollDice(playerId: string) {
    const activePlayer = this.state.players[this.state.activePlayerIndex];
    if (!activePlayer || activePlayer.id !== playerId) return;
    if (this.state.turnPhase !== 'WAITING_FOR_ROLL') return;

    audio.playDiceRoll();
    const roll = rollMegaDice(activePlayer.inJail);

    this.updateState((s) => {
      s.lastDiceRoll = roll;
    });

    // JAIL TURN RESOLUTION
    if (activePlayer.inJail) {
      if (roll.isDoubles) {
        this.updateState((s) => {
          activePlayer.inJail = false;
          activePlayer.jailTurns = 0;
          this.addLog(`${activePlayer.name} rolled doubles (${roll.die1}-${roll.die2}) and broke out of Jail!`, 'jail');
        });
        this.movePlayerAndResolve(activePlayer, roll.totalMovement, roll);
      } else {
        activePlayer.jailTurns += 1;
        if (activePlayer.jailTurns >= 3) {
          activePlayer.balance -= 50;
          activePlayer.inJail = false;
          activePlayer.jailTurns = 0;
          this.updateState((s) => {
            this.addLog(`${activePlayer.name} served 3 turns in Jail, paid $50 fine, and is released!`, 'jail');
          });
          this.movePlayerAndResolve(activePlayer, roll.totalMovement, roll);
        } else {
          this.updateState((s) => {
            this.addLog(`${activePlayer.name} rolled ${roll.die1}-${roll.die2} (no doubles) and remains in Jail.`, 'jail');
            s.turnPhase = 'TURN_ACTIONS';
            s.currentActionText = `${activePlayer.name} is in Jail.`;
          });
        }
      }
      return;
    }

    // TRIPLES: Any space on the board
    if (roll.isTriples) {
      this.updateState((s) => {
        s.consecutiveDoubles = 0;
        s.turnPhase = 'TRIPLES_CHOICE';
        s.currentActionText = `${activePlayer.name} rolled TRIPLES (${roll.die1}-${roll.die2}-${roll.speedDie})! Choose any space on the board!`;
        this.addLog(`${activePlayer.name} rolled TRIPLES! Can teleport anywhere!`, 'roll');
      });
      return;
    }

    // REGULAR ROLL: Check 3 Consecutive Doubles
    if (roll.isDoubles) {
      this.state.consecutiveDoubles += 1;
      if (this.state.consecutiveDoubles >= 3) {
        this.sendToJail(activePlayer, 'Rolling 3 consecutive doubles');
        return;
      }
      this.addLog(`${activePlayer.name} rolled DOUBLES (${roll.die1}-${roll.die2})! Will get another roll.`, 'roll');
    } else {
      this.state.consecutiveDoubles = 0;
    }

    this.movePlayerAndResolve(activePlayer, roll.totalMovement, roll);
  }

  private movePlayerAndResolve(player: Player, distance: number, roll: DiceRollResult) {
    const oldPos = player.position;
    const newPos = (oldPos + distance) % 52;
    player.position = newPos;

    // Passed or landed on GO?
    if (newPos < oldPos && oldPos !== 0) {
      player.balance += 200;
      audio.playCashCollect();
      this.addLog(`${player.name} passed GO and collected $200 salary.`, 'money');
    }

    const landedSpace = BOARD_SPACES[newPos];
    this.addLog(`${player.name} moved ${distance} spaces to ${landedSpace.name}.`, 'info');

    this.resolveLandingSpace(player, landedSpace, roll);
  }

  private resolveLandingSpace(player: Player, space: BoardSpace, roll?: DiceRollResult) {
    // 1. CORNER SPACES
    if (space.type === 'corner') {
      if (space.cornerType === 'go') {
        player.balance += 200;
        audio.playCashCollect();
        this.addLog(`${player.name} landed on GO and collected $200.`, 'money');
      } else if (space.cornerType === 'go_to_jail') {
        this.sendToJail(player, 'Landed on GO TO JAIL');
        return;
      } else if (space.cornerType === 'free_parking' || space.cornerType === 'jail') {
        // Just visiting
      }
      this.checkSpeedDieFollowUp(player, roll);
      return;
    }

    // 2. TAX SPACES
    if (space.type === 'tax' && space.taxAmount) {
      player.balance -= space.taxAmount;
      audio.playPayRent();
      this.addLog(`${player.name} paid $${space.taxAmount} on ${space.name}.`, 'money');
      this.checkSpeedDieFollowUp(player, roll);
      return;
    }

    // 3. ACTION SPACES
    if (space.type === 'action') {
      if (space.actionType === 'bus_ticket') {
        this.drawBusTicketForPlayer(player);
        this.checkSpeedDieFollowUp(player, roll);
        return;
      } else if (space.actionType === 'birthday_gift') {
        this.updateState((s) => {
          s.turnPhase = 'TURN_ACTIONS';
          s.currentActionText = `${player.name} landed on Birthday Gift! Choose $100 or 1 Bus Ticket.`;
        });
        return;
      } else if (space.actionType === 'auction') {
        // Auction space: trigger prompt to pick any unowned property
        const unowned = findNextUnownedProperty(space.index, this.state.properties);
        if (unowned !== null) {
          this.startAuction(unowned);
          return;
        } else {
          // If all properties owned, advance to highest rent property
          this.addLog(`All properties owned! Auction space forces high-rent search.`, 'info');
        }
        this.checkSpeedDieFollowUp(player, roll);
        return;
      }
    }

    // 4. CHANCE OR COMMUNITY CHEST
    if (space.type === 'chance') {
      this.drawCard(player, 'chance', roll);
      return;
    }
    if (space.type === 'community_chest') {
      this.drawCard(player, 'community_chest', roll);
      return;
    }

    // 5. PROPERTIES (Street, Railroad, Utility)
    const prop = this.state.properties[space.index];
    if (!prop.ownerId) {
      // Unowned property: Prompt active player to buy or auction
      this.updateState((s) => {
        s.turnPhase = 'SPACE_RESOLUTION';
        s.currentActionText = `${player.name} landed on unowned ${space.name} ($${space.cost}).`;
      });
      return;
    } else if (prop.ownerId === player.id) {
      this.addLog(`${player.name} landed on their own property (${space.name}).`, 'info');
      this.checkSpeedDieFollowUp(player, roll);
    } else {
      // Owned by opponent: calculate and pay rent
      if (!prop.isMortgaged) {
        const rentDue = calculateRent(space, this.state.properties, roll ? roll.totalMovement : 7);
        const owner = this.state.players.find((p) => p.id === prop.ownerId);
        if (owner) {
          player.balance -= rentDue;
          owner.balance += rentDue;
          audio.playPayRent();
          this.addLog(`${player.name} paid $${rentDue} rent to ${owner.name} at ${space.name}.`, 'money');
        }
      } else {
        this.addLog(`${space.name} is mortgaged; no rent collected.`, 'info');
      }
      this.checkSpeedDieFollowUp(player, roll);
    }
  }

  private checkSpeedDieFollowUp(player: Player, roll?: DiceRollResult) {
    if (!roll) {
      this.finishTurnResolution();
      return;
    }

    // Speed Die Bus Icon follow-up
    if (roll.speedDie === 'bus') {
      this.updateState((s) => {
        s.turnPhase = 'SPEED_BUS_CHOICE';
        s.currentActionText = `${player.name} rolled BUS on the Speed Die! Choose to draw a Bus Ticket OR jump to nearest Chance/Chest.`;
      });
      return;
    }

    // Speed Die Mr. Monopoly follow-up
    if (roll.speedDie === 'mr_monopoly') {
      const nextUnowned = findNextUnownedProperty(player.position, this.state.properties);
      if (nextUnowned !== null) {
        this.addLog(`Mr. Monopoly triggered! ${player.name} leaps to unowned property ${BOARD_SPACES[nextUnowned].name}.`, 'roll');
        player.position = nextUnowned;
        this.updateState((s) => {
          s.turnPhase = 'SPACE_RESOLUTION';
          s.currentActionText = `Mr. Monopoly jump to ${BOARD_SPACES[nextUnowned].name} ($${BOARD_SPACES[nextUnowned].cost}).`;
        });
        return;
      } else {
        // All properties owned: jump to first opponent space owing rent
        const opponentSpace = findFirstOpponentRentSpace(player.position, player.id, this.state.properties);
        if (opponentSpace !== null) {
          this.addLog(`All properties owned! Mr. Monopoly sends ${player.name} to ${BOARD_SPACES[opponentSpace].name}!`, 'roll');
          player.position = opponentSpace;
          this.resolveLandingSpace(player, BOARD_SPACES[opponentSpace]);
          return;
        }
      }
    }

    this.finishTurnResolution();
  }

  finishTurnResolution() {
    const activePlayer = this.state.players[this.state.activePlayerIndex];
    this.updateState((s) => {
      s.turnPhase = 'TURN_ACTIONS';
      s.currentActionText = `${activePlayer?.name}: manage properties or end turn.`;
    });
  }

  handleBusChoice(playerId: string, choice: 'ticket' | 'chance_chest') {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || this.state.turnPhase !== 'SPEED_BUS_CHOICE') return;

    if (choice === 'ticket') {
      this.drawBusTicketForPlayer(player);
      this.finishTurnResolution();
    } else {
      const targetIndex = findNearestSpaceOfType(player.position, ['chance', 'community_chest']);
      player.position = targetIndex;
      this.addLog(`${player.name} sped to ${BOARD_SPACES[targetIndex].name}.`, 'card');
      this.resolveLandingSpace(player, BOARD_SPACES[targetIndex]);
    }
  }

  handleBirthdayChoice(playerId: string, choice: 'cash' | 'ticket') {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return;

    if (choice === 'cash') {
      player.balance += 100;
      audio.playCashCollect();
      this.addLog(`${player.name} collected $100 Birthday Gift.`, 'money');
    } else {
      this.drawBusTicketForPlayer(player);
    }
    this.finishTurnResolution();
  }

  handleTriplesChoice(playerId: string, targetIndex: number) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || this.state.turnPhase !== 'TRIPLES_CHOICE') return;

    const targetSpace = BOARD_SPACES[targetIndex];
    player.position = targetIndex;
    this.addLog(`${player.name} teleported to ${targetSpace.name} with Triples!`, 'roll');
    this.resolveLandingSpace(player, targetSpace);
  }

  private drawBusTicketForPlayer(player: Player) {
    if (this.state.busTicketsDeck.length === 0) {
      this.addLog(`Bus Tickets deck is empty.`, 'info');
      return;
    }

    const ticket = this.state.busTicketsDeck.shift()!;
    audio.playCashCollect();

    if (ticket.isExpirationCard) {
      // Expiration card: all OTHER players surrender all held bus tickets!
      this.state.players.forEach((p) => {
        if (p.id !== player.id) {
          if (p.busTickets.length > 0) {
            this.addLog(`${p.name} surrendered ${p.busTickets.length} Bus Ticket(s) due to EXPIRATION card!`, 'card');
            p.busTickets = [];
          }
        }
      });
      player.busTickets.push(ticket);
      this.addLog(`${player.name} drew "ALL TICKETS EXPIRE!" and wiped opponent bus cards!`, 'card');
    } else {
      player.busTickets.push(ticket);
      this.addLog(`${player.name} drew a Bus Ticket.`, 'card');
    }
    this.updateState(() => {});
  }

  private drawCard(player: Player, type: 'chance' | 'community_chest', roll?: DiceRollResult) {
    const deck = type === 'chance' ? this.chanceDeck : this.communityChestDeck;
    if (deck.length === 0) {
      const fresh = type === 'chance' ? [...CHANCE_CARDS] : [...COMMUNITY_CHEST_CARDS];
      deck.push(...fresh.sort(() => Math.random() - 0.5));
    }

    const card = deck.shift()!;
    this.state.activeCardDraw = {
      type,
      title: card.title,
      description: card.description,
      playerName: player.name,
      timestamp: Date.now(),
    };
    audio.playCardFlip();
    this.addLog(`${player.name} drew ${type === 'chance' ? 'Chance' : 'Community Chest'}: "${card.title}"`, 'card');

    if (card.actionType === 'ADVANCE_TO_GO') {
      player.position = 0;
      player.balance += 200;
      audio.playCashCollect();
    } else if (card.actionType === 'ADVANCE_TO_SPACE' && card.targetIndex !== undefined) {
      if (card.targetIndex < player.position) {
        player.balance += 200; // Passed GO
        audio.playCashCollect();
      }
      player.position = card.targetIndex;
      this.resolveLandingSpace(player, BOARD_SPACES[card.targetIndex], roll);
      return;
    } else if (card.actionType === 'ADVANCE_NEAREST_RAILROAD') {
      const target = findNearestSpaceOfType(player.position, ['railroad']);
      if (target < player.position) player.balance += 200;
      player.position = target;
      this.resolveLandingSpace(player, BOARD_SPACES[target], roll);
      return;
    } else if (card.actionType === 'ADVANCE_NEAREST_UTILITY') {
      const target = findNearestSpaceOfType(player.position, ['utility']);
      if (target < player.position) player.balance += 200;
      player.position = target;
      this.resolveLandingSpace(player, BOARD_SPACES[target], roll);
      return;
    } else if (card.actionType === 'COLLECT_MONEY' && card.amount) {
      player.balance += card.amount;
      audio.playCashCollect();
    } else if (card.actionType === 'PAY_MONEY' && card.amount) {
      player.balance -= card.amount;
      audio.playPayRent();
    } else if (card.actionType === 'PAY_EACH_PLAYER' && card.amount) {
      this.state.players.forEach((p) => {
        if (p.id !== player.id && !p.isBankrupt) {
          player.balance -= card.amount!;
          p.balance += card.amount!;
        }
      });
    } else if (card.actionType === 'COLLECT_FROM_EACH_PLAYER' && card.amount) {
      this.state.players.forEach((p) => {
        if (p.id !== player.id && !p.isBankrupt) {
          p.balance -= card.amount!;
          player.balance += card.amount!;
        }
      });
      audio.playCashCollect();
    } else if (card.actionType === 'GO_BACK_3') {
      player.position = (player.position - 3 + 52) % 52;
      this.resolveLandingSpace(player, BOARD_SPACES[player.position], roll);
      return;
    } else if (card.actionType === 'GO_TO_JAIL') {
      this.sendToJail(player, 'Drawn Card');
      return;
    } else if (card.actionType === 'JAIL_FREE') {
      player.getOutOfJailCards += 1;
      this.addLog(`${player.name} received a Get Out of Jail Free card!`, 'card');
    }

    this.checkSpeedDieFollowUp(player, roll);
  }

  private sendToJail(player: Player, reason: string) {
    player.position = 12; // Jail space
    player.inJail = true;
    player.jailTurns = 0;
    this.state.consecutiveDoubles = 0;
    audio.playJail();
    this.addLog(`${player.name} sent to JAIL! (${reason})`, 'jail');
    this.updateState((s) => {
      s.turnPhase = 'TURN_ACTIONS';
      s.currentActionText = `${player.name} sent to Jail!`;
    });
  }

  handleBuyProperty(playerId: string, propertyIndex: number) {
    const player = this.state.players.find((p) => p.id === playerId);
    const space = BOARD_SPACES[propertyIndex];
    const prop = this.state.properties[propertyIndex];

    if (!player || !space || !prop || prop.ownerId || !space.cost) return;
    if (player.balance < space.cost) {
      this.addLog(`${player.name} has insufficient funds to purchase ${space.name}.`, 'info');
      return;
    }

    player.balance -= space.cost;
    prop.ownerId = player.id;
    audio.playBuyProperty();
    this.addLog(`${player.name} purchased ${space.name} for $${space.cost}!`, 'money');

    this.finishTurnResolution();
  }

  handlePassPropertyToAuction(propertyIndex: number) {
    this.startAuction(propertyIndex);
  }

  startAuction(propertyIndex: number) {
    const space = BOARD_SPACES[propertyIndex];
    audio.playAuctionGavel();
    this.updateState((s) => {
      s.turnPhase = 'AUCTION';
      s.auctionState = {
        propertyIndex,
        currentBid: 10,
        highestBidderId: null,
        activePlayerIds: s.players.filter((p) => !p.isBankrupt).map((p) => p.id),
        passedPlayerIds: [],
      };
      s.currentActionText = `AUCTION: ${space.name}! Starting bid: $10.`;
      this.addLog(`AUCTION started for ${space.name}!`, 'auction');
    });
  }

  handlePlaceBid(playerId: string, amount: number) {
    if (!this.state.auctionState) return;
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || player.balance < amount || amount <= this.state.auctionState.currentBid) return;

    this.state.auctionState.currentBid = amount;
    this.state.auctionState.highestBidderId = playerId;
    audio.playAuctionGavel();
    this.addLog(`${player.name} bid $${amount}!`, 'auction');
    this.updateState((s) => {
      s.currentActionText = `AUCTION: ${player.name} leads with $${amount}!`;
    });
  }

  handleFoldBid(playerId: string) {
    if (!this.state.auctionState) return;
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return;

    if (!this.state.auctionState.passedPlayerIds.includes(playerId)) {
      this.state.auctionState.passedPlayerIds.push(playerId);
      this.addLog(`${player.name} folded from the auction.`, 'auction');
    }

    const remainingActive = this.state.auctionState.activePlayerIds.filter(
      (id) => !this.state.auctionState!.passedPlayerIds.includes(id)
    );

    // If only 1 player remaining and they bid
    if (remainingActive.length <= 1) {
      const winnerId = this.state.auctionState.highestBidderId || (remainingActive.length === 1 ? remainingActive[0] : null);
      if (winnerId) {
        const winner = this.state.players.find((p) => p.id === winnerId);
        const space = BOARD_SPACES[this.state.auctionState.propertyIndex];
        const prop = this.state.properties[this.state.auctionState.propertyIndex];
        if (winner && space && prop) {
          winner.balance -= this.state.auctionState.currentBid;
          prop.ownerId = winner.id;
          audio.playBuyProperty();
          this.addLog(`${winner.name} WON the auction for ${space.name} at $${this.state.auctionState.currentBid}!`, 'auction');
        }
      } else {
        this.addLog(`Auction ended with no bids. Property remains unowned.`, 'auction');
      }

      this.state.auctionState = null;
      this.finishTurnResolution();
    } else {
      this.updateState(() => {});
    }
  }

  handlePlayBusTicket(playerId: string, ticketId: string, targetIndex: number) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || this.state.turnPhase !== 'WAITING_FOR_ROLL') return;

    if (!canPlayBusTicketToSpace(player.position, targetIndex)) {
      this.addLog(`Invalid Bus Ticket target: must be on the same side of the board!`, 'info');
      return;
    }

    const ticketIdx = player.busTickets.findIndex((t) => t.id === ticketId);
    if (ticketIdx === -1) return;

    player.busTickets.splice(ticketIdx, 1);
    player.position = targetIndex;
    const targetSpace = BOARD_SPACES[targetIndex];
    this.addLog(`${player.name} used a Bus Ticket to ride directly to ${targetSpace.name}!`, 'card');

    this.resolveLandingSpace(player, targetSpace);
  }

  handleBuildHouse(playerId: string, propertyIndex: number) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return;

    const check = canBuildHouse(playerId, propertyIndex, this.state.properties, this.state.bankInventory.houses, player.balance);
    if (!check.canBuild) {
      this.addLog(`Cannot build house: ${check.reason}`, 'info');
      return;
    }

    const space = BOARD_SPACES[propertyIndex];
    const prop = this.state.properties[propertyIndex];
    const cost = space.streetDeed!.buildCost;

    player.balance -= cost;
    if (prop.houses < 4) {
      prop.houses += 1;
      this.state.bankInventory.houses -= 1;
      audio.playBuyProperty();
      this.addLog(`${player.name} built a House on ${space.name} (Total: ${prop.houses}).`, 'build');
    } else if (prop.houses === 4 && this.state.bankInventory.hotels > 0) {
      // Hotel upgrade
      prop.houses = 0;
      prop.hasHotel = true;
      this.state.bankInventory.houses += 4; // return houses
      this.state.bankInventory.hotels -= 1;
      audio.playBuyProperty();
      this.addLog(`${player.name} built a HOTEL on ${space.name}!`, 'build');
    }

    this.updateState(() => {});
  }

  handleBuildSkyscraper(playerId: string, propertyIndex: number) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return;

    const check = canBuildSkyscraper(playerId, propertyIndex, this.state.properties, this.state.bankInventory.skyscrapers, player.balance);
    if (!check.canBuild) {
      this.addLog(`Cannot build Skyscraper: ${check.reason}`, 'info');
      return;
    }

    const space = BOARD_SPACES[propertyIndex];
    const prop = this.state.properties[propertyIndex];
    const cost = space.streetDeed!.buildCost;

    player.balance -= cost;
    prop.hasHotel = false;
    prop.hasSkyscraper = true;
    this.state.bankInventory.hotels += 1; // return hotel
    this.state.bankInventory.skyscrapers -= 1;
    audio.playBuyProperty();
    this.addLog(`SKYCRAPER ERECTED! ${player.name} upgraded ${space.name} to a SKYSCRAPER!`, 'build');

    this.updateState(() => {});
  }

  handleBuildDepot(playerId: string, propertyIndex: number) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return;

    const check = canBuildTrainDepot(playerId, propertyIndex, this.state.properties, this.state.bankInventory.depots, player.balance);
    if (!check.canBuild) {
      this.addLog(`Cannot build Train Depot: ${check.reason}`, 'info');
      return;
    }

    const space = BOARD_SPACES[propertyIndex];
    const prop = this.state.properties[propertyIndex];

    player.balance -= 100;
    prop.hasDepot = true;
    this.state.bankInventory.depots -= 1;
    audio.playBuyProperty();
    this.addLog(`${player.name} built a TRAIN DEPOT on ${space.name} (Rent doubled!).`, 'build');

    this.updateState(() => {});
  }

  handleMortgageProperty(playerId: string, propertyIndex: number) {
    const player = this.state.players.find((p) => p.id === playerId);
    const space = BOARD_SPACES[propertyIndex];
    const prop = this.state.properties[propertyIndex];

    if (!player || !space || !prop || prop.ownerId !== playerId || prop.isMortgaged) return;

    // Check if property or any property in color group has buildings
    if (prop.houses > 0 || prop.hasHotel || prop.hasSkyscraper || prop.hasDepot) {
      this.addLog(`Cannot mortgage ${space.name}: Must sell all houses/hotels first!`, 'info');
      return;
    }

    const mortgageValue = space.streetDeed?.mortgageValue || Math.floor((space.cost || 100) / 2);
    prop.isMortgaged = true;
    player.balance += mortgageValue;
    audio.playCashCollect();
    this.addLog(`${player.name} mortgaged ${space.name} and collected $${mortgageValue} liquidity.`, 'money');

    this.updateState(() => {});
  }

  handleUnmortgageProperty(playerId: string, propertyIndex: number) {
    const player = this.state.players.find((p) => p.id === playerId);
    const space = BOARD_SPACES[propertyIndex];
    const prop = this.state.properties[propertyIndex];

    if (!player || !space || !prop || prop.ownerId !== playerId || !prop.isMortgaged) return;

    const mortgageValue = space.streetDeed?.mortgageValue || Math.floor((space.cost || 100) / 2);
    const unmortgageCost = Math.ceil(mortgageValue * 1.1); // 10% interest

    if (player.balance < unmortgageCost) {
      this.addLog(`Cannot unmortgage: Insufficient funds (Costs $${unmortgageCost}).`, 'info');
      return;
    }

    player.balance -= unmortgageCost;
    prop.isMortgaged = false;
    audio.playBuyProperty();
    this.addLog(`${player.name} paid $${unmortgageCost} to lift mortgage on ${space.name}.`, 'money');

    this.updateState(() => {});
  }

  handlePayJailFee(playerId: string) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || !player.inJail) return;

    if (player.balance < 50) {
      this.addLog(`Cannot pay bail: Insufficient funds (Requires $50).`, 'info');
      return;
    }

    player.balance -= 50;
    player.inJail = false;
    player.jailTurns = 0;
    audio.playCashCollect();
    this.addLog(`${player.name} paid $50 bail fee and is released from Jail!`, 'jail');

    this.updateState((s) => {
      s.currentActionText = `${player.name} is free from Jail! Roll 3 dice!`;
    });
  }

  handleUseJailCard(playerId: string) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || !player.inJail || player.getOutOfJailCards <= 0) return;

    player.getOutOfJailCards -= 1;
    player.inJail = false;
    player.jailTurns = 0;
    audio.playBuyProperty();
    this.addLog(`${player.name} used a Get Out of Jail Free card and was released!`, 'jail');

    this.updateState((s) => {
      s.currentActionText = `${player.name} is free from Jail! Roll 3 dice!`;
    });
  }

  handleDismissCardDraw() {
    this.updateState((s) => {
      s.activeCardDraw = null;
    });
  }

  handleEndTurn(playerId: string) {
    const activePlayer = this.state.players[this.state.activePlayerIndex];
    if (!activePlayer || activePlayer.id !== playerId) return;

    // Check if player has rolled doubles (and not jailed or tripped) -> get another turn!
    if (this.state.lastDiceRoll?.isDoubles && !activePlayer.inJail && !this.state.lastDiceRoll.isTriples && this.state.consecutiveDoubles < 3) {
      this.updateState((s) => {
        s.turnPhase = 'WAITING_FOR_ROLL';
        s.currentActionText = `${activePlayer.name} rolled doubles! Roll again!`;
        this.addLog(`${activePlayer.name} rolls again for doubles.`, 'roll');
      });
      return;
    }

    // Pass turn to next active non-bankrupt player
    let nextIndex = (this.state.activePlayerIndex + 1) % this.state.players.length;
    let attempts = 0;
    while (this.state.players[nextIndex].isBankrupt && attempts < this.state.players.length) {
      nextIndex = (nextIndex + 1) % this.state.players.length;
      attempts++;
    }

    this.updateState((s) => {
      s.activePlayerIndex = nextIndex;
      s.consecutiveDoubles = 0;
      s.lastDiceRoll = null;
      s.turnPhase = 'WAITING_FOR_ROLL';
      const nextPlayer = s.players[nextIndex];
      s.currentActionText = `It is ${nextPlayer.name}'s turn!`;
      this.addLog(`Turn passed to ${nextPlayer.name}.`, 'info');
    });
  }
}
