import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    core: "src/core.ts",
    events: "src/events.ts",
    attributes: "src/attributes.ts",
    elements: "src/elements.ts",
    dom: "src/dom.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
