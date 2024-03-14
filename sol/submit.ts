import { parseGameStateToGraph } from "./common/graph";
import { GameBoardImpl } from "./game/game";

// Example usage
const input = `
.1...6...7....4.4.2.
..4.2..2...3.8...6.2
.....2..............
5.c.7..a.a..5.6..8.5
.............2......
...5...9.a..8.b.8.4.
4.5................3
....2..4..1.5...2...
.2.7.4...7.2..5...3.
............4..3.1.2
`;

const gameBoard = new GameBoardImpl(input);
gameBoard.printBoard();

const gameState = gameBoard.currentState;
const graph = parseGameStateToGraph(gameState);
console.log(graph)