// apps/demo/astro.config.mjs
import { defineConfig } from "astro/config";
import { fileURLToPath } from "url";
import { resolve } from "path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  output: "static",
  vite: {
    resolve: {
      alias: {
        "astro-dx/dom": resolve(
          __dirname,
          "../../packages/astro-dx/src/dom/index.ts",
        ),
        "astro-dx": resolve(__dirname, "../../packages/astro-dx/src/index.ts"),
        "astro-dx-elements": resolve(
          __dirname,
          "../../packages/astro-dx-elements/src/index.ts",
        ),
      },
    },
  },
});
