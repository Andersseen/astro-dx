import { bootstrap, register } from "@astro-dx/attributes";
import { signal } from "@astro-dx/core";

const isVisible = signal(true);
const isMounted = signal(true);
const listItems = signal([{ id: 1, label: "First item" }]);

register({ isVisible, isMounted, listItems });
bootstrap();
