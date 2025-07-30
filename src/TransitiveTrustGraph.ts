import Graph from "graphology";
import { PriorityQueue } from "./PriorityQueue";

/**
 * Represents a single step in a trust path.
 */
export interface TrustPathStep {
  from: string;
  to: string;
  positiveWeight: number;
  negativeWeight: number;
  cumulativePositiveScore: number;
  cumulativeNegativeScore: number;
  cumulativeNetScore: number;
}

/**
 * Represents a complete trust path from source to target.
 */
export interface TrustPath {
  source: string;
  target: string;
  path: string[];
  steps: TrustPathStep[];
  totalPositiveScore: number;
  totalNegativeScore: number;
  totalNetScore: number;
  length: number;
}

/**
 * Options for finding trust paths.
 */
export interface FindTrustPathsOptions {
  maxPaths?: number;
  maxHops?: number;
  minFinalTrust?: number;
  minIntermediateTrust?: number;
}

/**
 * Represents a graph for computing transitive trust scores with separate positive and negative weights.
 */
export class TransitiveTrustGraph {
  public graph: Graph;

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
      this.graph.addEdge(source, target, { positiveWeight, negativeWeight });
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
        if (
          !inspected.has(neighbor) &&
          pScores.get(neighbor)! - nScores.get(neighbor)! < nodeScore
        ) {
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
        results.set(node, { positiveScore, negativeScore, netScore });
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
      return { source, target, positiveWeight, negativeWeight };
    });
  }

  /**
   * Finds trust paths between a source and target node.
   * @param source The source node.
   * @param target The target node.
   * @param options Options for finding paths.
   * @param options.maxPaths Maximum number of paths to return (default: 10).
   * @param options.maxHops Maximum path length (default: 6).
   * @param options.minFinalTrust Minimum trust score required at the target node (default: 0).
   * @param options.minIntermediateTrust Minimum trust score required at each intermediate node (default: 0).
   * @returns An array of trust paths sorted by net score (highest first).
   * @throws {Error} If the source or target node is not found in the graph.
   */
  findTrustPaths(
    source: string,
    target: string,
    options: FindTrustPathsOptions = {}
  ): TrustPath[] {
    if (!this.graph.hasNode(source)) {
      throw new Error(`Source node "${source}" not found in the graph`);
    }
    if (!this.graph.hasNode(target)) {
      throw new Error(`Target node "${target}" not found in the graph`);
    }
    if (source === target) {
      return [];
    }

    const {
      maxPaths = 10,
      maxHops = 6,
      minFinalTrust = 0,
      minIntermediateTrust = 0
    } = options;

    const paths: TrustPath[] = [];
    
    // DFS to find all paths
    const visited = new Set<string>();
    const currentPath: string[] = [source];
    const currentSteps: TrustPathStep[] = [];
    let currentPositiveScore = 1;
    let currentNegativeScore = 0;

    const dfs = (node: string, depth: number) => {
      if (depth > maxHops) return;
      
      if (node === target) {
        const netScore = currentPositiveScore - currentNegativeScore;
        if (netScore >= minFinalTrust) {
          paths.push({
            source,
            target,
            path: [...currentPath],
            steps: [...currentSteps],
            totalPositiveScore: currentPositiveScore,
            totalNegativeScore: currentNegativeScore,
            totalNetScore: netScore,
            length: currentPath.length - 1
          });
        }
        return;
      }

      visited.add(node);

      this.graph.forEachOutNeighbor(node, (neighbor) => {
        if (!visited.has(neighbor)) {
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

          // Calculate new scores using the trust propagation formula
          const prevPositiveScore = currentPositiveScore;
          const prevNegativeScore = currentNegativeScore;
          const prevNetScore = Math.max(prevPositiveScore - prevNegativeScore, 0);
          
          // Only propagate if current net score is positive
          if (prevNetScore > 0) {
            currentPositiveScore = prevPositiveScore * positiveWeight;
            currentNegativeScore = prevNegativeScore + prevNetScore * negativeWeight;
            
            const newNetScore = currentPositiveScore - currentNegativeScore;
            
            // Only continue if path still meets minimum trust requirement
            // For intermediate nodes, always check minIntermediateTrust
            // For target node, check both minIntermediateTrust and minFinalTrust
            const meetsIntermediateRequirement = newNetScore >= minIntermediateTrust;
            const meetsFinalRequirement = neighbor !== target || newNetScore >= minFinalTrust;
            
            if (meetsIntermediateRequirement && meetsFinalRequirement) {
              currentPath.push(neighbor);
              currentSteps.push({
                from: node,
                to: neighbor,
                positiveWeight,
                negativeWeight,
                cumulativePositiveScore: currentPositiveScore,
                cumulativeNegativeScore: currentNegativeScore,
                cumulativeNetScore: newNetScore
              });

              dfs(neighbor, depth + 1);

              currentPath.pop();
              currentSteps.pop();
            }
            
            // Restore previous scores
            currentPositiveScore = prevPositiveScore;
            currentNegativeScore = prevNegativeScore;
          }
        }
      });

      visited.delete(node);
    };

    dfs(source, 0);

    // Sort paths by net score (highest first) and return top N
    paths.sort((a, b) => b.totalNetScore - a.totalNetScore);
    return paths.slice(0, maxPaths);
  }
}
