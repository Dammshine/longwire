import { GameBoardImpl } from "./game/game";
import {RecursiveChoiceAgent} from "./agent/recursiveChoiceAgent";
import { promises as fs } from 'fs';

async function runTestCases(testCases: string[]) {
  await clearDirectory('./result');
  let results = [];
  const agent = new RecursiveChoiceAgent();

  let i = 0;
  for (let input of testCases) {
    const gameBoard = new GameBoardImpl(input);

    let moves = [];
    while (!gameBoard.verifyCompleteState()) {
      //console.clear();
      const operations = agent.makeMove(gameBoard);
      if (operations.length === 0) {
        gameBoard.revertLastChange();
      } else {
        moves.push(operations);
        gameBoard.addBridges(operations);
      }

      // gameBoard.printBoard();
    }

    const dir = './result';
    try {
      // Create the directory if it doesn't exist
      await fs.mkdir(dir, { recursive: true });

      // Write the file
      const filePath = `${dir}/${i++}.in`;
      await fs.writeFile(filePath, gameBoard.printBoard(true), "utf8");
      console.log(`Results written to ${filePath}`);
    } catch (err) {
      console.error('Error writing file:', err);
    }

    results.push({
      input,
      moves,
      finalBoard: gameBoard.currentState
    });
  }

  return results;
}

// Example usage with an array of game inputs
const gameInputs = [
`.2.
...
.2.
`,
`.4..4
...2.
.....
.3.4.
....1`,
`3.4.7.5
.....2.
7.8.4.5
.......
7.a..4.
.......
..9.9.8
.......
4...5.4
..6....
....2.2
4.7..2.`,
`......
6.7..4
......
......
5.7..5
......
......
5.5..3
....2.
..1...
7...7.
......
2.1.2.
.....1`,
`6...8..6.7.4
..3.........
4........1..
....9..9...4
............
....9..9...7
............
5.6.5.4...2.
.3..........
3..3..7..7.8
..4.3.......
.5.3..3..4.3`,
`.3.8..6.4..3
.......1..2.
5..6..7..2..
............
5.8.7.9.5.5.
............
.......2..4.
6.9.9.9.5...
............
6.9.7.5.4.2.
............
....3.6..2..
..2.........`,
`.3...3........
...2...2..4..3
..............
.4.7.5..1.....
...........4.6
......1..3....
.2............
...5.6.4.5....
..............
.5.9..8..6.6.8
..............
........3..4..
.4.6..5......4
..............`,
`5........7...3.
..6....4...2..2
...1..3........
7.8.2..4.c.8.3.
............3.6
6.9.7.6..8.....
............3.5
4.4........5...
.2..9.6..8.....
...........3...
4...6..1.8..4..
..1...7.3......
..........2.5.3
4.7.8.6..7.4.1.`,
`3..3...7.8.8.7.6
........1.......
7...8.6..4.6.5.8
.......2........
7.9.9.8.3..3.4.5
................
......8.5.6.4..3
.........3.1....
7.9.....1.2.2..5
......9..a.7.7..
7.9.............
......9..7...a.6
................
......8..6...9.3
..3.............
5...7.7..7...7.2`
];

async function clearDirectory(dir) {
  try {
    const files = await fs.readdir(dir);
    const unlinkPromises = files.map(filename => fs.unlink(`${dir}/${filename}`));
    return Promise.all(unlinkPromises);
  } catch (err) {
    console.error(`Error clearing directory ${dir}:`, err);
  }
}

runTestCases(gameInputs);