import type { Signal } from "./signal.ts";
import { startTracking, stopTracking } from "./tracking.ts";

export function effect(fn: () => void): () => void {
  const trackedAtoms = new Set<Signal<unknown>["_atom"]>();
  startTracking(trackedAtoms);
  fn();
  stopTracking();

  const unsubscribers: Array<() => void> = [];
  for (const dep of trackedAtoms) {
    const unsub = dep.subscribe(() => fn());
    unsubscribers.push(unsub);
  }

  return () => {
    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }
  };
}
