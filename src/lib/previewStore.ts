import { kv } from '@vercel/kv';
import type { PendingChange } from './types';

const EXPIRY_SECONDS = 30 * 60; // 30 minutes

export async function setPreview(token: string, changes: PendingChange[]) {
  await kv.set(`preview:${token}`, JSON.stringify(changes), { ex: EXPIRY_SECONDS });
}

export async function getPreview(token: string): Promise<PendingChange[] | null> {
  const data = await kv.get<string>(`preview:${token}`);
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function clearPreview(token: string) {
  await kv.del(`preview:${token}`);
}
