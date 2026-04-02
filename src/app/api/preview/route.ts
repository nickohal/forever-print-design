import { NextRequest } from 'next/server';
import { setPreview, getPreview } from '@/lib/previewStore';
import type { PendingChange } from '@/lib/types';
import crypto from 'crypto';

function detectChangeType(change: PendingChange): 'text' | 'css-var' | 'component' {
  // CSS variable changes
  if (change.file.includes('globals.css') || /--(?:color|size|spacing|opacity|radius)-/.test(change.newCode)) {
    return 'css-var';
  }

  // Text-only changes: short, no JSX tags, no className
  const hasJsx = /<[a-zA-Z]/.test(change.oldCode) || /<[a-zA-Z]/.test(change.newCode);
  const hasClassName = change.oldCode.includes('className') || change.newCode.includes('className');
  const isShort = change.oldCode.length < 200 && change.newCode.length < 200;

  if (!hasJsx && !hasClassName && isShort) {
    return 'text';
  }

  return 'component';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const changes: PendingChange[] = body.changes;

    if (!Array.isArray(changes) || changes.length === 0) {
      return Response.json({ error: 'changes array is required' }, { status: 400 });
    }

    // Auto-detect changeType if not set
    const enriched = changes.map((c) => ({
      ...c,
      changeType: c.changeType ?? detectChangeType(c),
    }));

    const token = crypto.randomUUID();
    setPreview(token, enriched);

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
