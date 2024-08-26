export class PriorityQueue<T> {
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
