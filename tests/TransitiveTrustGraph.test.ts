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
    graph.addEdge("A", "B", 0.5);
    const edges = graph.getEdges();
    expect(edges).toContainEqual({ source: "A", target: "B", weight: 0.5 });
  });

  test("computeTrustScore calculates correct trust score", () => {
    graph.addEdge("A", "B", 0.6);
    graph.addEdge("B", "C", 0.4);
    graph.addEdge("C", "D", 0.5);
    graph.addEdge("A", "C", 0.5);

    const score = graph.computeTrustScore("A", "D");
    expect(score).toBe(0.27);
  });

  test("addNode throws error for invalid input", () => {
    expect(() => graph.addNode("")).toThrow("Node must be a non-empty string");
  });

  test("addEdge throws error for invalid weight", () => {
    expect(() => graph.addEdge("A", "B", 1.5)).toThrow(
      "Weight must be a number between -1 and 1 (exclusive)"
    );
  });

  test("computeTrustScore throws error for non-existent nodes", () => {
    expect(() => graph.computeTrustScore("X", "Y")).toThrow(
      'Source node "X" not found in the graph'
    );
  });
});
