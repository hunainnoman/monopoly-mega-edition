export interface GridPosition {
  row: number;
  col: number;
  rowSpan?: number;
  colSpan?: number;
}

// 15x15 CSS Grid mapping for all 52 Monopoly: The Mega Edition spaces
export const SPACE_GRID_COORDINATES: Record<number, GridPosition> = {
  // CORNER 0: GO (Bottom-Right)
  0: { row: 14, col: 14, rowSpan: 2, colSpan: 2 },

  // SIDE 1: Bottom Track (Right to Left: cols 13 down to 3, row 14-15)
  1: { row: 14, col: 13, rowSpan: 2 }, // Mediterranean
  2: { row: 14, col: 12, rowSpan: 2 }, // Community Chest
  3: { row: 14, col: 11, rowSpan: 2 }, // Baltic
  4: { row: 14, col: 10, rowSpan: 2 }, // Arctic
  5: { row: 14, col: 9, rowSpan: 2 },  // Income Tax
  6: { row: 14, col: 8, rowSpan: 2 },  // Reading RR
  7: { row: 14, col: 7, rowSpan: 2 },  // Massachusetts
  8: { row: 14, col: 6, rowSpan: 2 },  // Oriental
  9: { row: 14, col: 5, rowSpan: 2 },  // Chance
  10: { row: 14, col: 4, rowSpan: 2 }, // Vermont
  11: { row: 14, col: 3, rowSpan: 2 }, // Connecticut

  // CORNER 1: IN JAIL / JUST VISITING (Bottom-Left)
  12: { row: 14, col: 1, rowSpan: 2, colSpan: 2 },

  // SIDE 2: Left Track (Bottom to Top: rows 13 down to 2, col 1-2)
  13: { row: 13, col: 1, colSpan: 2 }, // Maryland
  14: { row: 12, col: 1, colSpan: 2 }, // St. Charles
  15: { row: 11, col: 1, colSpan: 2 }, // Electric Co
  16: { row: 10, col: 1, colSpan: 2 }, // States
  17: { row: 9, col: 1, colSpan: 2 },  // Virginia
  18: { row: 8, col: 1, colSpan: 2 },  // Pennsylvania RR
  19: { row: 7, col: 1, colSpan: 2 },  // St. James
  20: { row: 6, col: 1, colSpan: 2 },  // Community Chest
  21: { row: 5, col: 1, colSpan: 2 },  // Tennessee
  22: { row: 4, col: 1, colSpan: 2 },  // New York
  23: { row: 3, col: 1, colSpan: 2 },  // New Jersey
  24: { row: 2, col: 1, colSpan: 2 },  // AUCTION

  // CORNER 2: FREE PARKING (Top-Left)
  25: { row: 1, col: 1, rowSpan: 2, colSpan: 2 },

  // SIDE 3: Top Track (Left to Right: cols 3 to 14, row 1-2)
  26: { row: 1, col: 3, rowSpan: 2 }, // Kentucky
  27: { row: 1, col: 4, rowSpan: 2 }, // Chance
  28: { row: 1, col: 5, rowSpan: 2 }, // Indiana
  29: { row: 1, col: 6, rowSpan: 2 }, // Illinois
  30: { row: 1, col: 7, rowSpan: 2 }, // Michigan
  31: { row: 1, col: 8, rowSpan: 2 }, // BUS TICKET
  32: { row: 1, col: 9, rowSpan: 2 }, // B. & O. RR
  33: { row: 1, col: 10, rowSpan: 2 }, // Atlantic
  34: { row: 1, col: 11, rowSpan: 2 }, // Ventnor
  35: { row: 1, col: 12, rowSpan: 2 }, // Water Works
  36: { row: 1, col: 13, rowSpan: 2 }, // Marvin Gardens
  37: { row: 1, col: 14, rowSpan: 2 }, // California

  // CORNER 3: GO TO JAIL (Top-Right)
  38: { row: 1, col: 15, rowSpan: 2, colSpan: 1 },

  // SIDE 4: Right Track (Top to Bottom: rows 3 to 15, col 15)
  39: { row: 3, col: 15 }, // Pacific
  40: { row: 4, col: 15 }, // South Carolina
  41: { row: 5, col: 15 }, // North Carolina
  42: { row: 6, col: 15 }, // Community Chest
  43: { row: 7, col: 15 }, // Pennsylvania
  44: { row: 8, col: 15 }, // Short Line RR
  45: { row: 9, col: 15 }, // Chance
  46: { row: 10, col: 15 }, // BIRTHDAY GIFT
  47: { row: 11, col: 15 }, // Florida
  48: { row: 12, col: 15 }, // Park Place
  49: { row: 13, col: 15 }, // Luxury Tax
  50: { row: 14, col: 15 }, // Gas Company
  51: { row: 15, col: 15 }, // Boardwalk
};
