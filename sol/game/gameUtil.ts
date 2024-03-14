import { Coord, GameState, MAX_BRIDGE_SIZE, Operation } from "../common/gameModel";

export function DeepCopyState(state: GameState): GameState {
  return {
    grid: state.grid.map((row) => row.map((cell) => ({ ...cell }))),
  };
}

export function isValidCoord(coord: Coord, gameState: GameState): boolean {
  return (
    coord[0] >= 0 &&
    coord[0] < gameState.grid.length &&
    coord[1] >= 0 &&
    coord[1] < gameState.grid[0].length
  );
}

export function VerifyOperation(
  operation: Operation,
  gameState: GameState
): boolean {
  const { start, end, bridge } = operation;

  if (bridge < 1 || bridge > MAX_BRIDGE_SIZE) {
    return false;
  }

  if (!isValidCoord(start, gameState) || !isValidCoord(end, gameState)) {
    return false;
  }

  if (!(start[0] === end[0] || start[1] === end[1])) {
    return false;
  }

  // Check the path between start and end for any obstacles or bridge count violations
  const isHorizontal = start[1] === end[1];
  const [startX, startY] = start;
  const [endX, endY] = end;

  const incrementX = isHorizontal ? (startX < endX ? 1 : -1) : 0;
  const incrementY = isHorizontal ?  0 : (startY < endY ? 1 : -1);

  for (
    let x = startX + incrementX, y = startY + incrementY;
    x !== endX || y !== endY;
    x += incrementX, y += incrementY
  ) {
    const cell = gameState.grid[x][y];

    // Check for an island in the path
    if (cell.cellType === "Island") {
      return false;
    }

    // Check for existing bridges in the path
    if (cell.cellType === "Bridge") {
      if (cell.direction !== (isHorizontal ? "horizontal" : "vertical")) {
        return false;
      }

      if (cell.bridgeCount + bridge > MAX_BRIDGE_SIZE) {
        return false;
      }
    }
  }
  return true;
}