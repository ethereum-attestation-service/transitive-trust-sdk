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

  test("computeTrustScores calculates correct trust scores for specific targets", () => {
    graph.addEdge("A", "B", 0.6, 0);
    graph.addEdge("B", "C", 0.4, 0);
    graph.addEdge("C", "D", 0.5, 0);
    graph.addEdge("A", "C", 0.5, 0);

    const scores = graph.computeTrustScores("A", ["D"]);
    expect(scores["D"].positiveScore).toBeCloseTo(0.27, 2);
    expect(scores["D"].negativeScore).toBe(0);
    expect(scores["D"].netScore).toBeCloseTo(0.27, 2);
  });

  test("computeTrustScores calculates correct trust scores for all nodes", () => {
    graph.addEdge("A", "B", 0.6, 0);
    graph.addEdge("B", "C", 0.4, 0);
    graph.addEdge("C", "D", 0.5, 0);
    graph.addEdge("A", "C", 0.5, 0);

    const scores = graph.computeTrustScores("A");
    expect(scores["B"].positiveScore).toBe(0.6);
    expect(scores["C"].positiveScore).toBeCloseTo(0.54, 2);
    expect(scores["D"].positiveScore).toBeCloseTo(0.27, 2);
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

  test("computeTrustScores throws error for non-existent source node", () => {
    expect(() => graph.computeTrustScores("X")).toThrow(
      'Source node "X" not found in the graph'
    );
  });

  test("computeTrustScores throws error for non-existent target node", () => {
    graph.addNode("A");
    expect(() => graph.computeTrustScores("A", ["Y"])).toThrow(
      'Target node "Y" not found in the graph'
    );
  });

  test("computeTrustScores calculates correct trust scores with negative weights", () => {
    graph.addEdge("A", "B", 0.6, 0.2);
    graph.addEdge("B", "C", 0.4, 0.1);
    graph.addEdge("C", "D", 0.5, 0.3);
    graph.addEdge("A", "C", 0.5, 0.1);

    const scores = graph.computeTrustScores("A", ["D"]);
    expect(scores["D"].positiveScore).toBeCloseTo(0.2, 2);
    expect(scores["D"].negativeScore).toBeCloseTo(0.12, 2);
    expect(scores["D"].netScore).toBeCloseTo(0.08, 2);
  });
});
