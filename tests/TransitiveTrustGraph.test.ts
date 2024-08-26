import { TransitiveTrustGraph } from "../src/TransitiveTrustGraph";

describe("TransitiveTrustGraph", () => {
  let graph: TransitiveTrustGraph;

  beforeEach(() => {
    graph = new TransitiveTrustGraph();
  });

  test("addNode adds a node to the graph", () => {
    graph.addNode("A");
    expect(graph.getNodes()).toContain("A");
  });

  test("addEdge adds an edge to the graph", () => {
    graph.addEdge("A", "B", 0.5, 0.1);
    const edges = graph.getEdges();
    expect(edges).toContainEqual({
      source: "A",
      target: "B",
      positiveWeight: 0.5,
      negativeWeight: 0.1,
    });
  });

  test("computeTrustScore calculates correct trust score", () => {
    graph.addEdge("A", "B", 0.6, 0);
    graph.addEdge("B", "C", 0.4, 0);
    graph.addEdge("C", "D", 0.5, 0);
    graph.addEdge("A", "C", 0.5, 0);

    const score = graph.computeTrustScores("A", "D");
    expect(score.positiveScore).toBe(0.27);
    expect(score.negativeScore).toBe(0);
  });

  test("addNode throws error for invalid input", () => {
    expect(() => graph.addNode("")).toThrow("Node must be a non-empty string");
  });

  test("addEdge throws error for invalid weights", () => {
    expect(() => graph.addEdge("A", "B", 1.5, 0.5)).toThrow(
      "Positive weight must be a number between 0 and 1 (inclusive)"
    );
    expect(() => graph.addEdge("A", "B", 0.5, -0.1)).toThrow(
      "Negative weight must be a number between 0 and 1 (inclusive)"
    );
  });

  test("computeTrustScore throws error for non-existent nodes", () => {
    expect(() => graph.computeTrustScores("X", "Y")).toThrow(
      'Source node "X" not found in the graph'
    );
  });

  test("computeTrustScore calculates correct trust score with negative weights", () => {
    graph.addEdge("A", "B", 0.6, 0.2);
    graph.addEdge("B", "C", 0.4, 0.1);
    graph.addEdge("C", "D", 0.5, 0.3);
    graph.addEdge("A", "C", 0.5, 0.1);

    const score = graph.computeTrustScores("A", "D");
    expect(score.positiveScore).toBe(0.2);
    expect(score.negativeScore).toBe(0.12);
    expect(score.netScore).toBeCloseTo(0.08, 2);
  });
});
