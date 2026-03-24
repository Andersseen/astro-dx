/**
 * A service class constructor with no required arguments.
 */
type ServiceConstructor<T extends object> = new () => T;

/**
 * Registry implements scoped Dependency Injection.
 * It can have a parent registry for fallback lookups.
 */
export class Registry {
  private instances = new Map<ServiceConstructor<object>, object>();
  
  constructor(private parent?: Registry) {}

  /**
   * Registers a service constructor.
   */
  register<T extends object>(
    services: ServiceConstructor<T> | Array<ServiceConstructor<T>>,
  ): void {
    const list = Array.isArray(services) ? services : [services];
    for (const Service of list) {
      if (this.instances.has(Service as ServiceConstructor<object>)) continue;
      this.instances.set(Service as ServiceConstructor<object>, new Service());
    }
  }

  /**
   * Retrieves a service instance, falling back to parent if not found locally.
   */
  inject<T extends object>(Service: ServiceConstructor<T>): T {
    let instance = this.instances.get(Service as ServiceConstructor<object>);

    if (instance) return instance as T;

    if (this.parent) {
      return this.parent.inject(Service);
    }

    // Auto-instantiate in current registry if not found (and log warning)
    console.warn(
      `[astro-dx] inject(${Service.name}) - service was not pre-registered. ` +
        "Auto-instantiating in the current registry scope."
    );
    
    instance = new Service();
    this.instances.set(Service as ServiceConstructor<object>, instance);
    return instance as T;
  }

  clear(): void {
    this.instances.clear();
  }
}

/**
 * Default Global Registry
 */
export const GlobalRegistry = new Registry();

/**
 * Global inject helper for backward compatibility and convenience.
 */
export function inject<T extends object>(Service: ServiceConstructor<T>): T {
  return GlobalRegistry.inject(Service);
}

/**
 * Global register helper.
 */
export function register<T extends object>(
  services: ServiceConstructor<T> | Array<ServiceConstructor<T>>,
): void {
  GlobalRegistry.register(services);
}

/**
 * Creates a new local registry scope.
 */
export function createLocalRegistry(parent: Registry = GlobalRegistry): Registry {
  return new Registry(parent);
}

export function clearRegistry(): void {
  GlobalRegistry.clear();
}
