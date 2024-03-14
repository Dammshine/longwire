import { GameBoardImpl } from "./game/game";
import { AgentBase } from "./agent/agent";
import { RandomAgent } from "./agent/randomAgent";
import { printOperations } from "./common/gameModel";
import { readFile, writeFile } from "fs/promises";
import { inspect } from "util";

// Example usage
const input = `
3...3
.....
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
    console.clear();
    const operations = agent.makeMove();
    // console.log(inspect(gameBoard.currentState, { depth: 5 }));

    if (operations.length === 0) {
      gameBoard.revertLastChange(); // Rollback if no moves are possible
    } else {
      printOperations(operations);
      gameBoard.addBridges(operations);
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
