# Transitive Trust Graph

This project implements a Transitive Trust Graph system in TypeScript, allowing for the computation of trust scores between nodes in a directed graph with separate positive and negative weights on edges.

## Features

- Create a directed graph with nodes and weighted edges
- Compute trust scores between nodes in the graph
- Handle both positive and negative trust weights
- Efficient implementation using a priority queue for score propagation

## Installation

To use this package in your project, install it via npm:

```bash
npm install @ethereum-attestation-service/transitive-trust-sdk
```

## Usage

Here are examples of how to use the `TransitiveTrustGraph` class:

### Example 1: Computing trust scores for specific targets

```typescript
import { TransitiveTrustGraph } from "@ethereum-attestation-service/transitive-trust-sdk";

const graph = new TransitiveTrustGraph();

// Add edges to the graph
graph.addEdge("A", "B", 0.6, 0.2);
graph.addEdge("B", "C", 0.4, 0.1);
graph.addEdge("C", "D", 0.5, 0.3);
graph.addEdge("A", "C", 0.5, 0.1);

// Compute trust scores for specific targets
const scores = graph.computeTrustScores("A", ["D"]);
console.log(scores);
// Output: { D: { positiveScore: 0.2, negativeScore: 0.12, netScore: 0.08 } }
```

### Example 2: Computing trust scores for the entire graph

```typescript
import { TransitiveTrustGraph } from "@ethereum-attestation-service/transitive-trust-sdk";

const graph = new TransitiveTrustGraph();

// Add edges to the graph
graph.addEdge("A", "B", 0.8, 0.1);
graph.addEdge("B", "C", 0.6, 0.2);
graph.addEdge("C", "D", 0.7, 0.3);
graph.addEdge("A", "C", 0.5, 0.1);
graph.addEdge("B", "D", 0.4, 0.1);

// Compute trust scores for the entire graph from node "A"
const allScores = graph.computeTrustScores("A");
console.log(allScores);
// Output:
// {
//   B: { positiveScore: 0.8, negativeScore: 0.1, netScore: 0.7 },
//   C: { positiveScore: 0.74, negativeScore: 0.17, netScore: 0.57 },
//   D: { positiveScore: 0.518, negativeScore: 0.219, netScore: 0.299 }
// }

// You can also get all nodes and edges in the graph
const nodes = graph.getNodes();
console.log("Nodes:", nodes);
// Output: Nodes: ["A", "B", "C", "D"]

const edges = graph.getEdges();
console.log("Edges:", edges);
// Output: Edges: [
//   { source: "A", target: "B", positiveWeight: 0.8, negativeWeight: 0.1 },
//   { source: "B", target: "C", positiveWeight: 0.6, negativeWeight: 0.2 },
//   { source: "C", target: "D", positiveWeight: 0.7, negativeWeight: 0.3 },
//   { source: "A", target: "C", positiveWeight: 0.5, negativeWeight: 0.1 },
//   { source: "B", target: "D", positiveWeight: 0.4, negativeWeight: 0.1 }
// ]
```

## API Reference

### `TransitiveTrustGraph`

The `TransitiveTrustGraph` class provides the following properties and methods:

#### Properties

- `graph: Graph` - A public property representing the underlying graph structure. It's an instance of the `Graph` class from the [graphology](https://github.com/graphology/graphology) library.

#### Methods

#### `addNode(node: string): void`

Adds a node to the graph.

- **Parameters:**
  - `node: string` - The node to add.
- **Throws:**
  - `Error` if the node is not a non-empty string.

---

#### `addEdge(source: string, target: string, positiveWeight: number, negativeWeight: number): void`

Adds an edge to the graph with separate positive and negative weights.

- **Parameters:**
  - `source: string` - The source node.
  - `target: string` - The target node.
  - `positiveWeight: number` - The positive weight of the edge (between 0 and 1, inclusive).
  - `negativeWeight: number` - The negative weight of the edge (between 0 and 1, inclusive).
- **Throws:**
  - `Error` if the source or target is not a non-empty string, or if the weights are not between 0 and 1 (inclusive).

---

#### `computeTrustScores(source: string, targets?: string[]): { [target: string]: { positiveScore: number; negativeScore: number; netScore: number } }`

Computes the trust scores between a source node and specified target nodes (or all nodes if no targets are specified).

- **Parameters:**
  - `source: string` - The source node.
  - `targets?: string[]` - Optional array of target nodes. If empty, computes for all nodes.
- **Returns:**
  - An object containing the trust scores for the specified target nodes or all nodes.
- **Throws:**
  - `Error` if the source or any target node is not found in the graph.

---

#### `getNodes(): string[]`

Returns all nodes in the graph.

- **Returns:**
  - An array of all nodes.

---

#### `getEdges(): { source: string; target: string; positiveWeight: number; negativeWeight: number }[]`

Returns all edges in the graph.

- **Returns:**
  - An array of objects representing edges, each containing:
    - `source: string` - The source node of the edge.
    - `target: string` - The target node of the edge.
    - `positiveWeight: number` - The positive weight of the edge.
    - `negativeWeight: number` - The negative weight of the edge.

## Development

To set up the project for development:

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
