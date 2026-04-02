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

  const refreshIframeWithChanges = useCallback(async (changes: PendingChange[]) => {
    if (!iframeRef.current) return;
    if (changes.length === 0) {
      iframeRef.current.src = '/preview-bridge';
      return;
    }
    try {
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes }),
      });
      if (!res.ok) return;
      const { token } = await res.json();
      iframeRef.current.src = `/preview-bridge?token=${token}`;
    } catch {
      // Silently fail — preview is best-effort
    }
  }, []);

  const handlePreview = useCallback(
    (change: PendingChange) => {
      const next = [...previewedChanges, change];
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
