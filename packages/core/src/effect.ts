import { type ReactiveNode, removeObserver, setActiveObserver } from './tracking.ts';

const MAX_ITERATIONS = 100;

export interface EffectOptions {
  name?: string;
  onError?: (error: Error) => void;
}

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

export function effect(fn: () => void, options: EffectOptions = {}): () => void {
  const { name, onError } = options;
  const dependencies = new Set<ReactiveNode>();

  // Usar WeakRef para el contador de iteraciones por ejecución
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

    // Reset del contador por ejecución síncrona
    executionState.iterationCount++;

    if (executionState.iterationCount > MAX_ITERATIONS) {
      executionState.isDisposed = true;
      cleanupDeps();
      const infiniteLoopError = new EffectError(
        `[astro-dx] Infinite loop detected in effect${name ? ` "${name}"` : ''}. The effect has been disposed to prevent browser freeze. Check for circular dependencies or unbounded updates.`,
        name,
        new Error('Max iterations exceeded')
      );
      // Los errores de infinite loop SIEMPRE se relanzan para detener la ejecución
      throw infiniteLoopError;
    }

    cleanupDeps();

    const prevObserver = setActiveObserver(node);
    try {
      fn();
      executionState.lastError = null;
    } catch (error) {
      // Si es un error de infinite loop, relanzarlo inmediatamente
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

      // No relanzamos el error para que el effect continúe funcionando
      // pero marcamos que hubo un error
    } finally {
      setActiveObserver(prevObserver);
    }
  };

  // Ejecución inicial
  run();

  // Retornar función de cleanup
  return () => {
    if (executionState.isDisposed) return;

    executionState.isDisposed = true;
    cleanupDeps();
  };
}
