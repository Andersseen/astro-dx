// apps/demo/src/services/shop.service.ts
import { signal, computed } from "astro-dx";

type Product = { id: string; name: string; price: number };

class ShopServiceClass {
  private _cart = signal<Product[]>([]);
  private _modalOpen = signal(false);

  readonly cartItems = this._cart;
  readonly cartTotal = computed(() => this._cart().length);
  readonly hasItems = computed(() => this._cart().length > 0);
  readonly isModalOpen = this._modalOpen;

  addToCart(product: Product): void {
    this._cart.update((prev) => [...prev, product]);
  }

  clearCart(): void {
    this._cart.set([]);
  }

  openModal(): void {
    this._modalOpen.set(true);
  }

  closeModal(): void {
    this._modalOpen.set(false);
  }
}

export const ShopService = new ShopServiceClass();
