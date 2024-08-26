// transitive-trust-sdk.ts

class PriorityQueue<T> {
  private heap: { key: T; priority: number }[] = [];

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private leftChild(i: number): number {
    return 2 * i + 1;
  }

  private rightChild(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  insert(key: T, priority: number): void {
    this.heap.push({ key, priority });
    this.heapifyUp(this.heap.length - 1);
  }

  extractMax(): { key: T; priority: number } | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop()!;

    const max = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return max;
  }

  private heapifyUp(i: number): void {
    while (
      i > 0 &&
      this.heap[this.parent(i)].priority < this.heap[i].priority
    ) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }

  private heapifyDown(i: number): void {
    let maxIndex = i;
    const left = this.leftChild(i);
    const right = this.rightChild(i);

    if (
      left < this.heap.length &&
      this.heap[left].priority > this.heap[maxIndex].priority
    ) {
      maxIndex = left;
    }
    if (
      right < this.heap.length &&
      this.heap[right].priority > this.heap[maxIndex].priority
    ) {
      maxIndex = right;
    }

    if (i !== maxIndex) {
      this.swap(i, maxIndex);
      this.heapifyDown(maxIndex);
    }
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  updatePriority(key: T, newPriority: number): void {
    const index = this.heap.findIndex((item) => item.key === key);
    if (index === -1) return;

    const oldPriority = this.heap[index].priority;
    this.heap[index].priority = newPriority;

    if (newPriority > oldPriority) {
      this.heapifyUp(index);
    } else {
      this.heapifyDown(index);
    }
  }
}

export class TransitiveTrustGraph {
  private nodes: Set<string> = new Set();
  private edges: Map<string, { target: string; weight: number }[]> = new Map();

  addNode(node: string): void {
    this.nodes.add(node);
    if (!this.edges.has(node)) {
      this.edges.set(node, []);
    }
  }

  addEdge(source: string, target: string, weight: number): void {
    if (weight < 0 || weight > 1) {
      throw new Error("Edge weight must be between 0 and 1");
    }

    this.addNode(source);
    this.addNode(target);

    const sourceEdges = this.edges.get(source)!;
    const existingEdge = sourceEdges.find((e) => e.target === target);
    if (existingEdge) {
      existingEdge.weight = weight;
    } else {
      sourceEdges.push({ target, weight });
    }
  }

  computeTrustScore(source: string, target: string): number {
    if (!this.nodes.has(source) || !this.nodes.has(target)) {
      throw new Error("Source or target node not found in the graph");
    }

    const scores = new Map<string, number>();
    const inspected = new Set<string>();
    const pq = new PriorityQueue<string>();

    // Initialize scores and priority queue
    this.nodes.forEach((node) => {
      const score = node === source ? 1 : 0;
      scores.set(node, score);
      pq.insert(node, score);
    });

    while (!pq.isEmpty()) {
      const node = pq.extractMax()!.key;
      if (inspected.has(node)) continue;
      inspected.add(node);

      const nodeScore = scores.get(node)!;
      const neighbors = this.edges.get(node) || [];

      for (const { target: neighbor, weight } of neighbors) {
        if (!inspected.has(neighbor)) {
          const oldScore = scores.get(neighbor)!;
          const newScore = oldScore + (nodeScore - oldScore) * weight;
          if (newScore > oldScore) {
            scores.set(neighbor, newScore);
            pq.updatePriority(neighbor, newScore);
          }
        }
      }
    }

    return Math.max(scores.get(target) || 0, 0);
  }

  getNodes(): string[] {
    return Array.from(this.nodes);
  }

  getEdges(): { source: string; target: string; weight: number }[] {
    const edgeList: { source: string; target: string; weight: number }[] = [];
    this.edges.forEach((targets, source) => {
      targets.forEach(({ target, weight }) => {
        edgeList.push({ source, target, weight });
      });
    });
    return edgeList;
  }
}

const graph = new TransitiveTrustGraph();

// Add nodes and edges
// graph.addEdge("A", "B", 0.6);
// graph.addEdge("A", "C", 0.4);
// graph.addEdge("A", "D", 0.5);
// graph.addEdge("B", "C", 0.5);

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
