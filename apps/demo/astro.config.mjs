import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

import { defineConfig } from "astro/config";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  output: "static",
  vite: {
    server: {
      fs: {
        allow: [resolve(__dirname, "../..")],
      },
    },
    plugins: [tailwindcss()],
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
        "@core": resolve(__dirname, "../../packages/core"),
        "@dom": resolve(__dirname, "../../packages/dom"),
        "@events": resolve(__dirname, "../../packages/events"),
        "@attributes": resolve(__dirname, "../../packages/attributes"),
        "@elements": resolve(__dirname, "../../packages/elements"),
      },
    },
  },
});
