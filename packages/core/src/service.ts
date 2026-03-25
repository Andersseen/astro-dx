export function createService<T extends object>(instance: T): Readonly<T> {
  return instance;
}
