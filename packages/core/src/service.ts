/**
 * Creates a singleton service from a class instance.
 * ESM module guarantee ensures single instance across all islands.
 */
export function createService<T extends object>(instance: T): Readonly<T> {
  return instance;
}
