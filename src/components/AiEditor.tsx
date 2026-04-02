'use client';
import { useState } from 'react';

type Phase = 'idle' | 'loading' | 'diff' | 'deploying' | 'deployed';

interface Suggestion {
  file: string;
  oldCode: string;
  newCode: string;
  description: string;
}

interface Props {
  mode?: 'demo' | 'live';
  onDeployed?: () => void;
}

const chips = [
  "Make the headline more romantic",
  "Change button color to dusty blue",
  "Add a new product: Aura Posters",
];

const LoadingDots = ({ label }: { label: string }) => (
  <div className="flex items-center gap-1.5 py-4">
    <span className="font-sans font-light text-[13px] text-muted">{label}</span>
    <span className="inline-flex gap-[3px] ml-0.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1 h-1 rounded-full bg-muted/50 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  </div>
);

export default function AiEditor({ mode = 'demo', onDeployed }: Props) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [input, setInput] = useState('');
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commitUrl, setCommitUrl] = useState<string | null>(null);

  const handleApply = async () => {
    setPhase('loading');
    setError(null);

    if (mode === 'demo') {
      setTimeout(() => setPhase('diff'), 1500);
      return;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to generate suggestion');
        setPhase('idle');
        return;
      }
      setSuggestion(data as Suggestion);
      setPhase('diff');
    } catch {
      setError('Network error — please try again');
      setPhase('idle');
    }
  };

  const handleDeploy = async () => {
    setPhase('deploying');
    setError(null);

    if (mode === 'demo') {
      setTimeout(() => setPhase('deployed'), 1500);
      return;
    }

    if (!suggestion) {
      setError('No suggestion to apply');
      setPhase('idle');
      return;
    }

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestion),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to apply change');
        setPhase('diff');
        return;
      }
      setCommitUrl(data.commitUrl ?? null);
      setPhase('deployed');
      onDeployed?.();
    } catch {
      setError('Network error — please try again');
      setPhase('diff');
    }
  };

  const handleDiscard = () => {
    setPhase('idle');
    setInput('');
    setSuggestion(null);
    setError(null);
    setCommitUrl(null);
  };

  const handleClose = () => {
    setOpen(false);
    setPhase('idle');
    setInput('');
    setSuggestion(null);
    setError(null);
    setCommitUrl(null);
  };

  // Determine the diff text to show
  const diffOld =
    mode === 'live' && suggestion
      ? suggestion.oldCode.slice(0, 120) + (suggestion.oldCode.length > 120 ? '…' : '')
      : '"Designed for your most cherished moments"';

  const diffNew =
    mode === 'live' && suggestion
      ? suggestion.newCode.slice(0, 120) + (suggestion.newCode.length > 120 ? '…' : '')
      : '"Created for the moments that last forever"';

  const diffFile =
    mode === 'live' && suggestion ? suggestion.file : null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">

      {/* Expanded card */}
      {open && (
        <div className="w-80 bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div>
              <h3 className="font-serif text-warm-black text-[16px] leading-snug">
                AI Site Editor
              </h3>
              <p className="font-sans font-light text-[11px] text-muted mt-0.5">
                {mode === 'live' ? 'Live — changes go to GitHub' : 'Describe a change in plain text'}
              </p>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close"
              className="text-muted/40 hover:text-warm-black transition-colors duration-150 text-xl leading-none mt-0.5 ml-4 flex-shrink-0"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="px-5 pb-5">

            {/* IDLE */}
            {phase === 'idle' && (
              <>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setInput(chip)}
                      className="font-sans font-light text-[11px] text-sage bg-sage/10 rounded-full px-3 py-1.5 hover:bg-sage/20 transition-colors duration-150 text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. Change the tagline to something warmer..."
                  className="w-full font-sans font-light text-[13px] text-warm-black placeholder:text-muted/35 bg-white border border-muted/20 focus:border-sage focus:outline-none rounded-lg px-3 py-2.5 resize-none transition-colors duration-150"
                />

                {error && (
                  <p className="font-sans font-light text-[11px] text-red-500 mt-2">{error}</p>
                )}

                <div className="flex items-center justify-between mt-3">
                  <p className="font-sans font-light text-[10px] text-muted/50">
                    ↵ Changes preview before going live
                  </p>
                  <button
                    onClick={handleApply}
                    disabled={!input.trim()}
                    className="font-sans font-light text-[12px] text-white bg-sage rounded-lg px-4 py-2 hover:bg-sage/85 disabled:opacity-35 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    Apply change →
                  </button>
                </div>
              </>
            )}

            {/* LOADING */}
            {phase === 'loading' && <LoadingDots label="Analysing your site" />}

            {/* DIFF */}
            {phase === 'diff' && (
              <div className="flex flex-col gap-3.5">
                <p className="font-sans font-light text-[12px] text-sage">
                  ✓ Change ready to preview
                </p>

                {diffFile && (
                  <p className="font-sans font-light text-[10px] text-muted/60 -mt-1">
                    {diffFile}
                  </p>
                )}

                <div className="bg-muted/5 border border-muted/10 rounded-lg p-3.5 flex flex-col gap-2.5">
                  <p className="font-sans font-light text-[12px] text-muted line-through leading-relaxed break-words">
                    {diffOld}
                  </p>
                  <p className="font-sans font-light text-[12px] text-sage leading-relaxed break-words">
                    {diffNew}
                  </p>
                </div>

                {error && (
                  <p className="font-sans font-light text-[11px] text-red-500">{error}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleDeploy}
                    className="font-sans font-light text-[12px] text-white bg-sage rounded-lg px-4 py-2 hover:bg-sage/85 transition-colors duration-150"
                  >
                    Apply &amp; Deploy
                  </button>
                  <button
                    onClick={handleDiscard}
                    className="font-sans font-light text-[12px] text-warm-black border border-muted/25 rounded-lg px-4 py-2 hover:border-muted/50 transition-colors duration-150"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            {/* DEPLOYING */}
            {phase === 'deploying' && <LoadingDots label="Deploying to Vercel" />}

            {/* DEPLOYED */}
            {phase === 'deployed' && (
              <div className="flex flex-col gap-3 py-2">
                <p className="font-sans font-light text-[13px] text-sage">
                  ✓ Live in ~60 seconds
                </p>

                <div className="flex items-center gap-2">
                  {/* Vercel triangle */}
                  <div className="w-5 h-5 bg-warm-black rounded flex items-center justify-center flex-shrink-0">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2L2 19.8h20L12 2z" />
                    </svg>
                  </div>
                  <span className="font-sans font-light text-[12px] text-muted">
                    Deploying via Vercel
                  </span>
                </div>

                {commitUrl && (
                  <a
                    href={commitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans font-light text-[11px] text-muted/60 hover:text-sage transition-colors duration-150"
                  >
                    View commit on GitHub →
                  </a>
                )}

                <button
                  onClick={handleDiscard}
                  className="font-sans font-light text-[11px] text-muted/60 hover:text-sage transition-colors duration-150 text-left"
                >
                  Make another change →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed pill */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 bg-warm-black text-cream font-sans font-light text-[12px] tracking-wide px-5 py-3 rounded-full shadow-lg hover:bg-warm-black/85 transition-colors duration-200"
      >
        <span className="animate-pulse text-[14px]">✦</span>
        <span>Edit this site</span>
      </button>

    </div>
  );
}
