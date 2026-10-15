// ==============================================================================
// SEVA SKILL PASSPORT — SHARED ISOMORPHIC STORAGE ENGINE
// Unifies browser localStorage and Node.js server/test global memory store.
// ==============================================================================

declare global {
  // eslint-disable-next-line no-var
  var __seva_memory_store: Record<string, string> | undefined;
}

if (!globalThis.__seva_memory_store) {
  globalThis.__seva_memory_store = {};
}

const memoryStore = globalThis.__seva_memory_store;

export function getLocal<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') {
    const raw = memoryStore[key];
    return raw !== undefined ? JSON.parse(raw) : defaultVal;
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

export function setLocal<T>(key: string, val: T): void {
  if (typeof window === 'undefined') {
    memoryStore[key] = JSON.stringify(val);
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

export function removeLocal(key: string): void {
  if (typeof window === 'undefined') {
    delete memoryStore[key];
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch {}
}
