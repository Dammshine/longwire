export type CellBase = {
  coord: Coord;
  cellType: string;
};
export type WaterCell = CellBase & {
  cellType: "Water";
}
export type IslandCell = CellBase & {
  cellType: "Island";
  requestBridgeCount: number;
}
export type BridgeCell = CellBase & {
  cellType: "Bridge";
  bridgeCount: number;
}

export type Cell = WaterCell | IslandCell | BridgeCell;
export type Bridge = "None" | "Single" | "Double" | "Triple";
export type Coord = [number, number];

export const MAX_BRIDGE_SIZE = 3;

export interface GameState {
  grid: Cell[][];
}
export interface GameBoard {
  currentState: GameState;
  history: GameState[];

  addBridge(start: Coord, end: Coord, bridgeType: Bridge): void;
  verifyCompleteState(): boolean;
  printBoard(): void;
}

