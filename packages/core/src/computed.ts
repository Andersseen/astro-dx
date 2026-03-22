import {
  startTracking,
  stopTracking,
  trackAtomRead,
  untracked,
} from "./tracking.ts";
import type { AtomLike } from "./tracking.ts";

export type Computed<T> = {
  /** Reads the computed value and registers a reactive dependency. */
  (): T;
  /** Reads the computed value without registering a reactive dependency. */
  peek(): T;
  subscribe(fn: (value: T) => void): () => void;
  /** @internal */
  _atom: { subscribe: (fn: (value: T) => void) => () => void };
};

export function computed<T>(fn: () => T): Computed<T> {
  let value = undefined as unknown as T;
  let initialized = false;
  const subscribers = new Set<(value: T) => void>();
  let depSubscriptions: Array<() => void> = [];

  const recompute = (): void => {
    for (const unsub of depSubscriptions) {
      unsub();
    }
    depSubscriptions = [];

    const deps = new Set<AtomLike>();
    startTracking(deps);
    let newValue: T;
    try {
      newValue = fn();
    } finally {
      stopTracking();
    }

    for (const dep of deps) {
      let skipInitial = true;
      const unsub = dep.subscribe(() => {
        if (skipInitial) {
          skipInitial = false;
          return;
        }
        recompute();
      });
      depSubscriptions.push(unsub);
    }

    const changed = !initialized || !Object.is(value, newValue!);
    value = newValue!;
    initialized = true;

    if (changed) {
      const currentSubscribers = [...subscribers];
      for (const sub of currentSubscribers) {
        sub(value);
      }
    }
  };

  recompute();

  const read = (): T => {
    trackAtomRead(read._atom as unknown as AtomLike);
    return value;
  };

  read.peek = (): T => untracked(() => value);

  read.subscribe = (cb: (value: T) => void): (() => void) => {
    subscribers.add(cb);
    cb(value);
    return () => subscribers.delete(cb);
  };

  read._atom = {
    subscribe: (cb: (value: T) => void): (() => void) => {
      subscribers.add(cb);
      cb(value);
      return () => subscribers.delete(cb);
    },
  };

  return read as Computed<T>;
}
