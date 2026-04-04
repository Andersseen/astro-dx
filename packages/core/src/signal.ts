import { logSignal, warn } from './debug.ts';
import { type ReactiveNode, removeObserver, trackDependency, untracked } from './tracking.ts';

let signalCounter = 0;

/**
 * A reactive signal that holds a value and notifies observers when it changes.
 * @typeParam T - The type of value held by the signal
 */
export interface Signal<T> extends ReactiveNode {
  /** Read the current value (tracks dependencies when called in reactive context) */
  (): T;
  /** Read the current value without tracking dependencies */
  peek(): T;
  /** Set a new value and notify all observers */
  set(value: T): void;
  /** Update the value using a function that receives the previous value */
  update(fn: (prev: T) => T): void;
  /** Subscribe to value changes. Returns an unsubscribe function */
  subscribe(fn: (value: T) => void): () => void;
  /** Debug name for development tools */
  _debugName?: string;
}

/**
 * Creates a reactive signal that holds a value and notifies observers when it changes.
 *
 * @example
 * ```ts
 * const count = signal(0);
 * console.log(count()); // 0
 * count.set(5);
 * count.update(n => n + 1); // 6
 * ```
 *
 * @param initial - The initial value of the signal
 * @param equal - Custom equality function to determine if the value has changed (defaults to Object.is)
 * @param debugName - Optional name for debugging purposes
 * @returns A Signal instance that can be read, updated, and subscribed to
 */
export function signal<T>(
  initial: T,
  equal: (a: T, b: T) => boolean = Object.is,
  debugName?: string
): Signal<T> {
  let value = initial;
  const observers = new Set<ReactiveNode>();
  const name = debugName || `signal-${++signalCounter}`;

  const node = (() => {
    trackDependency(node);
    return value;
  }) as Signal<T>;

  node.version = 0;
  node.observers = observers;
  node.dependencies = new Set();
  node.notify = () => {};
  node._debugName = name;
  node.peek = () => value;

  node.set = (newValue: T) => {
    if (!equal(value, newValue)) {
      const oldValue = value;
      value = newValue;
      node.version++;

      logSignal(name, oldValue, newValue);

      for (const observer of [...observers]) {
        observer.notify();
      }
    } else {
      warn(`Signal "${name}" updated with the same value`, { value });
    }
  };

  node.update = (fn: (prev: T) => T) => node.set(fn(value));

  node.subscribe = (fn: (value: T) => void) => {
    let lastValue = value;

    const observer: ReactiveNode = {
      version: -1,
      observers: new Set(),
      dependencies: new Set(),
      notify: () => {
        const newValue = node.peek();
        if (!equal(lastValue, newValue)) {
          lastValue = newValue;
          untracked(() => fn(newValue));
        }
      },
    };

    observers.add(observer);
    untracked(() => fn(value));

    return () => removeObserver(node, observer);
  };

  return node;
}
