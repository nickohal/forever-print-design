'use client';
import { useState, useRef, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PendingChange {
  file: string;
  oldCode: string;
  newCode: string;
  description: string;
}

type ProposalState = 'pending' | 'previewed' | 'approved' | 'discarded';

type Message =
  | { type: 'chat'; role: 'user' | 'assistant'; content: string }
  | { type: 'proposal'; change: PendingChange; state: ProposalState };

interface Props {
  mode: 'demo' | 'live';
  onPreview: (change: PendingChange) => void;
  onApprove: (change: PendingChange) => void;
  onDiscard?: (change: PendingChange) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STARTER_CHIPS = ['Endre overskriften', 'Oppdater farger', 'Legg til et produkt', 'Forbedre SEO-teksten'];

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function extractProposal(text: string): { cleanText: string; proposal: PendingChange | null } {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (!match) return { cleanText: text.trim(), proposal: null };
  try {
    const parsed = JSON.parse(match[1].trim());
    if (parsed.file && parsed.oldCode && parsed.newCode && parsed.description) {
      const cleanText = text.replace(/```json[\s\S]*?```/, '').trim();
      return { cleanText, proposal: parsed as PendingChange };
    }
    return { cleanText: text.trim(), proposal: null };
  } catch {
    return { cleanText: text.trim(), proposal: null };
  }
}

// ─── Proposal card ────────────────────────────────────────────────────────────

function ProposalCard({
  change,
  state,
  onPreview,
  onApprove,
  onDiscard,
}: {
  change: PendingChange;
  state: ProposalState;
  onPreview: () => void;
  onApprove: () => void;
  onDiscard: () => void;
}) {
  if (state === 'discarded') {
    return (
      <div className="w-full bg-muted/5 border border-muted/10 rounded-lg p-3 opacity-50">
        <p className="font-sans font-light text-[11px] text-muted">Forkastet</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-sage/10 border border-sage/20 rounded-lg p-4 flex flex-col gap-2.5">
      <p className="font-sans font-light text-[9px] uppercase tracking-[0.2em] text-sage">
        ✦ Proposed change
      </p>

      <p className="font-mono text-[10px] text-muted bg-muted/10 px-2 py-1 rounded break-all">
        {change.file}
      </p>

      <div className="flex flex-col gap-1.5">
        <p className="font-sans font-light text-[11px] text-muted line-through leading-relaxed break-words">
          {truncate(change.oldCode, 120)}
        </p>
        <p className="font-sans font-light text-[11px] text-sage leading-relaxed break-words">
          {truncate(change.newCode, 120)}
        </p>
      </div>

      {state === 'approved' ? (
        <p className="font-sans font-light text-[11px] text-sage">✓ Klar til publisering</p>
      ) : (
        <div className="flex gap-2 pt-0.5 flex-wrap">
          {state !== 'previewed' && (
            <button
              onClick={onPreview}
              className="font-sans font-light text-[11px] text-warm-black border border-muted/25 rounded px-3 py-1.5 hover:border-sage hover:text-sage transition-colors duration-150"
            >
              👁 Preview
            </button>
          )}
          {state === 'previewed' && (
            <span className="font-sans font-light text-[10px] text-sage/70 flex items-center gap-1 px-2 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sage/60" />
              Forhåndsvisning aktiv
            </span>
          )}
          <button
            onClick={onApprove}
            className="font-sans font-light text-[11px] text-white bg-sage rounded px-3 py-1.5 hover:bg-sage/85 transition-colors duration-150"
          >
            ✓ Legg til
          </button>
          <button
            onClick={onDiscard}
            className="font-sans font-light text-[11px] text-muted/60 hover:text-red-500 transition-colors duration-150 px-2 py-1.5"
          >
            ✗ Forkast
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Thinking dots ────────────────────────────────────────────────────────────

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

export default function AiEditor({ mode, onPreview, onApprove, onDiscard }: Props) {
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

  // Build the conversation history for the API (chat messages only)
  const apiHistory = (msgs: Message[]) =>
    msgs.filter((m): m is Message & { type: 'chat' } => m.type === 'chat').map((m) => ({ role: m.role, content: m.content }));

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { type: 'chat', role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setLoading(true);

    if (mode === 'demo') {
      setTimeout(() => {
        const fakeProposal: PendingChange = {
          file: 'src/components/Hero.tsx',
          oldCode: 'Designed for your most cherished moments',
          newCode: 'Created for the moments that last forever',
          description: 'Update hero headline',
        };
        setMessages((prev) => [
          ...prev,
          { type: 'chat', role: 'assistant', content: 'Jeg kan oppdatere overskriften i hero-seksjonen. Her er forslaget:' },
          { type: 'proposal', change: fakeProposal, state: 'pending' },
        ]);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiHistory(next) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [...prev, { type: 'chat', role: 'assistant', content: `Feil: ${data.error ?? 'Noe gikk galt'}` }]);
        setLoading(false);
        return;
      }
      const { cleanText, proposal } = extractProposal(data.reply as string);
      const newMsgs: Message[] = [];
      if (cleanText) newMsgs.push({ type: 'chat', role: 'assistant', content: cleanText });
      if (proposal) newMsgs.push({ type: 'proposal', change: proposal, state: 'pending' });
      setMessages((prev) => [...prev, ...newMsgs]);
    } catch {
      setMessages((prev) => [...prev, { type: 'chat', role: 'assistant', content: 'Nettverksfeil — prøv igjen.' }]);
    }
    setLoading(false);
  };

  const updateProposal = (index: number, state: ProposalState) => {
    setMessages((prev) =>
      prev.map((m, i) => (i === index && m.type === 'proposal' ? { ...m, state } : m)),
    );
  };

  const handlePreviewClick = (index: number, change: PendingChange) => {
    updateProposal(index, 'previewed');
    onPreview(change);
  };

  const handleApproveClick = (index: number, change: PendingChange) => {
    updateProposal(index, 'approved');
    onApprove(change);
  };

  const handleDiscardClick = (index: number, change: PendingChange) => {
    updateProposal(index, 'discarded');
    onDiscard?.(change);
  };

  const showChips = messages.length === 0 && !loading;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-muted/10 flex-shrink-0">
        <h3 className="font-serif text-warm-black text-[17px] leading-none">AI Editor</h3>
        <p className="font-sans font-light text-[11px] text-muted/60 mt-1">
          Preview er umiddelbar · Deploy når du er klar
        </p>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
        {messages.length === 0 && !loading && (
          <p className="font-sans font-light text-[13px] text-muted/50 text-center py-8">
            Beskriv en endring, så hjelper jeg deg.
          </p>
        )}

        {messages.map((msg, i) => {
          if (msg.type === 'chat') {
            return (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`px-3.5 py-2.5 rounded-lg text-[14px] font-sans font-light leading-relaxed max-w-[85%] ${
                    msg.role === 'user' ? 'bg-sage text-white' : 'bg-[#F8F6F3] text-warm-black'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          }
          // Proposal card
          return (
            <div key={i} className="max-w-[95%]">
              <ProposalCard
                change={msg.change}
                state={msg.state}
                onPreview={() => handlePreviewClick(i, msg.change)}
                onApprove={() => handleApproveClick(i, msg.change)}
                onDiscard={() => handleDiscardClick(i, msg.change)}
              />
            </div>
          );
        })}

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
          placeholder="Beskriv en endring..."
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
  );
}
