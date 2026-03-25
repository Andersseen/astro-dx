import { computed, signal } from '@astro-dx/core';

type Product = { id: string; name: string; price: number };

export class ShopServiceClass {
  #cart = signal<Product[]>([]);
  #modalOpen = signal(false);

  readonly cartItems = this.#cart;
  readonly cartTotal = computed(() => this.#cart().length);
  readonly hasItems = computed(() => this.#cart().length > 0);
  readonly isModalOpen = this.#modalOpen;

  addToCart(product: Product): void {
    this.#cart.update((prev) => [...prev, product]);
  }

  clearCart(): void {
    this.#cart.set([]);
  }

  openModal(): void {
    this.#modalOpen.set(true);
  }

  closeModal(): void {
    this.#modalOpen.set(false);
  }
}

export const ShopService = new ShopServiceClass();
