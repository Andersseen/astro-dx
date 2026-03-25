import { effect, signal } from "@astro-dx/core";

const useA = signal(true);
const a = signal(1);
const b = signal(100);

effect(() => {
  if (useA()) {
    console.log("branch A", a());
  } else {
    console.log("branch B", b());
  }
});

useA.set(false);
b.set(120);
a.set(2);
