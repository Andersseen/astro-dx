import "@andersseen/web-components/components/all";
import { registerAllIcons } from "@andersseen/icon";
import { initMotion } from "@andersseen/motion";
import "../services/index.ts";

document.addEventListener("DOMContentLoaded", () => {
  registerAllIcons();
  initMotion();
});
