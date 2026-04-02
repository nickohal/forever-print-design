'use client';
import { useRef, useCallback, useState } from 'react';
import AiEditor from '@/components/AiEditor';
import type { PendingChange } from '@/lib/types';
import { logout } from './actions';

export default function AdminEditor() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [previewedChanges, setPreviewedChanges] = useState<PendingChange[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState({ current: 0, total: 0 });
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishDone, setPublishDone] = useState(false);
  const [debugToken, setDebugToken] = useState<string | null>(null);

  const refreshIframeWithChanges = useCallback(async (changes: PendingChange[]) => {
    console.log('[AdminEditor] refreshIframeWithChanges called, iframeRef.current:', !!iframeRef.current, 'changes:', changes.length);
    if (!iframeRef.current) {
      console.warn('[AdminEditor] iframeRef.current is null — iframe not attached');
      return;
    }
    if (changes.length === 0) {
      const src = '/preview-bridge';
      console.log('[AdminEditor] No changes, resetting iframe src to:', src);
      iframeRef.current.src = src;
      setDebugToken(null);
      return;
    }
    try {
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes }),
      });
      console.log('[AdminEditor] POST /api/preview response status:', res.status);
      if (!res.ok) {
        console.error('[AdminEditor] Preview API returned error:', res.status);
        return;
      }
      const { token } = await res.json();
      const newSrc = `/preview-bridge?token=${token}`;
      console.log('[AdminEditor] Got token:', token);
      console.log('[AdminEditor] Setting iframe src to:', newSrc);
      iframeRef.current.src = newSrc;
      setDebugToken(token);
      console.log('[AdminEditor] iframe src after set:', iframeRef.current.src);
    } catch (err) {
      console.error('[AdminEditor] Preview fetch error:', err);
    }
  }, []);

  const handlePreview = useCallback(
    (change: PendingChange) => {
      console.log('[AdminEditor] handlePreview called with change:', change);
      const next = [...previewedChanges, change];
      console.log('[AdminEditor] Total previewed changes:', next.length);
      setPreviewedChanges(next);
      refreshIframeWithChanges(next);
    },
    [previewedChanges, refreshIframeWithChanges],
  );

  const handleApprove = useCallback((change: PendingChange) => {
    setPendingChanges((prev) => [...prev, change]);
  }, []);

  const handleDiscard = useCallback(
    (change: PendingChange) => {
      setPendingChanges((prev) =>
        prev.filter((c) => !(c.file === change.file && c.oldCode === change.oldCode)),
      );
      const nextPreviewed = previewedChanges.filter(
        (c) => !(c.file === change.file && c.oldCode === change.oldCode),
      );
      setPreviewedChanges(nextPreviewed);
      refreshIframeWithChanges(nextPreviewed);
    },
    [previewedChanges, refreshIframeWithChanges],
  );

  const handlePublish = async () => {
    if (pendingChanges.length === 0 || publishing) return;

    setPublishing(true);
    setPublishError(null);
    setPublishDone(false);
    setPublishProgress({ current: 0, total: pendingChanges.length });

    for (let i = 0; i < pendingChanges.length; i++) {
      setPublishProgress({ current: i + 1, total: pendingChanges.length });
      try {
        const res = await fetch('/api/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pendingChanges[i]),
        });
        if (!res.ok) {
          const data = await res.json();
          setPublishError(`Feil ved endring ${i + 1}: ${data.error ?? 'Ukjent feil'}`);
          setPublishing(false);
          return;
        }
      } catch {
        setPublishError(`Nettverksfeil ved endring ${i + 1}`);
        setPublishing(false);
        return;
      }
    }

    setPendingChanges([]);
    setPreviewedChanges([]);
    setPublishing(false);
    setPublishDone(true);

    // Reload iframe to show actual deployed state
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = '/preview-bridge';
      }
      setTimeout(() => setPublishDone(false), 3000);
    }, 500);
  };

  const pendingCount = pendingChanges.length;

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-white">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="h-12 flex-shrink-0 bg-warm-black flex items-center justify-between px-4 md:px-6">
        <span className="font-serif font-light text-[14px] text-cream/90 tracking-wide flex items-center gap-2">
          <span className="text-[16px]">✦</span>
          <span className="hidden sm:inline">Forever Print Design</span>
        </span>

        <div className="flex items-center gap-3">
          {/* Debug token indicator */}
          {debugToken && (
            <span className="font-mono text-[10px] text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded">
              preview:{debugToken.slice(0, 8)}
            </span>
          )}

          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={pendingCount === 0 || publishing}
            className="font-sans font-light text-[11px] text-cream bg-sage px-4 py-1.5 rounded-md hover:bg-sage/85 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2"
          >
            {publishing
              ? `Publiserer ${publishProgress.current}/${publishProgress.total}...`
              : publishDone
                ? '✓ Publisert!'
                : pendingCount > 0
                  ? `Publiser ${pendingCount} ${pendingCount === 1 ? 'endring' : 'endringer'}`
                  : 'Publiser endringer'}
          </button>

          {publishError && (
            <span className="font-sans font-light text-[10px] text-red-400 max-w-[180px] truncate">
              {publishError}
            </span>
          )}

          {/* Back to site — mobile */}
          <a
            href="/"
            className="md:hidden font-sans font-light text-[11px] text-cream/60 hover:text-cream transition-colors duration-150"
          >
            ← Se siden
          </a>

          {/* Back to site — desktop */}
          <a
            href="/"
            className="hidden md:inline font-sans font-light text-[11px] text-cream/60 hover:text-cream transition-colors duration-150"
          >
            ← Tilbake
          </a>

          <form action={logout}>
            <button
              type="submit"
              className="font-sans font-light text-[11px] text-cream/60 hover:text-cream transition-colors duration-150"
            >
              Log ut
            </button>
          </form>
        </div>
      </div>

      {/* ── Content area ────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Iframe — desktop only */}
        <iframe
          ref={iframeRef}
          src="/preview-bridge"
          className="hidden md:block flex-1 border-none"
          title="Site preview"
        />

        {/* Chat panel */}
        <div className="w-full md:w-96 flex-shrink-0 md:border-l md:border-muted/15 flex flex-col bg-white">
          <AiEditor
            mode="live"
            onPreview={handlePreview}
            onApprove={handleApprove}
            onDiscard={handleDiscard}
          />
        </div>
      </div>
    </div>
  );
}
