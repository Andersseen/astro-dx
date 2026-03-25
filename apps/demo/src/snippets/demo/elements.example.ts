import { register } from "@astro-dx/elements";
import "@astro-dx/elements";

register({
  hasItems: ShopService.hasItems,
  isModalOpen: ShopService.isModalOpen,
  cartItems: ShopService.cartItems,
});
