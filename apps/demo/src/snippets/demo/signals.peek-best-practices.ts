import { signal, effect } from "@astro-dx/core";

const visible = signal(true);
const total = signal(99);
const title = signal("Cart");

effect(() => {
  if (!visible()) return;

  // tracked dependency: this re-runs the effect when title changes
  const trackedTitle = title();

  // untracked read: changing total does NOT re-run this effect
  const currentTotal = total.peek();

  console.log(`${trackedTitle}: ${currentTotal}`);
});

// Best practices:
// 1) Prefer normal reads first; use peek() only for truly non-reactive reads.
// 2) Use peek() for analytics/logging/debug values you do not want to subscribe to.
// 3) Keep side effects explicit and return cleanup when wiring external APIs.
