import { computed, signal } from "@astro-dx/core";

export class CounterServiceClass {
  private _count = signal(0);
  readonly count = this._count;
  readonly double = computed(() => this._count() * 2);
  readonly isPositive = computed(() => this._count() > 0);

  increment(): void {
    this._count.update((v) => v + 1);
  }
  decrement(): void {
    this._count.update((v) => v - 1);
  }
  reset(): void {
    this._count.set(0);
  }
}
