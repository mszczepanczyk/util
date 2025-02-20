import { EMPTY, from, Observable, Subject } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import TinyQueue from 'tinyqueue';

export type Task<T, O extends {} = {}> = {
  execute: () => Executable<T>;
} & O;

export function isTask<T>(task: unknown): task is Task<T> {
  return typeof task === 'object' && task != null && 'execute' in task;
}

export type Executable<T> =
  | Observable<T> // cold observable
  | (() => Observable<T>)
  | Promise<T>
  | (() => Promise<T>)
  | Task<T>;

export function execute<T>(executable: Executable<T>): Observable<T> {
  const result = (
    typeof executable === 'function' ? executable() : isTask(executable) ? executable.execute() : executable
  ) as Promise<T> | Observable<T>;
  if (result instanceof Promise) {
    return from(result);
  }
  return result;
}

export interface Queue<T> {
  push(element: T): void;
  pop(): T | undefined;
}

export class FifoQueue<T> implements Queue<T> {
  buffer: T[] = [];

  push(element: T): void {
    this.buffer.push(element);
  }

  pop(): T | undefined {
    return this.buffer.shift();
  }
}

export class PriorityQueue<T> {
  queue: TinyQueue<T>;

  constructor(comparator: (a: T, b: T) => number) {
    this.queue = new TinyQueue([], comparator);
  }

  push(element: T): void {
    this.queue.push(element);
  }

  pop(): T | undefined {
    return this.queue.pop();
  }
}

export type RxQueue<V, E extends Executable<V>> = {
  in$: Subject<E>;
  out$: Observable<V>;
};

export function getRxQueue<V, E extends Executable<V>>(queue: Queue<E>, maxConcurrent: number = 1): RxQueue<V, E> {
  const in$ = new Subject<E>();
  const out$ = new Subject<V>();

  in$
    .pipe(
      tap((task) => {
        queue.push(task);
      }),
      mergeMap(() => {
        const nextTask = queue.pop();
        if (nextTask) {
          return execute(nextTask);
        } else {
          return EMPTY;
        }
      }, maxConcurrent),
      tap<V>((result) => {
        out$.next(result);
      }),
    )
    .subscribe();

  return { in$, out$ };
}

export function getRxFifoQueue<V, E extends Executable<V>>(maxConcurrent: number = 1): RxQueue<V, E> {
  return getRxQueue(new FifoQueue<E>(), maxConcurrent);
}

export function getRxPriorityQueue<V, E extends Executable<V>>(
  comparator: (a: E, b: E) => number,
  maxConcurrent: number = 1,
): RxQueue<V, E> {
  return getRxQueue(new TinyQueue([], comparator), maxConcurrent);
}
