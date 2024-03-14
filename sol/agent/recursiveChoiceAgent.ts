import { Coord, GameBoard, Operation } from "../common/gameModel";
import { Graph, Edge, parseGameStateToGraph } from "../common/graph"
import { AgentBase } from "../agent/agent";
import { exit } from "process";

export class RecursiveChoiceAgent implements AgentBase {
  private choiceHistory: Map<string, number>;
  private currentChoiceIndex: number;

  constructor() {
    this.choiceHistory = new Map<string, number>();
    this.currentChoiceIndex = 0;
  }

  makeMove(gameBoard: GameBoard): Operation[] {
    const gameState = gameBoard.currentState;
    const gameStateString = JSON.stringify(gameState);
    const graph = parseGameStateToGraph(gameState);

    // Early return strategy
    let earlyReturn = this.isValidGameState(graph);
    if (earlyReturn === false) {
      return [];
    }
    if (Array.isArray(earlyReturn)) {
      if (this.choiceHistory.has(gameStateString)) return [];
      this.choiceHistory.set(gameStateString, -1);

      return earlyReturn.map(edge => this.edgeToOperation(edge));
    }

    let edges = this.getAllEdges(graph);
    if (edges.length === 0) {
      return [];
    }

    edges = this.sortEdges(edges, graph);
    if (this.choiceHistory.has(gameStateString)) {
      this.currentChoiceIndex = this.choiceHistory.get(gameStateString)!;
      this.choiceHistory.set(gameStateString, this.currentChoiceIndex + 1);
    } else {
      this.choiceHistory.set(gameStateString, 0);
      this.currentChoiceIndex = 0;
    }

    if (this.currentChoiceIndex >= edges.length) {
      return [];
    }

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

  // TODO: Early return strategy, if found no satisfy
  private isValidGameState(graph: Graph): boolean | Edge[] {
    for (const [nodeId, node] of graph.nodes) {
      if (node.weight > 0) {
        let totalEdgeWeight = 0;
        let edges: Edge[] = [];
  
        for (const [adjNodeId, adjNodeEdges] of graph.adjacencyList) {
          for (const edge of adjNodeEdges) {
            if (edge.start === nodeId || edge.end === nodeId) {
              totalEdgeWeight += edge.maxWeight;
              edges.push(edge);
            }
          }
        }
  
        if (totalEdgeWeight < node.weight) {
          // Node's weight is greater than total edge weight
          return false;
        } else if (totalEdgeWeight === node.weight) {
          // Node's weight exactly matches total edge weight
          return edges;
        }
      }
    }
    return true;
  }


  // TODO: First optimization: Prioritize those edge only have one edge 
  //    => so that if it don't get resolved, solve other edges will make it's situation worse
  private sortEdges(edges: Edge[], graph: Graph): Edge[] {
    const nodeConnectionCounts = new Map<string, number>();
    for (const [nodeId, nodeEdges] of graph.adjacencyList) {
      nodeConnectionCounts.set(nodeId, nodeEdges.length);
    }

    return edges.sort((a, b) => {
      const aStartConnections = nodeConnectionCounts.get(a.start) || 0;
      const bStartConnections = nodeConnectionCounts.get(b.start) || 0;

      if (aStartConnections !== bStartConnections) {
        return aStartConnections - bStartConnections;
      }

      const startCompare = a.start.localeCompare(b.start);
      if (startCompare !== 0) return startCompare;
      return a.end.localeCompare(b.end);
    });
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
