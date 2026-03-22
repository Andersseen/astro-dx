import { signal } from "@astro-dx/core";
import { getElement, getElements } from "@astro-dx/dom";
import { onClick } from "@astro-dx/events";

const isOpen = signal(false);
const modalTitle = signal("Hello from astro-dx");
const lastClicked = signal("none");

const modal = getElement<HTMLDialogElement>("#demo-modal");
const btnOpen = getElement<HTMLButtonElement>("#btn-open-modal");
const btnClose = getElement<HTMLButtonElement>("#btn-close-modal");

getElement("#modal-title").text(modalTitle);
getElement("#last-clicked").text(lastClicked);

onClick(btnOpen.el, () => isOpen.set(true));
onClick(btnClose.el, () => isOpen.set(false));

modal.effect(() => {
  if (isOpen()) {
    if (!modal.el.open) modal.el.showModal();
  } else if (modal.el.open) {
    modal.el.close();
  }
});

const items = getElements<HTMLLIElement>(".demo-product");
for (const item of items) {
  item.onHover({
    enter: () => item.el.style.setProperty("opacity", "0.6"),
    leave: () => item.el.style.removeProperty("opacity"),
  });
  onClick(item.el, () => lastClicked.set(item.el.dataset.id ?? "unknown"));
}
