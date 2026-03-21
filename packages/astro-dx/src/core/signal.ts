// packages/astro-dx/src/core/signal.ts
import { atom } from "nanostores";
import { trackAtomRead } from "./tracking.ts";

export type Signal<T> = {
  (): T;
  set(value: T): void;
  update(fn: (prev: T) => T): void;
  subscribe(fn: (value: T) => void): () => void;
  /** @internal - nanostores atom, use only as escape hatch */
  _atom: ReturnType<typeof atom<T>>;
};

export function signal<T>(initial: T): Signal<T> {
  const store = atom<T>(initial);

  const read = () => {
    trackAtomRead(store);
    return store.get();
  };
  read.set = (value: T) => store.set(value);
  read.update = (fn: (prev: T) => T) => store.set(fn(store.get()));
  read.subscribe = (fn: (value: T) => void) => store.subscribe(fn);
  read._atom = store;

  return read as Signal<T>;
}
