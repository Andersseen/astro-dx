import { signal, computed } from "@astro-dx/core";
import { getElement } from "@astro-dx/dom";

const count = signal(0);
const double = computed(() => count() * 2);
const sign = computed(() =>
  count() > 0 ? "positive" : count() < 0 ? "negative" : "neutral",
);

getElement("#count-display").text(count);
getElement("#double-display").text(double);
getElement("#sign-display").text(sign);

getElement("#btn-inc").on("click", () => count.update((v) => v + 1));
getElement("#btn-dec").on("click", () => count.update((v) => v - 1));
getElement("#btn-reset").on("click", () => count.set(0));
