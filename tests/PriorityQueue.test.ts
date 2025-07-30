import { PriorityQueue } from "../src/PriorityQueue";

describe("PriorityQueue", () => {
  let pq: PriorityQueue<string>;

  beforeEach(() => {
    pq = new PriorityQueue<string>();
  });

  test("insert and extractMax work correctly", () => {
    pq.insert("A", 5);
    pq.insert("B", 10);
    pq.insert("C", 3);

    expect(pq.extractMax()).toEqual({ key: "B", priority: 10 });
    expect(pq.extractMax()).toEqual({ key: "A", priority: 5 });
    expect(pq.extractMax()).toEqual({ key: "C", priority: 3 });
    expect(pq.extractMax()).toBeNull();
  });

  test("isEmpty returns correct values", () => {
    expect(pq.isEmpty()).toBe(true);
    pq.insert("A", 5);
    expect(pq.isEmpty()).toBe(false);
    pq.extractMax();
    expect(pq.isEmpty()).toBe(true);
  });

  test("heapifyDown handles left and right child comparisons", () => {
    // This test ensures both left and right child branches are covered
    pq.insert("A", 10);
    pq.insert("B", 5);
    pq.insert("C", 8);
    pq.insert("D", 3);
    pq.insert("E", 7);
    pq.insert("F", 6);
    pq.insert("G", 9);

    // Extract max to trigger heapifyDown with various scenarios
    const results = [];
    while (!pq.isEmpty()) {
      results.push(pq.extractMax()!.priority);
    }

    // Should be in descending order
    expect(results).toEqual([10, 9, 8, 7, 6, 5, 3]);
  });

  test("updatePriority increases priority and triggers heapifyUp", () => {
    pq.insert("A", 5);
    pq.insert("B", 10);
    pq.insert("C", 3);
    pq.insert("D", 7);

    pq.updatePriority("C", 12);

    expect(pq.extractMax()).toEqual({ key: "C", priority: 12 });
    expect(pq.extractMax()).toEqual({ key: "B", priority: 10 });
  });

  test("updatePriority decreases priority and triggers heapifyDown", () => {
    pq.insert("A", 5);
    pq.insert("B", 10);
    pq.insert("C", 8);
    pq.insert("D", 7);
    pq.insert("E", 6);

    pq.updatePriority("B", 2);

    const results = [];
    while (!pq.isEmpty()) {
      const item = pq.extractMax();
      if (item) results.push({ key: item.key, priority: item.priority });
    }

    expect(results[0]).toEqual({ key: "C", priority: 8 });
    expect(results[results.length - 1]).toEqual({ key: "B", priority: 2 });
  });

  test("updatePriority does nothing for non-existent key", () => {
    pq.insert("A", 5);
    pq.insert("B", 10);

    pq.updatePriority("C", 15);

    expect(pq.extractMax()).toEqual({ key: "B", priority: 10 });
    expect(pq.extractMax()).toEqual({ key: "A", priority: 5 });
    expect(pq.extractMax()).toBeNull();
  });

  test("extractMax handles single element correctly", () => {
    pq.insert("A", 5);
    expect(pq.extractMax()).toEqual({ key: "A", priority: 5 });
    expect(pq.isEmpty()).toBe(true);
  });

  test("complex heap operations maintain heap property", () => {
    // This test ensures recursive heapifyDown is triggered
    for (let i = 20; i >= 1; i--) {
      pq.insert(`Node${i}`, i);
    }

    const extracted = [];
    for (let i = 0; i < 10; i++) {
      const item = pq.extractMax();
      if (item) extracted.push(item.priority);
    }

    // First 10 should be 20, 19, 18, ..., 11
    expect(extracted).toEqual([20, 19, 18, 17, 16, 15, 14, 13, 12, 11]);
  });

  test("peek returns max without removing it", () => {
    pq.insert("A", 5);
    pq.insert("B", 10);
    pq.insert("C", 3);

    expect(pq.peek()).toEqual({ key: "B", priority: 10 });
    expect(pq.peek()).toEqual({ key: "B", priority: 10 }); // Still there
    expect(pq.extractMax()).toEqual({ key: "B", priority: 10 });
    expect(pq.peek()).toEqual({ key: "A", priority: 5 }); // Now A is max
  });

  test("peek returns null for empty queue", () => {
    expect(pq.peek()).toBeNull();
  });

  test("contains method works correctly", () => {
    expect(pq.contains("A")).toBe(false);
    pq.insert("A", 5);
    expect(pq.contains("A")).toBe(true);
    pq.extractMax();
    expect(pq.contains("A")).toBe(false);
  });

  test("performance: updatePriority with large dataset", () => {
    const n = 10000;
    const startInsert = Date.now();
    
    // Insert n elements
    for (let i = 0; i < n; i++) {
      pq.insert(`Node${i}`, i);
    }
    const insertTime = Date.now() - startInsert;
    
    // Update priorities for half the elements
    const startUpdate = Date.now();
    for (let i = 0; i < n / 2; i++) {
      pq.updatePriority(`Node${i}`, n + i);
    }
    const updateTime = Date.now() - startUpdate;
    
    // Verify correctness - top elements should be the updated ones
    const top5 = [];
    for (let i = 0; i < 5; i++) {
      const item = pq.extractMax();
      if (item) top5.push(item.key);
    }
    
    expect(top5).toEqual([
      `Node${n/2 - 1}`,
      `Node${n/2 - 2}`,
      `Node${n/2 - 3}`,
      `Node${n/2 - 4}`,
      `Node${n/2 - 5}`
    ]);
    
    // Performance assertions - updates should be fast
    expect(updateTime).toBeLessThan(insertTime * 2); // Updates shouldn't be much slower than inserts
  });
});