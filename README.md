# Transitive Trust Graph

This project implements a Transitive Trust Graph system in TypeScript, allowing for the computation of trust scores between nodes in a directed graph with separate positive and negative weights on edges.

## Features

- Create a directed graph with nodes and weighted edges
- Compute trust scores between any two nodes in the graph
- Handle both positive and negative trust weights
- Efficient implementation using a priority queue for score propagation

## Installation

To use this package in your project, install it via npm:

```bash
npm install @ethereum-attestation-service/transitive-trust-sdk
```

## Usage

Here's a basic example of how to use the `TransitiveTrustGraph` class:

```typescript
import { TransitiveTrustGraph } from "@ethereum-attestation-service/transitive-trust-sdk";

const graph = new TransitiveTrustGraph();

// Add edges to the graph
graph.addEdge("A", "B", 0.6, 0.2);
graph.addEdge("B", "C", 0.4, 0.1);
graph.addEdge("C", "D", 0.5, 0.3);
graph.addEdge("A", "C", 0.5, 0.1);

// Compute trust scores
const scores = graph.computeTrustScores("A", "D");
console.log(scores);
// Output: { positiveScore: 0.2, negativeScore: 0.12, netScore: 0.08 }
```

## API Reference

### `TransitiveTrustGraph`

#### `addNode(node: string): void`

Adds a node to the graph.

#### `addEdge(source: string, target: string, positiveWeight: number, negativeWeight: number): void`

Adds an edge to the graph with separate positive and negative weights.

#### `computeTrustScores(source: string, target: string): { positiveScore: number; negativeScore: number; netScore: number }`

Computes the trust scores between two nodes, showing both positive and negative components.

#### `getNodes(): string[]`

Returns all nodes in the graph.

#### `getEdges(): { source: string; target: string; positiveWeight: number; negativeWeight: number }[]`

Returns all edges in the graph.

## Development

To set up the project for development:

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
