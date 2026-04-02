import { NextRequest } from 'next/server';
import { setPreview, getPreview } from '@/lib/previewStore';
import type { PendingChange } from '@/lib/types';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const changes: PendingChange[] = body.changes;

    if (!Array.isArray(changes) || changes.length === 0) {
      return Response.json({ error: 'changes array is required' }, { status: 400 });
    }

    const token = crypto.randomUUID();
    setPreview(token, changes);

    return Response.json({ token });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return Response.json({ error: 'token is required' }, { status: 400 });
  }

  const changes = getPreview(token);
  if (!changes) {
    return Response.json({ error: 'Preview not found or expired' }, { status: 404 });
  }

  return Response.json({ changes });
}
