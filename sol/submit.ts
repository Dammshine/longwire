import { GameBoardImpl } from "./game/game";
import { AgentBase } from "./agent/agent";
import { RandomAgent } from "./agent/randomAgent";
import { printOperations } from "./common/gameModel";
import { readFile, writeFile } from "fs/promises";
import { inspect } from "util";

// Example usage
const input = `
6.7.4.
......
5.3...
....3.
4.4...
.2..4.
`;

const gameBoard = new GameBoardImpl(input);
const agent: AgentBase = new RandomAgent();

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function GameStart() {
  gameBoard.printBoard();

  while (!gameBoard.verifyCompleteState()) {
    console.clear();
    const operations = agent.makeMove(gameBoard);
    // console.log(inspect(gameBoard.currentState, { depth: 5 }));

    if (operations.length === 0) {
      console.log("No moves possible. Reverting last change.");
      gameBoard.revertLastChange(); // Rollback if no moves are possible
    } else {
      printOperations(operations);
      if (!gameBoard.addBridges(operations)) {
        console.log("Applied operation failed. Debug. ");
      }
    }

    gameBoard.printBoard();
    await sleep(1000);
  }
  console.log("Game complete!");
  generateGameCompleteFile();
}

GameStart();

function generateGameCompleteFile() {
  const gameData = {
    board: gameBoard.currentState,
    history: gameBoard.history,
  };

  writeFile("gameComplete.json", JSON.stringify(gameData, null, 2), "utf8");
}
