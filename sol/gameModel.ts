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
export type Bridge = "None" | "Single" | "Double" | "Triple";
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
