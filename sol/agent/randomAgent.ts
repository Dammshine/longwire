import { Coord, GameBoard, Operation } from "../common/gameModel";
import { Graph, Edge, parseGameStateToGraph } from "../common/graph"
import { AgentBase } from "../agent/agent";

export class RandomAgent implements AgentBase {
  gameBoard: GameBoard;
  initialize(gameBoard: GameBoard): void {
    this.gameBoard = gameBoard;
  }

  makeMove(): Operation[] {
    const gameState = this.gameBoard.currentState;
    const graph = parseGameStateToGraph(gameState);
    const edges = this.getAllEdges(graph);

    if (edges.length === 0) {
      return []; // No available moves
    }

    // Randomly pick an edge
    const randomEdge = edges[Math.floor(Math.random() * edges.length)];
    return [this.edgeToOperation(randomEdge)];
  }

  private getAllEdges(graph: Graph): Edge[] {
    let edges: Edge[] = [];
    for (const [nodeId, nodeEdges] of graph.adjacencyList) {
      edges = edges.concat(nodeEdges);
    }
    return edges;
  }

  private edgeToOperation(edge: Edge): Operation {
    const startCoords = edge.start.split(",").map(Number);
    const endCoords = edge.end.split(",").map(Number);

    return {
      start: startCoords as Coord,
      end: endCoords as Coord,
      bridge: 1,
    };
  }
}
