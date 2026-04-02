'use client';
import { useState, useRef, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant';

interface Proposal {
  file: string;
  oldCode: string;
  newCode: string;
  description: string;
}

type DeployState = 'idle' | 'deploying' | 'deployed' | 'error';

interface ProposalState {
  proposal: Proposal;
  deployState: DeployState;
  commitUrl?: string;
  error?: string;
}

interface Message {
  role: Role;
  content: string;
  proposalState?: ProposalState;
}

interface Props {
  mode?: 'demo' | 'live';
  onDeployed?: () => void;
  defaultOpen?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STARTER_CHIPS = ['Change the headline', 'Update colours', 'Add a product'];

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function extractProposal(text: string): { cleanText: string; proposal: Proposal | null } {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (!match) return { cleanText: text.trim(), proposal: null };
  try {
    const proposal = JSON.parse(match[1].trim()) as Proposal;
    const cleanText = text.replace(/```json[\s\S]*?```/, '').trim();
    return { cleanText, proposal };
  } catch {
    return { cleanText: text.trim(), proposal: null };
  }
}

// ─── Proposal card ────────────────────────────────────────────────────────────

function ProposalCard({
  state,
  onDeploy,
  onRefine,
}: {
  state: ProposalState;
  onDeploy: () => void;
  onRefine: () => void;
}) {
  const { proposal, deployState, commitUrl, error } = state;

  return (
    <div className="w-full bg-sage/10 border border-sage/20 rounded-lg p-3.5 flex flex-col gap-2.5">
      <p className="font-sans font-light text-[9px] uppercase tracking-[0.2em] text-sage">
        ✦ Proposed change
      </p>
      <p className="font-mono text-[10px] text-muted bg-muted/10 px-2 py-1 rounded break-all">
        {proposal.file}
      </p>
      <div className="flex flex-col gap-1.5">
        <p className="font-sans font-light text-[11px] text-muted line-through leading-relaxed break-words">
          {truncate(proposal.oldCode, 120)}
        </p>
        <p className="font-sans font-light text-[11px] text-sage leading-relaxed break-words">
          {truncate(proposal.newCode, 120)}
        </p>
      </div>

      {deployState === 'idle' && (
        <div className="flex gap-2 pt-0.5 flex-wrap">
          <button
            onClick={onRefine}
            className="font-sans font-light text-[11px] text-warm-black border border-muted/25 rounded px-3 py-1.5 hover:border-muted/50 transition-colors duration-150"
          >
            Refine this →
          </button>
          <button
            onClick={onDeploy}
            className="font-sans font-light text-[11px] text-white bg-sage rounded px-3 py-1.5 hover:bg-sage/85 transition-colors duration-150"
          >
            Looks good — deploy ↗
          </button>
        </div>
      )}

      {deployState === 'deploying' && (
        <div className="flex items-center gap-1.5">
          <span className="font-sans font-light text-[11px] text-muted">Deploying</span>
          <span className="inline-flex gap-[3px]">
            {[0, 150, 300].map((d) => (
              <span key={d} className="w-1 h-1 rounded-full bg-muted/50 animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </span>
        </div>
      )}

      {deployState === 'deployed' && (
        <div className="flex flex-col gap-1.5">
          <p className="font-sans font-light text-[11px] text-sage">✓ Live in ~60 seconds</p>
          {commitUrl && commitUrl !== '#' && (
            <a
              href={commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans font-light text-[10px] text-muted/60 hover:text-sage transition-colors duration-150"
            >
              View commit on GitHub →
            </a>
          )}
        </div>
      )}

      {deployState === 'error' && (
        <p className="font-sans font-light text-[11px] text-red-500">{error}</p>
      )}
    </div>
  );
}

// ─── Loading dots ─────────────────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <span className="font-sans font-light text-[13px] text-muted">Thinking</span>
      <span className="inline-flex gap-[3px]">
        {[0, 150, 300].map((d) => (
          <span key={d} className="w-1 h-1 rounded-full bg-muted/50 animate-bounce" style={{ animationDelay: `${d}ms` }} />
        ))}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AiEditor({ mode = 'demo', onDeployed, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setLoading(true);

    if (mode === 'demo') {
      setTimeout(() => {
        const fakeProp: Proposal = {
          file: 'src/components/Hero.tsx',
          oldCode: 'Designed for your most cherished moments',
          newCode: 'Created for the moments that last forever',
          description: 'Update hero headline',
        };
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: "I can update the headline in the Hero section. Here's what I'd change:",
            proposalState: { proposal: fakeProp, deployState: 'idle' },
          },
        ]);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${data.error ?? 'Something went wrong'}` },
        ]);
        setLoading(false);
        return;
      }
      const { cleanText, proposal } = extractProposal(data.reply as string);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: cleanText,
          proposalState: proposal ? { proposal, deployState: 'idle' } : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Network error — please try again.' },
      ]);
    }
    setLoading(false);
  };

  const handleDeploy = async (msgIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg.proposalState) return;

    const update = (patch: Partial<ProposalState>) =>
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex ? { ...m, proposalState: { ...m.proposalState!, ...patch } } : m,
        ),
      );

    update({ deployState: 'deploying' });

    if (mode === 'demo') {
      setTimeout(() => {
        update({ deployState: 'deployed', commitUrl: '#' });
        onDeployed?.();
      }, 1500);
      return;
    }

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg.proposalState.proposal),
      });
      const data = await res.json();
      if (!res.ok) {
        update({ deployState: 'error', error: data.error ?? 'Deploy failed' });
        return;
      }
      update({ deployState: 'deployed', commitUrl: data.commitUrl });
      onDeployed?.();
    } catch {
      update({ deployState: 'error', error: 'Network error — please try again' });
    }
  };

  const handleRefine = () => {
    setInput("I'd like to refine this: ");
    setTimeout(() => {
      inputRef.current?.focus();
      const len = inputRef.current?.value.length ?? 0;
      inputRef.current?.setSelectionRange(len, len);
    }, 0);
  };

  const showChips = messages.length === 0 && !loading;

  return (
    <>
      {/* ── Chat window (mobile: full-screen overlay; desktop: anchored card) ── */}
      {open && (
        <div
          className={[
            // Mobile: full screen
            'fixed inset-0 z-50 flex flex-col bg-white',
            // Desktop: card anchored bottom-left
            'md:inset-auto md:bottom-[calc(1.5rem+3.5rem)] md:left-6',
            'md:w-[480px] md:max-h-[80vh] md:rounded-2xl md:shadow-xl',
          ].join(' ')}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-muted/10 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <h3 className="font-serif text-warm-black text-[17px] leading-none">
                Site Editor
              </h3>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                <span className="font-sans font-light text-[10px] text-sage uppercase tracking-[0.15em]">
                  Live
                </span>
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-muted/40 hover:text-warm-black transition-colors duration-150 text-2xl leading-none w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
            {messages.length === 0 && !loading && (
              <p className="font-sans font-light text-[13px] text-muted/60 text-center py-8">
                Describe a change and I&apos;ll help you update the site.
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.content && (
                  <div
                    className={`px-3.5 py-2.5 rounded-lg text-[14px] font-sans font-light leading-relaxed max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-sage text-white'
                        : 'bg-[#F8F6F3] text-warm-black'
                    }`}
                  >
                    {msg.content}
                  </div>
                )}
                {msg.proposalState && (
                  <div className="w-full max-w-[92%]">
                    <ProposalCard
                      state={msg.proposalState}
                      onDeploy={() => handleDeploy(i)}
                      onRefine={handleRefine}
                    />
                  </div>
                )}
              </div>
            ))}
            {loading && <ThinkingDots />}
            <div ref={bottomRef} />
          </div>

          {/* Starter chips */}
          {showChips && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {STARTER_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  className="font-sans font-light text-[11px] text-sage bg-sage/10 rounded-full px-3 py-1.5 hover:bg-sage/20 transition-colors duration-150"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="px-4 py-3 border-t border-muted/10 flex gap-2 items-end flex-shrink-0">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Describe a change..."
              className="flex-1 font-sans font-light text-[14px] text-warm-black placeholder:text-muted/35 bg-transparent resize-none focus:outline-none leading-relaxed"
              style={{ minHeight: '22px', maxHeight: '96px' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              aria-label="Send"
              className="font-sans text-[20px] text-sage hover:text-sage/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 flex-shrink-0 leading-none pb-0.5"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* ── Pill (always fixed bottom-left; hidden on mobile when chat is open) ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          'fixed bottom-6 left-6 z-50',
          'flex items-center gap-2.5',
          'bg-warm-black text-cream font-sans font-light text-[12px] tracking-wide',
          'px-5 py-3 rounded-full shadow-lg',
          'hover:bg-warm-black/85 transition-colors duration-200',
          open ? 'hidden md:flex' : 'flex',
        ].join(' ')}
      >
        <span className="animate-pulse text-[14px]">✦</span>
        <span>Edit this site</span>
      </button>
    </>
  );
}
