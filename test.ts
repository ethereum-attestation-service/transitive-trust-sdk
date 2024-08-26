import { TransitiveTrustGraph } from "./src";

const graph = new TransitiveTrustGraph();

// Add nodes and edges
// graph.addEdge("A", "B", 0.8);
// graph.addEdge("B", "C", 0.6);
// graph.addEdge("C", "D", 0.7);
// graph.addEdge("A", "D", 0.5);

// Use these
// graph.add_edge("A", "B", 0.6)
// graph.add_edge("B", "C", 0.4)
// graph.add_edge("C", "D", 0.5)
// graph.add_edge("A", "C", 0.5)

graph.addEdge("A", "B", 0.6);
graph.addEdge("B", "C", 0.4);
graph.addEdge("C", "D", 0.5);
graph.addEdge("A", "C", 0.5);

// Define source and target nodes
const sourceNode = "A";
const targetNode = "D";

// Compute trust score
const trustScore = graph.computeTrustScore(sourceNode, targetNode);
console.log(`Trust score from ${sourceNode} to ${targetNode}: ${trustScore}`);

// Get all nodes and edges
console.log("Nodes:", graph.getNodes());
console.log("Edges:", graph.getEdges());
