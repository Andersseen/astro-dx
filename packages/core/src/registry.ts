export type ServiceConstructor<T = any> = new (...args: any[]) => T;

const SHARED_SERVICES = new Set<ServiceConstructor<any>>();

export class Registry {
  private instances: Map<ServiceConstructor<any>, any>;
  private parent?: Registry;

  constructor(parent?: Registry) {
    this.instances = new Map();
    this.parent = parent;
  }

  register(
    services: ServiceConstructor<any> | Array<ServiceConstructor<any>>,
    options: { shared?: boolean } = {},
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

  inject<T>(Service: ServiceConstructor<T>): T {
    let instance = this.instances.get(Service);
    if (instance) return instance;

    if (this.parent && SHARED_SERVICES.has(Service)) {
      return this.parent.inject(Service);
    }

    instance = new Service();
    this.instances.set(Service, instance);
    return instance;
  }

  clear(): void {
    this.instances.clear();
  }
}

export const GlobalRegistry = new Registry();

export function register(
  services: ServiceConstructor<any> | Array<ServiceConstructor<any>>,
  options?: { shared?: boolean },
): void {
  GlobalRegistry.register(services, options);
}

export function registerShared(
  services: ServiceConstructor<any> | Array<ServiceConstructor<any>>,
): void {
  GlobalRegistry.register(services, { shared: true });
}

export function inject<T>(Service: ServiceConstructor<T>): T {
  return GlobalRegistry.inject(Service);
}

export function clearRegistry(): void {
  GlobalRegistry.clear();
  SHARED_SERVICES.clear();
}

export function createLocalRegistry(
  parent: Registry = GlobalRegistry,
): Registry {
  return new Registry(parent);
}
