import { atom, computed } from "nanostores";

const $count = atom(0);
const $double = computed($count, (c) => c * 2);
const $sign = computed($count, (c) =>
  c > 0 ? "positive" : c < 0 ? "negative" : "neutral",
);

$count.subscribe((v) => {
  document.querySelector("#count-display")!.textContent = String(v);
});

$double.subscribe((v) => {
  document.querySelector("#double-display")!.textContent = String(v);
});

$sign.subscribe((v) => {
  document.querySelector("#sign-display")!.textContent = v;
});

document
  .querySelector("#btn-inc")
  ?.addEventListener("click", () => $count.set($count.get() + 1));

document
  .querySelector("#btn-dec")
  ?.addEventListener("click", () => $count.set($count.get() - 1));

document
  .querySelector("#btn-reset")
  ?.addEventListener("click", () => $count.set(0));
