/**
 * Type definition for a service constructor
 */
export type ServiceConstructor<T = unknown> = new (...args: unknown[]) => T;

const SHARED_SERVICES = new Set<ServiceConstructor<unknown>>();

/**
 * Dependency injection registry for managing service instances.
 * Supports hierarchical registries with parent-child relationships and shared services.
 */
export class Registry {
  private instances: Map<ServiceConstructor<unknown>, unknown>;
  private parent?: Registry;

  /**
   * Creates a new Registry instance
   * @param parent - Optional parent registry for hierarchical DI
   */
  constructor(parent?: Registry) {
    this.instances = new Map();
    this.parent = parent;
  }

  /**
   * Register service classes with the registry
   * @param services - Single service class or array of service classes
   * @param options.shared - If true, service is shared across all registries in the hierarchy
   */
  register(
    services: ServiceConstructor<unknown> | Array<ServiceConstructor<unknown>>,
    options: { shared?: boolean } = {}
  ): void {
    const list = Array.isArray(services) ? services : [services];
    for (const Service of list) {
      if (options.shared) {
        SHARED_SERVICES.add(Service);
      }
      if (!this.instances.has(Service)) {
        this.instances.set(Service, new Service());
      }
    }
  }

  /**
   * Inject a service instance. Creates a new instance if not already registered.
   * @param Service - Service constructor to inject
   * @returns Service instance (singleton within registry scope)
   */
  inject<T>(Service: ServiceConstructor<T>): T {
    const instance = this.instances.get(Service) as T | undefined;
    if (instance) return instance;

    if (this.parent && SHARED_SERVICES.has(Service)) {
      return this.parent.inject(Service);
    }

    const newInstance = new Service();
    this.instances.set(Service as ServiceConstructor<unknown>, newInstance as unknown);
    return newInstance;
  }

  /**
   * Clear all instances from this registry (does not affect parent)
   */
  clear(): void {
    this.instances.clear();
  }
}

/**
 * Global singleton registry instance
 */
export const GlobalRegistry = new Registry();

/**
 * Register services with the global registry
 * @param services - Service class(es) to register
 * @param options.shared - If true, service is shared across all registries
 */
export function register(
  services: ServiceConstructor<unknown> | Array<ServiceConstructor<unknown>>,
  options?: { shared?: boolean }
): void {
  GlobalRegistry.register(services, options);
}

/**
 * Register services as shared across all registries in the hierarchy
 * @param services - Service class(es) to register as shared
 */
export function registerShared(
  services: ServiceConstructor<unknown> | Array<ServiceConstructor<unknown>>
): void {
  GlobalRegistry.register(services, { shared: true });
}

/**
 * Inject a service from the global registry
 * @param Service - Service constructor to inject
 * @returns Service instance
 */
export function inject<T>(Service: ServiceConstructor<T>): T {
  return GlobalRegistry.inject(Service);
}

/**
 * Clear the global registry and all shared service flags
 */
export function clearRegistry(): void {
  GlobalRegistry.clear();
  SHARED_SERVICES.clear();
}

/**
 * Create a local registry that can have its own instances while falling back to parent for shared services
 * @param parent - Parent registry (defaults to GlobalRegistry)
 * @returns New local registry instance
 */
export function createLocalRegistry(parent: Registry = GlobalRegistry): Registry {
  return new Registry(parent);
}
