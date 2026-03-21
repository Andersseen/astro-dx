type LifecycleCallback = () => void;

export function onPageLoad(callback: LifecycleCallback): void {
  let fired = false;

  const handler = () => {
    fired = true;
    callback();
  };

  document.addEventListener("astro:page-load", handler);

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        if (!fired) callback();
      },
      { once: true },
    );
  } else if (!fired) {
    callback();
  }
}

export function onBeforeSwap(callback: LifecycleCallback): void {
  document.addEventListener(
    "astro:before-swap",
    () => {
      callback();
    },
    { once: true },
  );
}
