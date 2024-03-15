export type CellBase = {
  coord: Coord;
  cellType: string;
};
export type WaterCell = CellBase & {
  cellType: "Water";
};
export type IslandCell = CellBase & {
  cellType: "Island";
  requestBridgeCount: number;
};
export type BridgeCell = CellBase & {
  cellType: "Bridge";
  bridgeCount: number;
  direction: "horizontal" | "vertical";
};

export type Cell = WaterCell | IslandCell | BridgeCell;
export type Bridge = number;
export type Coord = [number, number];

export const MAX_BRIDGE_SIZE = 3;

export interface GameState {
  grid: Cell[][];
}

export interface Operation {
  start: Coord;
  end: Coord;
  bridge: number;
}

export interface GameBoard {
  currentState: GameState;
  history: GameState[];

  addBridges(operations: Operation[]): boolean;
  revertLastChange(): void;

  verifyCompleteState(): boolean;
  printBoard(): void;
}

export function printOperations(operations: Operation[]): void {
  if (operations.length === 0) {
      console.log("No operations to perform.");
      return;
  }

  console.log("Operations:");
  operations.forEach((op, index) => {
      const start = coordToString(op.start);
      const end = coordToString(op.end);
      console.log(`  Operation ${index + 1}: Start at ${start}, End at ${end}, Bridges: ${op.bridge}`);
  });
}

function coordToString(coord: Coord): string {
  // Converts a coordinate array to a string representation
  return `(${coord[1]}, ${coord[0]})`;
}

export function hashGameState(gameState: GameState): string {
  let hash = '';

  gameState.grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      hash += `${cell.cellType}_${rowIndex}_${colIndex}_`;
      if (cell.cellType === "Island") {
        hash += `${cell.requestBridgeCount}_`;
      } else if (cell.cellType === "Bridge") {
        if (cell.bridgeCount === 0) {
          hash += `0_`;
        } else {
          hash += `${cell.bridgeCount}_${cell.direction}_`;
        }
      } else if (cell.cellType === "Water") {
        hash += '_';
      }
    });
  });

  return hash;
}