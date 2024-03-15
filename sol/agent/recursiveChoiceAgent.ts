import {
  Coord,
  GameBoard,
  Operation,
  hashGameState,
} from "../common/gameModel";
import {
  Graph,
  Edge,
  parseGameStateToGraph,
  doEdgesCross,
  identifyAndSortSubgraphs,
} from "../common/graph";
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
    const gameStateString = hashGameState(gameState);
    const graph = parseGameStateToGraph(gameState);

    // Early return strategy
    let earlyReturn = this.isValidGameState(graph);
    if (earlyReturn === false) {
      return [];
    }
    if (Array.isArray(earlyReturn)) {
      if (this.choiceHistory.has(gameStateString)) return [];
      this.choiceHistory.set(gameStateString, -1);

      return earlyReturn.map((edge) => this.edgeToOperation(edge));
    }

    if (this.checkSubgraphsForEarlyReturn(graph) === false) {
      return [];
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

  // TODO: IDK how many optimization it is
  private checkSubgraphsForEarlyReturn(graph: Graph): boolean {
    const subgraphs = identifyAndSortSubgraphs(graph);
    
    for (const subgraphEdges of subgraphs) {
      let totalMaxEdgeWeight = 0;
      let nodeWeights = new Map<string, number>();
  
      subgraphEdges.forEach(edge => {
        totalMaxEdgeWeight += edge.maxWeight;
        nodeWeights.set(edge.start, (nodeWeights.get(edge.start) || 0) + edge.maxWeight);
        nodeWeights.set(edge.end, (nodeWeights.get(edge.end) || 0) + edge.maxWeight);
      });
      
      if (nodeWeights.size === 2) {
        // Special case: If the subgraph consists of only two nodes
        const weights = Array.from(nodeWeights.values());
        if (weights[0] !== weights[1]) {
          return false; // Different weights, no solution
        }
      }
  
      let weightCount = 0;
      for (const [nodeId, weight] of nodeWeights) {
        const node = graph.getNode(nodeId);
        weightCount += weight;
      }

      if (weightCount > 2 * totalMaxEdgeWeight) {
        return false;
      }
    }
  
    return true;
  }
  

  // TODO: First optimization: Prioritize those edge only have one edge
  //    => so that if it don't get resolved, solve other edges will make it's situation worse
  private sortEdges(edges: Edge[], graph: Graph): Edge[] {
    // Identify subgraphs
    const subgraphs = identifyAndSortSubgraphs(graph);
  
    // Count how many edges each edge blocks
    const edgeBlockCount = new Map<Edge, number>();
    edges.forEach(edge => {
      let count = 0;
      edges.forEach(otherEdge => {
        if (edge !== otherEdge && doEdgesCross(edge, otherEdge, graph)) {
          count++;
        }
      });
      edgeBlockCount.set(edge, count);
    });
  
    // Group edges by subgraphs
    let groupedEdges = new Map<string, Edge[]>();
    subgraphs.forEach((subgraphEdges, subgraphId) => {
      subgraphEdges.forEach(edge => {
        if (groupedEdges.has(subgraphId.toString())) {
          groupedEdges.get(subgraphId.toString()).push(edge);
        } else {
          groupedEdges.set(subgraphId.toString(), [edge]);
        }
      });
    });
  
    // Sort edges within each subgraph by block count and then flatten
    let sortedEdges = [];
    Array.from(groupedEdges.values()).sort((a, b) => a.length - b.length).forEach(subgraphEdges => {
      subgraphEdges.sort((edge1, edge2) => edgeBlockCount.get(edge1) - edgeBlockCount.get(edge2));
      sortedEdges.push(...subgraphEdges);
    });
  
    return sortedEdges;
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