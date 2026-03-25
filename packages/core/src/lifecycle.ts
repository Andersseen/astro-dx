type LifecycleCallback = () => void;

const pageLoadHandlers = new Set<LifecycleCallback>();
let isPageLoadAttached = false;
let hasPageLoaded = false;

export function onPageLoad(callback: LifecycleCallback): void {
  // Si la página ya cargó, lo ejecutamos inmediatamente
  if (hasPageLoaded) {
    callback();
    return;
  }

  pageLoadHandlers.add(callback);

  // Solo adjuntamos el evento al DOM la primera vez
  if (!isPageLoadAttached) {
    isPageLoadAttached = true;

    const fireAll = () => {
      hasPageLoaded = true;
      for (const handler of pageLoadHandlers) handler();
      pageLoadHandlers.clear(); // Limpiamos memoria
    };

    document.addEventListener('astro:page-load', fireAll);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fireAll, { once: true });
    } else {
      fireAll();
    }
  }
}

// Mismo patrón para BeforeSwap
const beforeSwapHandlers = new Set<LifecycleCallback>();
let isBeforeSwapAttached = false;

export function onBeforeSwap(callback: LifecycleCallback): void {
  beforeSwapHandlers.add(callback);

  if (!isBeforeSwapAttached) {
    isBeforeSwapAttached = true;
    document.addEventListener('astro:before-swap', () => {
      for (const handler of beforeSwapHandlers) handler();
      // No limpiamos el Set porque before-swap puede ocurrir múltiples veces en la navegación
    });
  }
}
