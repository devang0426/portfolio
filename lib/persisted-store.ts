/**
 * A tiny external store backed by localStorage, shaped for `useSyncExternalStore`.
 *
 * Reading persisted state this way — rather than setting state from an effect —
 * means the server snapshot renders first, hydration matches, and the stored
 * value is adopted in the same commit instead of a second cascading render.
 */
export interface PersistedStore<T extends string> {
  subscribe: (listener: () => void) => () => void;
  get: () => T;
  getServerSnapshot: () => T;
  set: (value: T) => void;
}

export function createPersistedStore<T extends string>(
  key: string,
  fallback: T,
  isValid: (value: string) => value is T,
): PersistedStore<T> {
  const listeners = new Set<() => void>();
  // getSnapshot must return a stable value, so the read is memoised.
  let cache: T | null = null;

  const read = (): T => {
    if (cache !== null) return cache;
    try {
      const stored = window.localStorage.getItem(key);
      cache = stored !== null && isValid(stored) ? stored : fallback;
    } catch {
      cache = fallback;
    }
    return cache;
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    get: read,
    getServerSnapshot: () => fallback,
    set: (value) => {
      if (cache === value) return;
      cache = value;
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* storage unavailable — the choice simply will not persist */
      }
      for (const listener of listeners) listener();
    },
  };
}
