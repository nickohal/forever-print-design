'use client';
import { useRef, useCallback, useState } from 'react';
import AiEditor from '@/components/AiEditor';
import type { PendingChange } from '@/components/AiEditor';
import { logout } from './actions';

function stripJsx(s: string) {
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/\{[^}]*\}/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ensp;/g, ' ')
    .replace(/&ldquo;/g, '\u201c')
    .replace(/&rdquo;/g, '\u201d')
    .trim();
}

export default function AdminEditor() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState({ current: 0, total: 0 });
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishDone, setPublishDone] = useState(false);

  const sendToIframe = useCallback((message: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(message, '*');
  }, []);

  const handlePreview = useCallback(
    (change: PendingChange) => {
      if (change.file === 'src/app/globals.css') {
        const matches = [...change.newCode.matchAll(/--(color-[\w-]+):\s*([^;\n]+)/g)];
        if (matches.length > 0) {
          const css = `:root { ${matches.map((m) => `--${m[1]}: ${m[2].trim()}`).join('; ')}; }`;
          sendToIframe({ type: 'preview-css', css });
        }
        return;
      }
      const oldText = stripJsx(change.oldCode);
      const newText = stripJsx(change.newCode);
      if (oldText && newText) {
        sendToIframe({ type: 'preview-text', oldText, newText });
      }
    },
    [sendToIframe],
  );

  const handleApprove = useCallback((change: PendingChange) => {
    setPendingChanges((prev) => [...prev, change]);
  }, []);

  const handleDiscard = useCallback((change: PendingChange) => {
    setPendingChanges((prev) =>
      prev.filter(
        (c) => !(c.file === change.file && c.oldCode === change.oldCode),
      ),
    );
  }, []);

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
    setPublishing(false);
    setPublishDone(true);

    // Reset preview and reload iframe after a short delay
    sendToIframe({ type: 'preview-reset' });
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
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
            className="font-sans font-light text-[11px] text-warm-black bg-sage text-cream px-4 py-1.5 rounded-md hover:bg-sage/85 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2"
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
