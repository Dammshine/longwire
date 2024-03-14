export type CellBase = {
  cellType: string;
};
export type WaterCell = {
  cellType: "Water";
}
export type IslandCell = {
  cellType: "Island";
  count: number;
}
export type BridgeCell = {
  cellType: "Bridge";
  bridgeCount: number;
}

export type Cell = WaterCell | IslandCell | BridgeCell;
export type Bridge = "None" | "Single" | "Double" | "Triple";
export type Coord = [number, number];

export const MAX_BRIDGE_SIZE = 3;

export interface GameBoard {
  grid: Cell[][];
  addBridge(start: Coord, end: Coord, bridgeType: Bridge): void;
  verifyBoard(): boolean;
  printBoard(): void;
}

