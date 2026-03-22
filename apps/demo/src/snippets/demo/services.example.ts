import { signal, computed } from "@astro-dx/core";

class CartServiceClass {
  private _items = signal<{ name: string }[]>([]);
  readonly items = this._items;
  readonly total = computed(() => this._items().length);

  add(name: string) {
    this._items.update((prev) => [...prev, { name }]);
  }

  clear() {
    this._items.set([]);
  }
}

// Shared singleton between islands
export const CartService = new CartServiceClass();
