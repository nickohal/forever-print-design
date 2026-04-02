import type { PendingChange } from './types';

const store = new Map<string, PendingChange[]>();

export function setPreview(token: string, changes: PendingChange[]) {
  store.set(token, changes);
  setTimeout(() => store.delete(token), 30 * 60 * 1000);
}

export function getPreview(token: string): PendingChange[] | null {
  return store.get(token) ?? null;
}

export function clearPreview(token: string) {
  store.delete(token);
}
