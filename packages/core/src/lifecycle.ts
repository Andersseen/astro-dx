type LifecycleCallback = () => void;

const pageLoadHandlers = new Set<LifecycleCallback>();
let isPageLoadAttached = false;
let hasPageLoaded = false;

export function onPageLoad(callback: LifecycleCallback): void {
  if (hasPageLoaded) {
    callback();
    return;
  }

  pageLoadHandlers.add(callback);

  if (!isPageLoadAttached) {
    isPageLoadAttached = true;

    const fireAll = () => {
      hasPageLoaded = true;
      for (const handler of pageLoadHandlers) handler();
      pageLoadHandlers.clear();
    };

    document.addEventListener("astro:page-load", fireAll);

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fireAll, { once: true });
    } else {
      fireAll();
    }
  }
}

const beforeSwapHandlers = new Set<LifecycleCallback>();
let isBeforeSwapAttached = false;

export function onBeforeSwap(callback: LifecycleCallback): void {
  beforeSwapHandlers.add(callback);

  if (!isBeforeSwapAttached) {
    isBeforeSwapAttached = true;
    document.addEventListener("astro:before-swap", () => {
      for (const handler of beforeSwapHandlers) handler();
    });
  }
}
