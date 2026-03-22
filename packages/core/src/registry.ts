/**
 * A service class constructor with no required arguments.
 * All services registered via register() must follow this contract.
 */
type ServiceConstructor<T extends object> = new () => T;

/**
 * Internal registry - maps constructor to singleton instance.
 * Module-level singleton guaranteed by ESM.
 */
const registry = new Map<ServiceConstructor<object>, object>();

/**
 * Registers one or more service classes as singletons.
 * Each class is instantiated once and stored in the registry.
 * Subsequent calls to register() with the same class are ignored.
 */
export function register<T extends object>(
  services: ServiceConstructor<T> | Array<ServiceConstructor<T>>,
): void {
  const list = Array.isArray(services) ? services : [services];

  for (const Service of list) {
    if (registry.has(Service as ServiceConstructor<object>)) continue;
    registry.set(Service as ServiceConstructor<object>, new Service());
  }
}

/**
 * Retrieves the singleton instance of a registered service.
 * If missing, inject() lazy-registers it and logs a warning.
 */
export function inject<T extends object>(Service: ServiceConstructor<T>): T {
  const existing = registry.get(Service as ServiceConstructor<object>);

  if (existing) {
    return existing as T;
  }

  console.warn(
    `[astro-dx] inject(${Service.name}) - service was not pre-registered. ` +
      "Add it to register([...]) in your bootstrap file for better control.",
  );

  const instance = new Service();
  registry.set(Service as ServiceConstructor<object>, instance);
  return instance;
}

/**
 * Removes all registered services from the registry.
 * Intended for tests to ensure isolation between cases.
 */
export function clearRegistry(): void {
  registry.clear();
}
