import { effect, signal } from "@astro-dx/core";

const visible = signal(true);
const total = signal(99);
const title = signal("Cart");

effect(() => {
  if (!visible()) return;

  const trackedTitle = title();

  const currentTotal = total.peek();

  console.log(`${trackedTitle}: ${currentTotal}`);
});
