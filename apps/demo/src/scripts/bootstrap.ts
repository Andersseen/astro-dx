import "@andersseen/web-components/components/all";
import { enableAnimations } from "@andersseen/web-components";
import { registerAllIcons } from "@andersseen/icon";
import { initMotion } from "@andersseen/motion";
import { getElements } from "@astro-dx/dom";
import { on } from "@astro-dx/events";
import "../services/index.ts";

enableAnimations();

type NavbarItem = {
  id: string;
  href?: string;
};

const resolveActiveItem = (
  pathname: string,
  items: NavbarItem[],
): string | null => {
  const match = items.find((item) => {
    if (!item.href) return false;
    if (item.href === "/") return pathname === "/";
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });
  return match?.id ?? null;
};

const readNavbarItems = (navbar: Element): NavbarItem[] => {
  const raw = navbar.getAttribute("items");
  if (!raw) return [];
  try {
    return JSON.parse(raw) as NavbarItem[];
  } catch {
    return [];
  }
};

const syncNavbarState = () => {
  const navbars = getElements<HTMLElement>("and-navbar[data-app-navbar]").map(ref => ref.el);
  for (const navbar of navbars) {
    const items = readNavbarItems(navbar);
    const active = resolveActiveItem(window.location.pathname, items);
    if (active) {
      navbar.setAttribute("active-item", active);
      (navbar as HTMLElement & { activeItem?: string }).activeItem = active;
    }

    const toggleIcon = navbar.querySelector<HTMLElement & { name?: string }>(
      "[data-navbar-toggle-icon]",
    );
    if (toggleIcon) {
      const isOpen =
        (navbar as HTMLElement & { mobileMenuOpen?: boolean })
          .mobileMenuOpen === true;
      toggleIcon.name = isOpen ? "x" : "menu";

      if (!navbar.dataset.toggleIconBound) {
        const onMenuChange = (event: any) => {
          const custom = event as CustomEvent<boolean>;
          const opened = custom.detail === true;
          toggleIcon.name = opened ? "x" : "menu";
        };

        on(navbar, "mobileMenuChange", onMenuChange);
        on(navbar, "mobile-menu-change", onMenuChange);
        navbar.dataset.toggleIconBound = "true";
      }
    }
  }
};

const initClientUi = () => {
  registerAllIcons();
  initMotion();
  syncNavbarState();
};

if (document.readyState === "loading") {
  on(document, "DOMContentLoaded", initClientUi);
} else {
  initClientUi();
}

on(document, "astro:page-load", () => {
  initMotion();
  syncNavbarState();
});

on(window, "popstate", syncNavbarState);
