export class PriorityQueue<T> {
  private heap: { key: T; priority: number }[] = [];
  private indexMap: Map<T, number> = new Map();

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
    const keyI = this.heap[i].key;
    const keyJ = this.heap[j].key;
    
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    
    this.indexMap.set(keyI, j);
    this.indexMap.set(keyJ, i);
  }

  insert(key: T, priority: number): void {
    const index = this.heap.length;
    this.heap.push({ key, priority });
    this.indexMap.set(key, index);
    this.heapifyUp(index);
  }

  extractMax(): { key: T; priority: number } | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) {
      const max = this.heap.pop()!;
      this.indexMap.delete(max.key);
      return max;
    }

    const max = this.heap[0];
    const last = this.heap.pop()!;
    this.heap[0] = last;
    this.indexMap.delete(max.key);
    this.indexMap.set(last.key, 0);
    this.heapifyDown(0);
    return max;
  }

  peek(): { key: T; priority: number } | null {
    return this.heap.length > 0 ? this.heap[0] : null;
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
    const index = this.indexMap.get(key);
    if (index === undefined) return;

    const oldPriority = this.heap[index].priority;
    this.heap[index].priority = newPriority;

    if (newPriority > oldPriority) {
      this.heapifyUp(index);
    } else {
      this.heapifyDown(index);
    }
  }

  contains(key: T): boolean {
    return this.indexMap.has(key);
  }
}
