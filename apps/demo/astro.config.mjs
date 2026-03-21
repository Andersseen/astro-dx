import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  output: "static",
  vite: {
    resolve: {
      alias: {
        "@astro-dx/core": resolve(
          __dirname,
          "../../packages/core/src/index.ts",
        ),
        "@astro-dx/events": resolve(
          __dirname,
          "../../packages/events/src/index.ts",
        ),
        "@astro-dx/attributes": resolve(
          __dirname,
          "../../packages/attributes/src/index.ts",
        ),
        "@astro-dx/elements": resolve(
          __dirname,
          "../../packages/elements/src/index.ts",
        ),
        "@astro-dx/dom": resolve(__dirname, "../../packages/dom/src/index.ts"),
        "astro-dx/core": resolve(__dirname, "../../packages/all/src/core.ts"),
        "astro-dx/events": resolve(
          __dirname,
          "../../packages/all/src/events.ts",
        ),
        "astro-dx/attributes": resolve(
          __dirname,
          "../../packages/all/src/attributes.ts",
        ),
        "astro-dx/elements": resolve(
          __dirname,
          "../../packages/all/src/elements.ts",
        ),
        "astro-dx/dom": resolve(__dirname, "../../packages/all/src/dom.ts"),
        "astro-dx": resolve(__dirname, "../../packages/all/src/index.ts"),
      },
    },
  },
});
