import { TransitiveTrustGraph } from "../src/TransitiveTrustGraph";

describe("TransitiveTrustGraph.findTrustPaths", () => {
  let graph: TransitiveTrustGraph;

  beforeEach(() => {
    graph = new TransitiveTrustGraph();
  });

  test("returns empty array when source equals target", () => {
    graph.addNode("A");
    const paths = graph.findTrustPaths("A", "A");
    expect(paths).toEqual([]);
  });

  test("throws error when source node not found", () => {
    graph.addNode("B");
    expect(() => graph.findTrustPaths("A", "B")).toThrow(
      'Source node "A" not found in the graph'
    );
  });

  test("throws error when target node not found", () => {
    graph.addNode("A");
    expect(() => graph.findTrustPaths("A", "B")).toThrow(
      'Target node "B" not found in the graph'
    );
  });

  test("finds single direct path", () => {
    graph.addEdge("A", "B", 0.8, 0.1);
    const paths = graph.findTrustPaths("A", "B");

    expect(paths).toHaveLength(1);
    expect(paths[0]).toMatchObject({
      source: "A",
      target: "B",
      path: ["A", "B"],
      length: 1,
      totalPositiveScore: 0.8,
      totalNegativeScore: 0.1,
    });
    expect(paths[0].totalNetScore).toBeCloseTo(0.7, 10);
    expect(paths[0].steps).toHaveLength(1);
    expect(paths[0].steps[0]).toMatchObject({
      from: "A",
      to: "B",
      positiveWeight: 0.8,
      negativeWeight: 0.1,
    });
  });

  test("finds multiple paths and sorts by net score", () => {
    // Create a diamond-shaped graph
    graph.addEdge("A", "B", 0.9, 0.1);
    graph.addEdge("A", "C", 0.7, 0.2);
    graph.addEdge("B", "D", 0.8, 0.1);
    graph.addEdge("C", "D", 0.9, 0.05);

    const paths = graph.findTrustPaths("A", "D");

    expect(paths).toHaveLength(2);
    // Path A->B->D: 0.9 * 0.8 = 0.72 positive, 0.1 + 0.8 * 0.1 = 0.18 negative, net = 0.54
    // Path A->C->D: 0.7 * 0.9 = 0.63 positive, 0.2 + 0.5 * 0.05 = 0.225 negative, net = 0.405
    expect(paths[0].path).toEqual(["A", "B", "D"]);
    expect(paths[0].totalNetScore).toBeCloseTo(0.54, 2);
    expect(paths[1].path).toEqual(["A", "C", "D"]);
    expect(paths[1].totalNetScore).toBeCloseTo(0.405, 2);
  });

  test("respects maxPaths option", () => {
    // Create multiple paths
    graph.addEdge("A", "B", 0.8, 0.1);
    graph.addEdge("A", "C", 0.7, 0.2);
    graph.addEdge("A", "D", 0.6, 0.1);
    graph.addEdge("B", "E", 0.9, 0.05);
    graph.addEdge("C", "E", 0.8, 0.1);
    graph.addEdge("D", "E", 0.7, 0.15);

    const paths = graph.findTrustPaths("A", "E", { maxPaths: 2 });

    expect(paths).toHaveLength(2);
    // Should return the two highest scoring paths
  });

  test("respects maxHops option", () => {
    // Create a long chain
    graph.addEdge("A", "B", 0.9, 0.05);
    graph.addEdge("B", "C", 0.9, 0.05);
    graph.addEdge("C", "D", 0.9, 0.05);
    graph.addEdge("D", "E", 0.9, 0.05);

    const paths1 = graph.findTrustPaths("A", "E", { maxHops: 3 });
    expect(paths1).toHaveLength(0); // Can't reach E in 3 hops

    const paths2 = graph.findTrustPaths("A", "E", { maxHops: 4 });
    expect(paths2).toHaveLength(1); // Can reach E in 4 hops
  });

  test("respects minIntermediateTrust option", () => {
    graph.addEdge("A", "B", 0.8, 0.1);
    graph.addEdge("B", "C", 0.8, 0.1);

    // Path A->B->C: positive = 0.8 * 0.8 = 0.64, negative = 0.1 + 0.7 * 0.1 = 0.17, net = 0.47
    const paths1 = graph.findTrustPaths("A", "C", { minIntermediateTrust: 0.4 });
    expect(paths1).toHaveLength(1);

    const paths2 = graph.findTrustPaths("A", "C", { minIntermediateTrust: 0.5 });
    expect(paths2).toHaveLength(0); // Path score too low at intermediate node
  });

  test("respects minFinalTrust option", () => {
    graph.addEdge("A", "B", 0.9, 0.1);
    graph.addEdge("B", "C", 0.6, 0.3);

    // Path score at C: pos=0.54, neg=0.34, net=0.20
    const paths1 = graph.findTrustPaths("A", "C", { minFinalTrust: 0.1 });
    expect(paths1).toHaveLength(1);

    const paths2 = graph.findTrustPaths("A", "C", { minFinalTrust: 0.3 });
    expect(paths2).toHaveLength(0); // Final score (0.20) is below 0.3
  });

  test("handles cycles correctly", () => {
    // Create a graph with cycles
    graph.addEdge("A", "B", 0.8, 0.1);
    graph.addEdge("B", "C", 0.7, 0.1);
    graph.addEdge("C", "A", 0.6, 0.2); // Creates cycle
    graph.addEdge("C", "D", 0.9, 0.05);

    const paths = graph.findTrustPaths("A", "D");

    // Should find path A->B->C->D without infinite loop
    expect(paths).toHaveLength(1);
    expect(paths[0].path).toEqual(["A", "B", "C", "D"]);
    expect(paths[0].length).toBe(3);
  });

  test("handles negative trust accumulation correctly", () => {
    // Path with high negative trust
    graph.addEdge("A", "B", 0.9, 0.8);
    graph.addEdge("B", "C", 0.9, 0.1);

    const paths = graph.findTrustPaths("A", "C");

    expect(paths).toHaveLength(1);
    const path = paths[0];
    // First edge: positive = 0.9, negative = 0.8, net = 0.1
    // Second edge: positive = 0.9 * 0.9 = 0.81, negative = 0.8 + 0.1 * 0.1 = 0.81, net = 0
    expect(path.totalPositiveScore).toBeCloseTo(0.81, 2);
    expect(path.totalNegativeScore).toBeCloseTo(0.81, 2);
    expect(path.totalNetScore).toBeCloseTo(0, 2);
  });

  test("stops propagation when net score becomes zero", () => {
    // Create a path where trust drops to zero midway
    graph.addEdge("A", "B", 0.5, 0.5); // Net score = 0
    graph.addEdge("B", "C", 0.9, 0.1);

    const paths = graph.findTrustPaths("A", "C");

    expect(paths).toHaveLength(0); // No paths because trust is zero at B
  });

  test("finds complex paths in larger graph", () => {
    // Create a more complex graph
    graph.addEdge("A", "B", 0.9, 0.1);
    graph.addEdge("A", "C", 0.7, 0.2);
    graph.addEdge("B", "D", 0.8, 0.15);
    graph.addEdge("C", "D", 0.6, 0.1);
    graph.addEdge("B", "E", 0.7, 0.2);
    graph.addEdge("D", "F", 0.9, 0.05);
    graph.addEdge("E", "F", 0.8, 0.1);

    const paths = graph.findTrustPaths("A", "F", { maxPaths: 5 });

    expect(paths.length).toBeGreaterThan(0);
    expect(paths.length).toBeLessThanOrEqual(4); // Maximum possible paths

    // Verify all paths are properly formed
    paths.forEach((path) => {
      expect(path.source).toBe("A");
      expect(path.target).toBe("F");
      expect(path.path[0]).toBe("A");
      expect(path.path[path.path.length - 1]).toBe("F");
      expect(path.steps.length).toBe(path.length);
      expect(path.totalNetScore).toBe(
        path.totalPositiveScore - path.totalNegativeScore
      );
    });

    // Verify paths are sorted by net score
    for (let i = 1; i < paths.length; i++) {
      expect(paths[i - 1].totalNetScore).toBeGreaterThanOrEqual(
        paths[i].totalNetScore
      );
    }
  });

  test("returns empty array when no paths exist", () => {
    graph.addNode("A");
    graph.addNode("B");
    // No edges between A and B

    const paths = graph.findTrustPaths("A", "B");
    expect(paths).toEqual([]);
  });

  test("path step details are accurate", () => {
    graph.addEdge("A", "B", 0.8, 0.2);
    graph.addEdge("B", "C", 0.7, 0.1);

    const paths = graph.findTrustPaths("A", "C");
    expect(paths).toHaveLength(1);

    const steps = paths[0].steps;
    expect(steps).toHaveLength(2);

    // First step
    expect(steps[0]).toMatchObject({
      from: "A",
      to: "B",
      positiveWeight: 0.8,
      negativeWeight: 0.2,
      cumulativePositiveScore: 0.8,
      cumulativeNegativeScore: 0.2,
      cumulativeNetScore: 0.6000000000000001,
    });

    // Second step
    expect(steps[1]).toMatchObject({
      from: "B",
      to: "C",
      positiveWeight: 0.7,
      negativeWeight: 0.1,
    });
    expect(steps[1].cumulativePositiveScore).toBeCloseTo(0.56, 10); // 0.8 * 0.7
    expect(steps[1].cumulativeNegativeScore).toBeCloseTo(0.26, 10); // 0.2 + 0.6 * 0.1
    expect(steps[1].cumulativeNetScore).toBeCloseTo(0.3, 10); // 0.56 - 0.26
  });

  test("README example 3: finds trust paths from Alice to Frank", () => {
    // Build the same trust network as in README example 3
    graph.addEdge("Alice", "Bob", 0.9, 0.1);
    graph.addEdge("Alice", "Charlie", 0.7, 0.2);
    graph.addEdge("Bob", "David", 0.8, 0.1);
    graph.addEdge("Charlie", "David", 0.6, 0.3);
    graph.addEdge("Bob", "Eve", 0.7, 0.2);
    graph.addEdge("Eve", "Frank", 0.9, 0.05);
    graph.addEdge("David", "Frank", 0.8, 0.1);

    // Find trust paths from Alice to Frank with minimum trust score of 0.2
    const paths = graph.findTrustPaths("Alice", "Frank", {
      maxPaths: 5,
      maxHops: 4,
      minIntermediateTrust: 0.2
    });

    // Should find exactly 2 paths
    expect(paths).toHaveLength(2);

    // Path 1: Alice → Bob → David → Frank
    expect(paths[0].path).toEqual(["Alice", "Bob", "David", "Frank"]);
    expect(paths[0].totalNetScore).toBeCloseTo(0.342, 3);
    expect(paths[0].steps).toHaveLength(3);
    expect(paths[0].steps[0]).toMatchObject({
      from: "Alice",
      to: "Bob",
      positiveWeight: 0.9,
      negativeWeight: 0.1
    });
    expect(paths[0].steps[1]).toMatchObject({
      from: "Bob",
      to: "David",
      positiveWeight: 0.8,
      negativeWeight: 0.1
    });
    expect(paths[0].steps[2]).toMatchObject({
      from: "David",
      to: "Frank",
      positiveWeight: 0.8,
      negativeWeight: 0.1
    });

    // Path 2: Alice → Bob → Eve → Frank
    expect(paths[1].path).toEqual(["Alice", "Bob", "Eve", "Frank"]);
    expect(paths[1].totalNetScore).toBeCloseTo(0.289, 3);
    expect(paths[1].steps).toHaveLength(3);
    expect(paths[1].steps[0]).toMatchObject({
      from: "Alice",
      to: "Bob",
      positiveWeight: 0.9,
      negativeWeight: 0.1
    });
    expect(paths[1].steps[1]).toMatchObject({
      from: "Bob",
      to: "Eve",
      positiveWeight: 0.7,
      negativeWeight: 0.2
    });
    expect(paths[1].steps[2]).toMatchObject({
      from: "Eve",
      to: "Frank",
      positiveWeight: 0.9,
      negativeWeight: 0.05
    });
  });
});
