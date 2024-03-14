import { Coord, GameBoard, Operation } from "../common/gameModel";
import { Graph, Edge, parseGameStateToGraph } from "../common/graph"
import { AgentBase } from "../agent/agent";

export class RecursiveChoiceAgent implements AgentBase {
  private choiceHistory: Map<string, number>;
  private currentChoiceIndex: number;

  constructor() {
    this.choiceHistory = new Map<string, number>();
    this.currentChoiceIndex = 0;
  }

  makeMove(gameBoard: GameBoard): Operation[] {
    const gameState = gameBoard.currentState;
    const gameStateString = JSON.stringify(gameState); // Unique string representation of the game state
    const graph = parseGameStateToGraph(gameState);
    let edges = this.getAllEdges(graph);

    if (edges.length === 0) {
      return []; // No available moves
    }

    // Sort edges based on a certain criteria (e.g., by distance, or by some heuristic)
    edges = this.sortEdges(edges);

    // Check if this game state has been encountered before
    if (this.choiceHistory.has(gameStateString)) {
      this.currentChoiceIndex = this.choiceHistory.get(gameStateString)!;
      // Increment choice index for the next time
      this.choiceHistory.set(gameStateString, this.currentChoiceIndex + 1);
    } else {
      this.choiceHistory.set(gameStateString, 0);
      this.currentChoiceIndex = 0;
    }

    if (this.currentChoiceIndex >= edges.length) {
      // All options explored for this state
      return [];
    }

    // Select the edge based on the current choice index
    const selectedEdge = edges[this.currentChoiceIndex];
    return [this.edgeToOperation(selectedEdge)];
  }

  private getAllEdges(graph: Graph): Edge[] {
    let edges: Edge[] = [];
    for (const [nodeId, nodeEdges] of graph.adjacencyList) {
      edges = edges.concat(nodeEdges);
    }
    return edges;
  }

  private sortEdges(edges: Edge[]): Edge[] {
    return edges.sort(/* sorting function here */);
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
