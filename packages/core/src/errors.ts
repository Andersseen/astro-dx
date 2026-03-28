// Enhanced error messages with helpful tips

export class AstroDxError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly tip?: string
  ) {
    super(message);
    this.name = 'AstroDxError';
  }

  toString(): string {
    let str = `[${this.code}] ${this.message}`;
    if (this.tip) {
      str += `\n💡 Tip: ${this.tip}`;
    }
    return str;
  }
}

export function createElementNotFoundError(selector: string): AstroDxError {
  return new AstroDxError(
    `Element "${selector}" not found in the DOM`,
    'astro-dx/element-not-found',
    'Make sure your script runs after the DOM is ready, or use getElement() with optional chaining (getElement("#btn")?.on("click", handler))'
  );
}

export function createServiceNotFoundError(serviceName: string): AstroDxError {
  return new AstroDxError(
    `Service "${serviceName}" not found`,
    'astro-dx/service-not-found',
    'Did you forget to register the service? Use register([YourService]) before inject()'
  );
}

export function createInfiniteLoopError(effectName?: string): AstroDxError {
  const nameStr = effectName ? ` "${effectName}"` : '';
  return new AstroDxError(
    `Infinite loop detected in effect${nameStr}`,
    'astro-dx/infinite-loop',
    'Check for circular dependencies (effect updates a signal that triggers the same effect). Consider using peek() to read values without creating dependencies.'
  );
}

export function createMissingDependencyError(): AstroDxError {
  return new AstroDxError(
    'Effect has no reactive dependencies',
    'astro-dx/no-dependencies',
    'This effect will never re-run because it does not read any signals. If this is intentional, you can ignore this warning.'
  );
}
