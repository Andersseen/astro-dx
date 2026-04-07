// Debug system for astro-dx
// Only active in development mode

interface DebugConfig {
  enabled: boolean;
  logSignals: boolean;
  logEffects: boolean;
  logServices: boolean;
  showWarnings: boolean;
}

const config: DebugConfig = {
  enabled: false,
  logSignals: true,
  logEffects: true,
  logServices: true,
  showWarnings: true,
};

// Check if we're in a browser environment with localStorage
const isBrowser = typeof window !== 'undefined';
const hasLocalStorage = isBrowser && typeof localStorage !== 'undefined';

// Initialize from localStorage if available
if (hasLocalStorage) {
  const stored = localStorage.getItem('astro-dx-debug');
  if (stored === 'true') {
    config.enabled = true;
  }
}

export function enableDebug(options?: Partial<DebugConfig>): void {
  config.enabled = true;
  if (options) {
    Object.assign(config, options);
  }
  if (hasLocalStorage) {
    localStorage.setItem('astro-dx-debug', 'true');
  }
  console.log('[astro-dx:debug] Debug mode enabled');
}

export function disableDebug(): void {
  config.enabled = false;
  if (hasLocalStorage) {
    localStorage.removeItem('astro-dx-debug');
  }
  console.log('[astro-dx:debug] Debug mode disabled');
}

export function isDebugEnabled(): boolean {
  return config.enabled;
}

// Internal logging functions
export function logSignal(name: string, oldValue: unknown, newValue: unknown): void {
  if (!config.enabled || !config.logSignals) return;

  const styles = 'color: #3b82f6; font-weight: bold;';
  console.log(`%c[astro-dx:signal]%c ${name}:`, styles, '', oldValue, '→', newValue);
}

export function logEffect(name: string | undefined, depsCount: number, duration?: number): void {
  if (!config.enabled || !config.logEffects) return;

  const styles = 'color: #10b981; font-weight: bold;';
  const nameStr = name ? ` "${name}"` : '';
  const durationStr = duration ? ` (${duration.toFixed(2)}ms)` : '';

  console.log(
    `%c[astro-dx:effect]%c${nameStr} executed with ${depsCount} dependencies${durationStr}`,
    styles,
    ''
  );
}

export function logService(action: string, serviceName: string): void {
  if (!config.enabled || !config.logServices) return;

  const styles = 'color: #f59e0b; font-weight: bold;';
  console.log(`%c[astro-dx:service]%c ${action}:`, styles, '', serviceName);
}

export function warn(message: string, ...args: unknown[]): void {
  if (!config.enabled || !config.showWarnings) return;

  console.warn('[astro-dx:warn]', message, ...args);
}

// Performance tracking
const perfMap = new Map<string, number>();

export function startPerf(label: string): void {
  if (!config.enabled) return;
  perfMap.set(label, performance.now());
}

export function endPerf(label: string): number | undefined {
  if (!config.enabled) return undefined;

  const start = perfMap.get(label);
  if (start !== undefined) {
    const duration = performance.now() - start;
    perfMap.delete(label);
    return duration;
  }
  return undefined;
}

// Export config for testing
export { config as __debugConfig };
