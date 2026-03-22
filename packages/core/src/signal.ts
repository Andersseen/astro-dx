import { atom } from "nanostores";
import { trackAtomRead, untracked } from "./tracking.ts";

export type Signal<T> = {
  /** Reads the value and registers a reactive dependency. */
  (): T;
  /** Reads the current value without registering a reactive dependency. */
  peek(): T;
  set(value: T): void;
  update(fn: (prev: T) => T): void;
  subscribe(fn: (value: T) => void): () => void;
  /** @internal */
  _atom: ReturnType<typeof atom<T>>;
};

export function signal<T>(initial: T): Signal<T> {
  const store = atom<T>(initial);

  const read = (): T => {
    trackAtomRead(store);
    return store.get();
  };

  read.peek = (): T => untracked(() => store.get());
  read.set = (value: T): void => store.set(value);
  read.update = (fn: (prev: T) => T): void => store.set(fn(store.get()));
  read.subscribe = (fn: (value: T) => void): (() => void) =>
    store.subscribe(fn);
  read._atom = store;

  return read as Signal<T>;
}
