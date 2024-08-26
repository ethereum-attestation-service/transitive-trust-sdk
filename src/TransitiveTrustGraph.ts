import Graph from "graphology";
import { PriorityQueue } from "./PriorityQueue";

/**
 * Represents a graph for computing transitive trust scores.
 */
export class TransitiveTrustGraph {
  private graph: Graph;

  constructor() {
    this.graph = new Graph({ type: "directed", multi: false });
  }

  /**
   * Adds a node to the graph.
   * @param node The node to add.
   * @throws {Error} If the node is not a non-empty string.
   */
  addNode(node: string): void {
    if (typeof node !== "string" || node.trim() === "") {
      throw new Error("Node must be a non-empty string");
    }
    if (!this.graph.hasNode(node)) {
      this.graph.addNode(node);
    }
  }

  /**
   * Adds an edge to the graph.
   * @param source The source node.
   * @param target The target node.
   * @param weight The weight of the edge (between 0 and 1).
   * @throws {Error} If the source or target is not a non-empty string, or if the weight is not between 0 and 1.
   */
  addEdge(source: string, target: string, weight: number): void {
    if (typeof source !== "string" || source.trim() === "") {
      throw new Error("Source must be a non-empty string");
    }
    if (typeof target !== "string" || target.trim() === "") {
      throw new Error("Target must be a non-empty string");
    }
    if (typeof weight !== "number" || weight < 0 || weight > 1) {
      throw new Error("Weight must be a number between 0 and 1");
    }

    this.addNode(source);
    this.addNode(target);

    if (this.graph.hasEdge(source, target)) {
      this.graph.setEdgeAttribute(source, target, "weight", weight);
    } else {
      this.graph.addEdge(source, target, { weight });
    }
  }

  /**
   * Computes the trust score between two nodes.
   * @param source The source node.
   * @param target The target node.
   * @returns The computed trust score.
   * @throws {Error} If the source or target node is not found in the graph.
   */
  computeTrustScore(source: string, target: string): number {
    if (!this.graph.hasNode(source)) {
      throw new Error(`Source node "${source}" not found in the graph`);
    }
    if (!this.graph.hasNode(target)) {
      throw new Error(`Target node "${target}" not found in the graph`);
    }

    const scores = new Map<string, number>();
    const inspected = new Set<string>();
    const pq = new PriorityQueue<string>();

    // Initialize scores and priority queue
    this.graph.forEachNode((node) => {
      const score = node === source ? 1 : 0;
      scores.set(node, score);
      pq.insert(node, score);
    });

    while (!pq.isEmpty()) {
      const node = pq.extractMax()!.key;
      if (inspected.has(node)) continue;
      inspected.add(node);

      const nodeScore = scores.get(node)!;

      this.graph.forEachOutNeighbor(node, (neighbor) => {
        if (!inspected.has(neighbor)) {
          const weight = this.graph.getEdgeAttribute(
            node,
            neighbor,
            "weight"
          ) as number;
          const oldScore = scores.get(neighbor)!;
          const newScore = oldScore + (nodeScore - oldScore) * weight;
          if (newScore > oldScore) {
            scores.set(neighbor, newScore);
            pq.updatePriority(neighbor, newScore);
          }
        }
      });
    }

    return Math.max(scores.get(target) || 0, 0);
  }

  /**
   * Returns all nodes in the graph.
   * @returns An array of all nodes.
   */
  getNodes(): string[] {
    return this.graph.nodes();
  }

  /**
   * Returns all edges in the graph.
   * @returns An array of objects representing edges.
   */
  getEdges(): { source: string; target: string; weight: number }[] {
    return this.graph.edges().map((edge) => {
      const [source, target] = this.graph.extremities(edge);
      const weight = this.graph.getEdgeAttribute(edge, "weight") as number;
      return { source, target, weight };
    });
  }
}
