// packages/astro-dx-elements/src/index.ts
export { register, resolve } from "./registry.ts";
export type { AnySignal } from "./registry.ts";
export { DxShow } from "./elements/dx-show.ts";
export { DxIf } from "./elements/dx-if.ts";
export { DxFor } from "./elements/dx-for.ts";

// Side-effect: defines all custom elements
import "./elements/dx-show.ts";
import "./elements/dx-if.ts";
import "./elements/dx-for.ts";
