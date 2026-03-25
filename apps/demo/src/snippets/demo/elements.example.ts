import { register } from '@astro-dx/elements';
import '@astro-dx/elements';

register({
  hasItems: ShopService.hasItems,
  isModalOpen: ShopService.isModalOpen,
  cartItems: ShopService.cartItems,
});

// In template:
// <dx-show signal="hasItems">...</dx-show>
// <dx-if signal="isModalOpen">...</dx-if>
// <dx-for signal="cartItems" key="id">...</dx-for>
