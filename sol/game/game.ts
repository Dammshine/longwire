import {
  GameBoard,
  GameState,
  Cell,
  Coord,
  IslandCell,
  Operation,
} from "../common/gameModel";
import { DeepCopyState, VerifyOperation, isValidCoord } from "./gameUtil";

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

  addBridges(operations: Operation[]): boolean {
    this.saveState();
    for (let operation of operations) {
      if (!VerifyOperation(operation, this.currentState)) {
        // Always fall back to the last state
        this.revertLastChange();
        return false;
      }
      this.applyOperation(operation);
    }

    return true;
  }

  private applyOperation(operation: Operation): void {
    const { start, end, bridge } = operation;
    const isHorizontal = start[1] === end[1];
    const direction = isHorizontal ? "horizontal" : "vertical";

    // Define increments for iteration based on the direction of the bridge
    const [startX, startY] = start;
    const [endX, endY] = end;
    const incrementX = isHorizontal ? 0 : startX < endX ? 1 : -1;
    const incrementY = isHorizontal ? (startY < endY ? 1 : -1) : 0;

    // Iterate over the path and update/create bridge cells
    for (
      let x = startX, y = startY;
      x !== endX || y !== endY;
      x += incrementX, y += incrementY
    ) {
      if (!isValidCoord([x, y], this.currentState)) break;
      let cell = this.currentState.grid[x][y];

      if (cell.cellType === "Water") {
        // Create a new bridge cell
        this.currentState.grid[x][y] = {
          coord: [x, y],
          cellType: "Bridge",
          bridgeCount: bridge,
          direction: direction,
        };
      } else if (cell.cellType === "Bridge" && cell.direction === direction) {
        // Increment the bridge count of an existing bridge cell
        cell.bridgeCount += bridge;
      }
    }
  }

  revertLastChange(): void {
    if (this.history.length > 1) {
      this.history.pop();
      this.currentState = this.history[this.history.length - 1];
    } else {
      console.log("No more states to revert to");
    }
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

      if (!isValidCoord([x, y], this.currentState)) {
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
            if (cell.direction === "horizontal") {
              if (cell.bridgeCount === 1) rowStr += "-";
              else if (cell.bridgeCount === 2) rowStr += "=";
              else if (cell.bridgeCount === 3) rowStr += "E";
            } else {
              // Vertical
              if (cell.bridgeCount === 1) rowStr += "|";
              else if (cell.bridgeCount === 2) rowStr += '"';
              else if (cell.bridgeCount === 3) rowStr += "#";
            }
            break;
        }
      }
      console.log(rowStr);
    }
  }
}
