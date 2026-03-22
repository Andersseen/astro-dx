import { register } from "@astro-dx/core";
import { CounterServiceClass } from "./counter.service";
import { ShopServiceClass } from "./shop.service";

register([CounterServiceClass, ShopServiceClass]);
