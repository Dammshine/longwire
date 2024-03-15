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
  }

  getNode(nodeId: NodeId): Node | undefined {
    return this.nodes.get(nodeId);
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

    let sortedStartId = startId;
    let sortedEndId = endId;

    // Ensure startId is always the smaller (or alphabetically first) of the two
    if (startId > endId) {
      sortedStartId = endId;
      sortedEndId = startId;
    }
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

      let weight = Math.min(
        edgeWeight,
        Math.min(start.requestBridgeCount, end.requestBridgeCount)
      );
      if (Math.abs(start.coord[1] - end.coord[1]) <= 1 || weight === 0)
        continue;

      if (flag) {
        addEdgeBetweenIslands(start, end, weight);
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
      let weight = Math.min(
        edgeWeight,
        Math.min(start.requestBridgeCount, end.requestBridgeCount)
      );
      if (Math.abs(start.coord[0] - end.coord[0]) <= 1 || weight === 0)
        continue;

      if (flag) {
        addEdgeBetweenIslands(start, end, weight);
      }
    }
  }
  return graph;
}

export function doEdgesCross(edge1: Edge, edge2: Edge, graph: Graph): boolean {
  const getCoords = (nodeId: string) => {
    return nodeId.split(',').map(Number);
  };

  // Get coordinates of the nodes (islands) for each edge
  const edge1StartCoord = getCoords(graph.getNode(edge1.start).id);
  const edge1EndCoord = getCoords(graph.getNode(edge1.end).id);
  const edge2StartCoord = getCoords(graph.getNode(edge2.start).id);
  const edge2EndCoord = getCoords(graph.getNode(edge2.end).id);

  // Check if edge1 is horizontal and edge2 is vertical or vice versa
  const edge1IsHorizontal = edge1StartCoord[0] === edge1EndCoord[0];
  const edge2IsVertical = edge2StartCoord[1] === edge2EndCoord[1];

  if (edge1IsHorizontal && edge2IsVertical) {
    return edge1StartCoord[0] >= Math.min(edge2StartCoord[1], edge2EndCoord[1]) &&
           edge1StartCoord[0] <= Math.max(edge2StartCoord[1], edge2EndCoord[1]) &&
           edge2StartCoord[0] >= Math.min(edge1StartCoord[1], edge1EndCoord[1]) &&
           edge2StartCoord[0] <= Math.max(edge1StartCoord[1], edge1EndCoord[1]);
  }

  // Swap edges and check the other combination
  const edge1IsVertical = edge1StartCoord[1] === edge1EndCoord[1];
  const edge2IsHorizontal = edge2StartCoord[0] === edge2EndCoord[0];

  if (edge1IsVertical && edge2IsHorizontal) {
    return edge2StartCoord[0] >= Math.min(edge1StartCoord[1], edge1EndCoord[1]) &&
           edge2StartCoord[0] <= Math.max(edge1StartCoord[1], edge1EndCoord[1]) &&
           edge1StartCoord[0] >= Math.min(edge2StartCoord[1], edge2EndCoord[1]) &&
           edge1StartCoord[0] <= Math.max(edge2StartCoord[1], edge2EndCoord[1]);
  }

  return false;
}
