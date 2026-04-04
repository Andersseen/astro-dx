import { endPerf, logEffect, startPerf, warn } from './debug.ts';
import { type ReactiveNode, removeObserver, setActiveObserver } from './tracking.ts';

const MAX_ITERATIONS = 100;

/**
 * Options for configuring effect behavior
 */
export interface EffectOptions {
  /** Name for debugging and profiling */
  name?: string;
  /** Custom error handler. If not provided, errors are logged to console */
  onError?: (error: Error) => void;
}

/**
 * Error thrown when an effect encounters a problem during execution
 */
export class EffectError extends Error {
  constructor(
    message: string,
    public readonly effectName: string | undefined,
    public readonly originalError: Error
  ) {
    super(message);
    this.name = 'EffectError';
  }
}

/**
 * Creates a reactive effect that runs when its dependencies change.
 * Effects are used for side effects like DOM updates, logging, etc.
 *
 * @example
 * ```ts
 * const count = signal(0);
 * const dispose = effect(() => {
 *   console.log('Count changed:', count());
 * });
 * // Later: dispose();
 * ```
 *
 * @param fn - Function to run when dependencies change
 * @param options - Configuration options for the effect
 * @returns A dispose function to clean up the effect
 */
export function effect(fn: () => void, options: EffectOptions = {}): () => void {
  const { name, onError } = options;
  const dependencies = new Set<ReactiveNode>();

  const executionState = {
    iterationCount: 0,
    isDisposed: false,
    lastError: null as Error | null,
  };

  const node: ReactiveNode = {
    version: 0,
    observers: new Set(),
    dependencies,
    notify: () => {
      if (executionState.isDisposed) return;
      run();
    },
  };

  const cleanupDeps = () => {
    for (const dep of dependencies) {
      removeObserver(dep, node);
    }
    dependencies.clear();
  };

  const run = () => {
    if (executionState.isDisposed) {
      return;
    }

    executionState.iterationCount++;

    if (executionState.iterationCount > MAX_ITERATIONS) {
      executionState.isDisposed = true;
      cleanupDeps();
      const infiniteLoopError = new EffectError(
        `[astro-dx] Infinite loop detected in effect${name ? ` "${name}"` : ''}. The effect has been disposed to prevent browser freeze. Check for circular dependencies or unbounded updates.`,
        name,
        new Error('Max iterations exceeded')
      );

      throw infiniteLoopError;
    }

    cleanupDeps();

    const perfLabel = name || 'effect';
    startPerf(perfLabel);

    const prevObserver = setActiveObserver(node);
    try {
      fn();
      executionState.lastError = null;
    } catch (error) {
      if (error instanceof EffectError && error.message.includes('Infinite loop detected')) {
        throw error;
      }

      const effectError = new EffectError(
        `[astro-dx] Error in effect${name ? ` "${name}"` : ''}: ${error instanceof Error ? error.message : String(error)}`,
        name,
        error instanceof Error ? error : new Error(String(error))
      );

      executionState.lastError = effectError;

      if (onError) {
        onError(effectError);
      } else {
        console.error(effectError.message);
        if (error instanceof Error && error.stack) {
          console.error('Stack trace:', error.stack);
        }
      }
    } finally {
      setActiveObserver(prevObserver);
      const duration = endPerf(perfLabel);
      logEffect(name, dependencies.size, duration ?? undefined);
    }
  };

  run();

  // Warn if effect has no dependencies
  if (dependencies.size === 0) {
    warn(`Effect${name ? ` "${name}"` : ''} has no reactive dependencies and will never re-run`);
  }

  return () => {
    if (executionState.isDisposed) return;

    executionState.isDisposed = true;
    cleanupDeps();
  };
}
