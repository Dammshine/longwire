import { GameBoardImpl } from "./game/game";
import { AgentBase } from "./agent/agent";
import { RandomAgent } from "./agent/randomAgent";

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
const agent: AgentBase = new RandomAgent();
agent.initialize(gameBoard);

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function GameStart() {
  gameBoard.printBoard();

  while (!gameBoard.verifyCompleteState()) {
    const operations = agent.makeMove();

    if (operations.length === 0) {
      gameBoard.revertLastChange(); // Rollback if no moves are possible
    } else {
      gameBoard.addBridges(operations);
    }

    gameBoard.printBoard();
    await sleep(1000);
  }
  console.log("Game complete!");
}

GameStart();

