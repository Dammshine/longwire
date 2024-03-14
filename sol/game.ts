import {
  GameBoard,
  GameState,
  Cell,
  Coord,
  Bridge,
  IslandCell,
} from "./gameModel";

export function DeepCopyState(state: GameState): GameState {
  return {
    grid: state.grid.map((row) => row.map((cell) => ({ ...cell }))),
  };
}

export class GameBoardImpl implements GameBoard {
  currentState: GameState;
  history: GameState[] = [];

  private saveState(): void {
    this.history.push(DeepCopyState(this.currentState));
  }

  constructor(input: string) {
    const initialGrid = this.parseInput(input);
    this.currentState = { grid: initialGrid };
    this.saveState();
  }

  private parseInput(input: string): Cell[][] {
    const lines = input.split("\n").filter((line) => line.trim() !== "");
    const grid: Cell[][] = [];

    for (let rowIndex = 0; rowIndex < lines.length; rowIndex++) {
      const line = lines[rowIndex];
      const row: Cell[] = [];

      for (let colIndex = 0; colIndex < line.length; colIndex++) {
        const char = line[colIndex];
        const coord: Coord = [rowIndex, colIndex];

        if (char === ".") {
          row.push({ coord, cellType: "Water" });
        } else if (!isNaN(parseInt(char, 16))) {
          row.push({
            coord,
            cellType: "Island",
            requestBridgeCount: parseInt(char, 16),
          });
        } else {
          throw new Error(`Invalid character in input: ${char}`);
        }
      }
      grid.push(row);
    }

    return grid;
  }

  addBridge(start: Coord, end: Coord, bridgeType: Bridge): void {
    console.log(`Added ${bridgeType} bridge from ${start} to ${end}`);
  }

  /**
   * @returns True if the game is completed.
   */
  verifyCompleteState(): boolean {
    for (let row = 0; row < this.currentState.grid.length; row++) {
      for (let col = 0; col < this.currentState.grid[row].length; col++) {
        const cell = this.currentState.grid[row][col];
        if (cell.cellType === "Island") {
          if (!this.verifyIsland(cell)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  isValidCoord(coord: Coord): boolean {
    return (
      coord[0] >= 0 &&
      coord[0] < this.currentState.grid.length &&
      coord[1] >= 0 &&
      coord[1] < this.currentState.grid[0].length
    );
  }

  verifyIsland(cell: IslandCell): boolean {
    let coord = cell.coord;

    let bridgeCount = 0;
    const directions = {
      right: [0, 1],
      down: [1, 0],
      left: [0, -1],
      up: [-1, 0],
    };

    for (const direction in directions) {
      const [dx, dy] = directions[direction];
      let [x, y] = [coord[0] + dx, coord[1] + dy];

      if (!this.isValidCoord([x, y])) {
        continue;
      }

      let nextCell = this.currentState.grid[x][y];
      if (nextCell.cellType === "Bridge") {
        if (
          ((direction === "right" || direction === "left") &&
            nextCell.direction === "horizontal") ||
          ((direction === "up" || direction === "down") &&
            nextCell.direction === "vertical")
        ) {
          bridgeCount += nextCell.bridgeCount;
        }
      }
    }

    return bridgeCount === cell.requestBridgeCount;
  }

  printBoard(): void {
    // Implementation for printing the board
    // Iterate through each cell and print the appropriate representation
    for (const row of this.currentState.grid) {
      let rowStr = "";
      for (const cell of row) {
        switch (cell.cellType) {
          case "Water":
            rowStr += ".";
            break;
          case "Island":
            rowStr += cell.requestBridgeCount.toString(16);
            break;
          case "Bridge":
            // Placeholder for bridge representation
            rowStr +=
              cell.bridgeCount === 1 ? "-" : cell.bridgeCount === 2 ? "=" : "E";
            break;
        }
      }
      console.log(rowStr);
    }
  }
}
