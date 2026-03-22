import { signal } from "@astro-dx/core";
import { register, bootstrap } from "@astro-dx/attributes";

const isVisible = signal(true);
const isMounted = signal(true);
const listItems = signal([{ id: 1, label: "First item" }]);

register({ isVisible, isMounted, listItems });
bootstrap();

// In template:
// <and-alert dx-show="isVisible">Visible</and-alert>
// <and-alert dx-if="isMounted">Mounted</and-alert>
// <li dx-for="listItems" dx-key="id" dx-text="label"></li>
