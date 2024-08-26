# Transitive Trust SDK

A TypeScript SDK for computing transitive trust scores in a graph.

## Installation

You can install this package using npm:

```bash
npm install @ethereum-attestation-service/transitive-trust-sdk
```

## Usage

Here's a basic example of how to use the Transitive Trust SDK:

```typescript
import { TransitiveTrustGraph } from "@ethereum-attestation-service/transitive-trust-sdk";

// Create a new graph
const graph = new TransitiveTrustGraph();

// Add edges (implicitly adds nodes)
graph.addEdge("A", "B", 0.8);
graph.addEdge("B", "C", 0.6);
graph.addEdge("C", "D", 0.4);

// Compute trust score
const trustScore = graph.computeTrustScore("A", "D");
console.log(`Trust score from A to D: ${trustScore}`);
```

## API Reference

### `TransitiveTrustGraph`

The main class for creating and manipulating the trust graph.

#### Methods

- `addNode(node: string): void`: Adds a node to the graph.
- `addEdge(source: string, target: string, weight: number): void`: Adds an edge to the graph with the specified weight (-1 to 1, exclusive).
- `computeRawTrustScores(source: string, target: string): { positiveScore: number; negativeScore: number; netScore: number }`: Computes the raw trust scores between two nodes, showing both positive and negative components.
- `getNodes(): string[]`: Returns an array of all nodes in the graph.
- `getEdges(): { source: string; target: string; weight: number }[]`: Returns an array of all edges in the graph.

## Development

To set up the project for development:

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`

## License

This project is licensed under the MIT License.
