import { signal, effect } from "@astro-dx/core";

const useA = signal(true);
const a = signal(1);
const b = signal(100);

// Re-tracks dependencies on every run.
effect(() => {
  if (useA()) {
    console.log("branch A", a());
  } else {
    console.log("branch B", b());
  }
});

// Switch branch -> now b is tracked, a is not.
useA.set(false);
b.set(120); // effect runs
a.set(2); // effect does not run
