import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearRegistry, inject, register } from "./registry.ts";

class CounterService {
  private _count = 0;

  increment(): void {
    this._count++;
  }

  get count(): number {
    return this._count;
  }
}

class GreeterService {
  greet(name: string): string {
    return `Hello, ${name}`;
  }
}

class LoggerService {
  readonly logs: string[] = [];

  log(message: string): void {
    this.logs.push(message);
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
    register([CounterService, GreeterService, LoggerService]);
    expect(inject(CounterService)).toBeInstanceOf(CounterService);
    expect(inject(GreeterService)).toBeInstanceOf(GreeterService);
    expect(inject(LoggerService)).toBeInstanceOf(LoggerService);
  });

  it("calling register() twice with the same class is a no-op", () => {
    register(CounterService);
    const first = inject(CounterService);
    first.increment();

    register(CounterService);
    const second = inject(CounterService);

    expect(second.count).toBe(1);
    expect(first).toBe(second);
  });

  it("register() with empty array does not throw", () => {
    expect(() => register([])).not.toThrow();
  });
});

describe("inject()", () => {
  it("returns the same instance on every call (singleton)", () => {
    register(CounterService);
    const a = inject(CounterService);
    const b = inject(CounterService);
    expect(a).toBe(b);
  });

  it("preserves state across inject() calls", () => {
    register(CounterService);
    inject(CounterService).increment();
    inject(CounterService).increment();
    expect(inject(CounterService).count).toBe(2);
  });

  it("returns correctly typed instance without casting", () => {
    register(GreeterService);
    const greeter = inject(GreeterService);
    expect(greeter.greet("Anders")).toBe("Hello, Anders");
  });

  it("lazy-registers and warns when service not pre-registered", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const counter = inject(CounterService);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("CounterService"),
    );
    expect(counter).toBeInstanceOf(CounterService);

    warn.mockRestore();
  });

  it("lazy-registered service is a singleton on subsequent calls", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const a = inject(CounterService);
    const b = inject(CounterService);

    expect(a).toBe(b);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("different service classes return different instances", () => {
    register([CounterService, LoggerService]);
    const counter = inject(CounterService);
    const logger = inject(LoggerService);
    expect(counter).not.toBe(logger);
  });
});

describe("clearRegistry()", () => {
  it("removes all registered services", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    register(CounterService);
    inject(CounterService).increment();

    clearRegistry();

    const fresh = inject(CounterService);
    expect(fresh.count).toBe(0);
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it("calling clearRegistry() on empty registry does not throw", () => {
    expect(() => clearRegistry()).not.toThrow();
  });
});
