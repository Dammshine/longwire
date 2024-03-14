import { Coord, GameState, IslandCell, MAX_BRIDGE_SIZE } from "./gameModel";

export type NodeId = string;

export interface Node {
  id: NodeId;
  weight: number;
}

export interface Edge {
  start: NodeId;
  end: NodeId;
  maxWeight: number;
}
const coordToId = (coord: Coord): string => {
  return `${coord[0]},${coord[1]}`;
};
export class Graph {
  nodes: Map<NodeId, Node>;
  adjacencyList: Map<NodeId, Edge[]>;

  constructor() {
    this.nodes = new Map();
    this.adjacencyList = new Map();
  }

  addNode(node: Node): void {
    this.nodes.set(node.id, node);
    this.adjacencyList.set(node.id, []);
  }

  addEdge(edge: Edge): void {
    if (!this.adjacencyList.get(edge.start)) {
      throw new Error(`No node found with id ${edge.start}`);
    }
    if (!this.adjacencyList.get(edge.end)) {
      throw new Error(`No node found with id ${edge.end}`);
    }
    this.adjacencyList.get(edge.start).push(edge);
    this.adjacencyList
      .get(edge.end)
      .push({ ...edge, start: edge.end, end: edge.start });
  }
}

export function parseGameStateToGraph(gameState: GameState): Graph {
  const graph = new Graph();

  // Add nodes (islands) to the graph
  gameState.grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.cellType === "Island") {
        graph.addNode({
          id: coordToId(cell.coord),
          weight: cell.requestBridgeCount,
        });
      }
    });
  });

  const addEdgeBetweenIslands = (
    start: IslandCell,
    end: IslandCell,
    edgeWeight: number
  ) => {
    const startId = coordToId(start.coord);
    const endId = coordToId(end.coord);
    graph.addEdge({
      start: startId,
      end: endId,
      maxWeight: edgeWeight,
    });
  };

  // Add edges
  // Horizontal wise
  for (let i = 0; i < gameState.grid.length; i++) {
    // Queue for each row
    let queue: IslandCell[] = [];
    for (let j = 0; j < gameState.grid[0].length; j++) {
      let inspectCell = gameState.grid[i][j];
      if (inspectCell.cellType === "Island") {
        queue.push(inspectCell);
      }
    }

    for (let j = 0; j < queue.length - 1; j++) {
      let start = queue[j];
      let end = queue[j + 1];

      // Check if there's a bridge between start and end
      let flag = true;
      let edgeWeight = 3;
      for (let k = start.coord[1] + 1; k < end.coord[1]; k++) {
        let inspectCell = gameState.grid[i][k];
        if (
          inspectCell.cellType === "Bridge" &&
          inspectCell.direction === "vertical"
        ) {
          flag = false;
          break;
        }

        if (
          inspectCell.cellType === "Bridge" &&
          inspectCell.bridgeCount >= MAX_BRIDGE_SIZE
        ) {
          flag = false;
          break;
        }

        if (inspectCell.cellType === "Bridge") {
          edgeWeight = Math.min(
            edgeWeight,
            MAX_BRIDGE_SIZE - inspectCell.bridgeCount
          );
        }
      }

      if (flag) {
        addEdgeBetweenIslands(
          start,
          end,
          Math.min(
            edgeWeight,
            Math.min(start.requestBridgeCount, end.requestBridgeCount)
          )
        );
      }
    }
  }

  // Vertical wise
  for (let colIndex = 0; colIndex < gameState.grid[0].length; colIndex++) {
    // Queue for each column
    let queue: IslandCell[] = [];
    for (let rowIndex = 0; rowIndex < gameState.grid.length; rowIndex++) {
      let inspectCell = gameState.grid[rowIndex][colIndex];
      if (inspectCell.cellType === "Island") {
        queue.push(inspectCell);
      }
    }

    // Process potential vertical edges between islands
    for (let j = 0; j < queue.length - 1; j++) {
      let start = queue[j];
      let end = queue[j + 1];

      let flag = true;
      let edgeWeight = MAX_BRIDGE_SIZE;
      for (let k = start.coord[0] + 1; k < end.coord[0]; k++) {
        let inspectCell = gameState.grid[k][colIndex];

        if (
          inspectCell.cellType === "Bridge" &&
          inspectCell.direction === "horizontal"
        ) {
          flag = false;
          break;
        }

        if (inspectCell.cellType === "Bridge") {
          edgeWeight = Math.min(
            edgeWeight,
            MAX_BRIDGE_SIZE - inspectCell.bridgeCount
          );
        }
      }

      if (flag) {
        addEdgeBetweenIslands(
          start,
          end,
          Math.min(
            edgeWeight,
            Math.min(start.requestBridgeCount, end.requestBridgeCount)
          )
        );
      }
    }
  }
  return graph;
}
