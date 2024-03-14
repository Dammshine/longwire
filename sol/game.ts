import { GameBoard, GameState, Cell, Coord, Bridge } from "./gameModel";

export function DeepCopyState(state: GameState): GameState {
  return {
    grid: state.grid.map(row => row.map(cell => ({ ...cell })))
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
    const lines = input.split('\n').filter(line => line.trim() !== '');
    const grid: Cell[][] = [];

    for (const line of lines) {
      const row: Cell[] = [];
      for (const char of line) {
        if (char === '.') {
          row.push({ cellType: "Water" });
        } else if (!isNaN(parseInt(char, 16))) {
          row.push({ cellType: "Island", count: parseInt(char, 16) });
        } else {
          throw new Error(`Invalid character in input: ${char}`);
        }
      }
      grid.push(row);
    }

    return grid;
  }

  addBridge(start: Coord, end: Coord, bridgeType: Bridge): void {
    // Implementation for adding a bridge goes here
    // You need to validate start and end coordinates, update the bridge cells, and update adjacent islands
    // This is a simplified placeholder
    console.log(`Added ${bridgeType} bridge from ${start} to ${end}`);
  }

  verifyBoard(): boolean {
    // Implementation for verifying if the board is in a valid state goes here
    // Check if all islands have the correct number of bridges and bridges follow the game rules
    return true; // Placeholder return
  }

  printBoard(): void {
    // Implementation for printing the board
    // Iterate through each cell and print the appropriate representation
    for (const row of this.currentState.grid) {
      let rowStr = '';
      for (const cell of row) {
        switch (cell.cellType) {
          case "Water":
            rowStr += '.';
            break;
          case "Island":
            rowStr += cell.count.toString(16);
            break;
          case "Bridge":
            // Placeholder for bridge representation
            rowStr += cell.bridgeCount === 1 ? '-' : (cell.bridgeCount === 2 ? '=' : 'E');
            break;
        }
      }
      console.log(rowStr);
    }
  }
}
