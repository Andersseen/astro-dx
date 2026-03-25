export interface ReactiveNode {
  version: number;
  observers: Set<ReactiveNode>;
  dependencies: Set<ReactiveNode>;
  notify(): void;
  /** Hook opcional para limpiar recursos cuando el nodo se queda sin observadores */
  onBecomeUnobserved?: () => void;
}

let activeObserver: ReactiveNode | null = null;
let trackingDisabled = 0;

export function getActiveObserver(): ReactiveNode | null {
  return trackingDisabled > 0 ? null : activeObserver;
}

export function setActiveObserver(
  node: ReactiveNode | null,
): ReactiveNode | null {
  const prev = activeObserver;
  activeObserver = node;
  return prev;
}

export function untracked<T>(fn: () => T): T {
  trackingDisabled++;
  try {
    return fn();
  } finally {
    trackingDisabled--;
  }
}

export function trackDependency(producer: ReactiveNode): void {
  const observer = getActiveObserver();
  if (observer) {
    producer.observers.add(observer);
    observer.dependencies.add(producer);
  }
}

/** * Utilidad vital para evitar fugas de memoria.
 * Elimina un observador de un productor y avisa al productor si se queda "huérfano".
 */
export function removeObserver(
  producer: ReactiveNode,
  observer: ReactiveNode,
): void {
  producer.observers.delete(observer);
  if (producer.observers.size === 0 && producer.onBecomeUnobserved) {
    producer.onBecomeUnobserved();
  }
}
