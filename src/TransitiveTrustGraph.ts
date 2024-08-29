import Graph from "graphology";
import {PriorityQueue} from "./PriorityQueue";

/**
 * Represents a graph for computing transitive trust scores with separate positive and negative weights.
 */
export class TransitiveTrustGraph {
  private graph: Graph;

  constructor() {
    this.graph = new Graph({type: "directed", multi: false});
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
   * @param positiveWeight The positive weight of the edge (between 0 and 1, inclusive).
   * @param negativeWeight The negative weight of the edge (between 0 and 1, inclusive).
   * @throws {Error} If the source or target is not a non-empty string, or if the weights are not between 0 and 1 (inclusive).
   */
  addEdge(
    source: string,
    target: string,
    positiveWeight: number,
    negativeWeight: number
  ): void {
    if (typeof source !== "string" || source.trim() === "") {
      throw new Error("Source must be a non-empty string");
    }
    if (typeof target !== "string" || target.trim() === "") {
      throw new Error("Target must be a non-empty string");
    }
    if (
      typeof positiveWeight !== "number" ||
      positiveWeight < 0 ||
      positiveWeight > 1
    ) {
      throw new Error(
        "Positive weight must be a number between 0 and 1 (inclusive)"
      );
    }
    if (
      typeof negativeWeight !== "number" ||
      negativeWeight < 0 ||
      negativeWeight > 1
    ) {
      throw new Error(
        "Negative weight must be a number between 0 and 1 (inclusive)"
      );
    }

    this.addNode(source);
    this.addNode(target);

    if (this.graph.hasEdge(source, target)) {
      this.graph.setEdgeAttribute(
        source,
        target,
        "positiveWeight",
        positiveWeight
      );
      this.graph.setEdgeAttribute(
        source,
        target,
        "negativeWeight",
        negativeWeight
      );
    } else {
      this.graph.addEdge(source, target, {positiveWeight, negativeWeight});
    }
  }

  /**
   * Computes the trust scores from a source node to all other nodes.
   * @param source The source node.
   * @returns A Map containing the trust scores for all nodes.
   * @throws {Error} If the source node is not found in the graph.
   */
  private computeScores(
    source: string
  ): Map<
    string,
    { positiveScore: number; negativeScore: number; netScore: number }
  > {
    if (!this.graph.hasNode(source)) {
      throw new Error(`Source node "${source}" not found in the graph`);
    }

    const pScores = new Map<string, number>();
    const nScores = new Map<string, number>();
    const inspected = new Set<string>();
    const pq = new PriorityQueue<string>();

    // Initialize scores and priority queue
    this.graph.forEachNode((node) => {
      const pScore = node === source ? 1 : 0;
      pScores.set(node, pScore);
      nScores.set(node, 0);
      pq.insert(node, pScore);
    });

    while (!pq.isEmpty()) {
      const node = pq.extractMax()!.key;
      if (inspected.has(node)) continue;
      inspected.add(node);

      const nodeScore = Math.max(pScores.get(node)! - nScores.get(node)!, 0);

      this.graph.forEachOutNeighbor(node, (neighbor) => {
        if (!inspected.has(neighbor) && pScores.get(neighbor)! - nScores.get(neighbor)! < nodeScore) {
          const positiveWeight = this.graph.getEdgeAttribute(
            node,
            neighbor,
            "positiveWeight"
          ) as number;
          const negativeWeight = this.graph.getEdgeAttribute(
            node,
            neighbor,
            "negativeWeight"
          ) as number;

          if (nodeScore > pScores.get(neighbor)!) {
            const newPScore =
              pScores.get(neighbor)! +
              (nodeScore - pScores.get(neighbor)!) * positiveWeight;
            pScores.set(neighbor, newPScore);
          }

          if (nodeScore > nScores.get(neighbor)!) {
            const newNScore =
              nScores.get(neighbor)! +
              (nodeScore - nScores.get(neighbor)!) * negativeWeight;
            nScores.set(neighbor, newNScore);
          }

          pq.updatePriority(
            neighbor,
            pScores.get(neighbor)! - nScores.get(neighbor)!
          );
        }
      });
    }

    const results = new Map<
      string,
      { positiveScore: number; negativeScore: number; netScore: number }
    >();
    this.graph.forEachNode((node) => {
      if (node !== source) {
        const positiveScore = pScores.get(node)!;
        const negativeScore = nScores.get(node)!;
        const netScore = positiveScore - negativeScore;
        results.set(node, {positiveScore, negativeScore, netScore});
      }
    });

    return results;
  }

  /**
   * Computes the trust scores between a source node and specific target nodes.
   * @param source The source node.
   * @param targets An array of target nodes. If empty, computes for all nodes.
   * @returns An object containing the trust scores for the specified target nodes or all nodes.
   * @throws {Error} If the source or any target node is not found in the graph.
   */
  computeTrustScores(
    source: string,
    targets: string[] = []
  ): {
    [target: string]: {
      positiveScore: number;
      negativeScore: number;
      netScore: number;
    };
  } {
    const allScores = this.computeScores(source);
    const results: {
      [target: string]: {
        positiveScore: number;
        negativeScore: number;
        netScore: number;
      };
    } = {};

    if (targets.length === 0) {
      // If no specific targets, return scores for all nodes
      allScores.forEach((score, node) => {
        if (node !== source) {
          results[node] = score;
        }
      });
    } else {
      // Return scores only for specified targets
      targets.forEach((target) => {
        if (!this.graph.hasNode(target)) {
          throw new Error(`Target node "${target}" not found in the graph`);
        }
        const score = allScores.get(target);
        if (score) {
          results[target] = score;
        }
      });
    }

    return results;
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
  getEdges(): {
    source: string;
    target: string;
    positiveWeight: number;
    negativeWeight: number;
  }[] {
    return this.graph.edges().map((edge) => {
      const [source, target] = this.graph.extremities(edge);
      const positiveWeight = this.graph.getEdgeAttribute(
        edge,
        "positiveWeight"
      ) as number;
      const negativeWeight = this.graph.getEdgeAttribute(
        edge,
        "negativeWeight"
      ) as number;
      return {source, target, positiveWeight, negativeWeight};
    });
  }
}
