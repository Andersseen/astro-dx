import { beforeEach, describe, expect, it } from "vitest";
import {
  clearRegistry,
  createLocalRegistry,
  inject,
  register,
} from "./registry.ts";

class CounterService {
  #count = 0;

  increment(): void {
    this.#count++;
  }

  get count(): number {
    return this.#count;
  }
}

class GreeterService {
  greet(name: string): string {
    return `Hello, ${name}`;
  }
}

beforeEach(() => {
  clearRegistry();
});

describe("register()", () => {
  it("registers a single service class", () => {
    register(CounterService);
    const counter = inject(CounterService);
    expect(counter).toBeInstanceOf(CounterService);
  });

  it("registers multiple services in one call", () => {
    register([CounterService, GreeterService]);
    expect(inject(CounterService)).toBeInstanceOf(CounterService);
    expect(inject(GreeterService)).toBeInstanceOf(GreeterService);
  });
});

describe("inject()", () => {
  it("returns the same instance on every call (singleton)", () => {
    const a = inject(CounterService);
    const b = inject(CounterService);
    expect(a).toBe(b);
  });

  it("lazy-registers when service not pre-registered", () => {
    const counter = inject(CounterService);
    expect(counter).toBeInstanceOf(CounterService);
  });
});

describe("Scoped DI (Local Registry)", () => {
  it("creates isolated instances in local scope when registered", () => {
    const local = createLocalRegistry();
    local.register(CounterService);
    const globalCount = inject(CounterService);
    const localCount = local.inject(CounterService);

    globalCount.increment();
    expect(globalCount.count).toEqual(1);
    expect(localCount.count).toEqual(0);
    expect(globalCount).not.toBe(localCount);
  });

  it("falls back to parent registry if service is marked as shared", () => {
    class SharedService {
      name = "shared";
    }
    register(SharedService, { shared: true });

    const local = createLocalRegistry();
    const instance = local.inject(SharedService);

    expect(instance).toBe(inject(SharedService));
  });

  it("allows overriding parent services in local scope", () => {
    const local = createLocalRegistry();
    local.register(CounterService);

    const globalCount = inject(CounterService);
    const localCount = local.inject(CounterService);

    expect(globalCount).not.toBe(localCount);
  });

  it("is strictly isolated by default (new instance per tree node if not shared)", () => {
    class PrivateService {}
    const local = createLocalRegistry();

    const globalInstance = inject(PrivateService);
    const localInstance = local.inject(PrivateService);

    expect(globalInstance).not.toBe(localInstance);
  });

  it("uses registerShared to share service across all registries", () => {
    class TopSharedService {}
    register(TopSharedService, { shared: true });

    const local = createLocalRegistry();
    const subLocal = createLocalRegistry(local);

    const globalInst = inject(TopSharedService);
    const localInst = local.inject(TopSharedService);
    const subLocalInst = subLocal.inject(TopSharedService);

    expect(localInst).toBe(globalInst);
    expect(subLocalInst).toBe(globalInst);
  });
});
