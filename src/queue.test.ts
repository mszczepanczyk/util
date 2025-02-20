import _ from 'lodash';
import { from, lastValueFrom, take, toArray } from 'rxjs';
import { describe, expect, test, vi } from 'vitest';

import { getRxFifoQueue, getRxPriorityQueue, Task } from './queue';

describe('RxFifoQueue', () => {
  const createTask = (value: number) => vi.fn(() => Promise.resolve(value));
  test('should process tasks in fifo order', async () => {
    const queue = getRxFifoQueue();
    const n = 10;
    const tasks = _.range(1, n + 1).map((i) => createTask(i));
    from(tasks).subscribe(queue.in$);
    const results = lastValueFrom(queue.out$.pipe(take(n), toArray()));
    await expect(results).resolves.toEqual(_.range(1, n + 1));

    for (const task of tasks) {
      expect(task).toHaveBeenCalledTimes(1);
    }
  });
});

describe('RxPriorityQueue', () => {
  type TaskWithPriority = Task<number, { priority: number }>;
  const createTask = (value: number) => ({
    priority: value,
    execute: vi.fn(() => Promise.resolve(value)),
  });
  const comparator = (a: TaskWithPriority, b: TaskWithPriority) => a.priority - b.priority;
  test('should process tasks in priority order', async () => {
    const queue = getRxPriorityQueue<number, TaskWithPriority>(comparator);
    const n = 10;
    const tasks = _.chain(1)
      .range(n + 1)
      .shuffle()
      .map((i) => createTask(i))
      .value();
    from(tasks).subscribe(queue.in$);
    const results = await lastValueFrom(queue.out$.pipe(take(n), toArray()));
    expect(results).toHaveLength(n);
    const resultsMinusFirst = results.slice(1);
    await expect(resultsMinusFirst).toEqual(_.sortBy(resultsMinusFirst));
  });
});
