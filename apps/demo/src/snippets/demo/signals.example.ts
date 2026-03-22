import { signal, computed } from "@astro-dx/core";
import { getElement } from "@astro-dx/dom";

const count = signal(0);
const double = computed(() => count() * 2);

getElement("#count-display").text(count);
getElement("#double-display").text(double);

getElement("#btn-inc").on("click", () => count.update((v) => v + 1));
getElement("#btn-dec").on("click", () => count.update((v) => v - 1));
