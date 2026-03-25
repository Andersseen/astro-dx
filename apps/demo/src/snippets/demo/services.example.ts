// services/index.ts (loaded once from BaseLayout)
import { register } from '@astro-dx/core';
import { CounterServiceClass } from '../../services/counter.service';
import { ShopServiceClass } from '../../services/shop.service';

register([CounterServiceClass, ShopServiceClass]);

// Any island/component
import { inject } from '@astro-dx/core';

const cart = inject(ShopServiceClass);
cart.addToCart({ id: 'k-1', name: 'Keyboard', price: 99 });
