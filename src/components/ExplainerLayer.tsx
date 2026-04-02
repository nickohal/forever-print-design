'use client';
import { useState } from 'react';

const features = [
  "Live Etsy product sync — products update automatically from your shop",
  "AI chat editor — describe changes in plain text, site updates itself",
  "One-click deploy — every change goes live in ~60 seconds via Vercel",
  "Dark mode built in — toggle in the top right corner",
  "Mobile optimised — looks great on all screen sizes",
  "Custom domain ready — connect foreverprintdesign.com in minutes",
];

export default function ExplainerLayer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-[calc(100vw-3rem)] sm:w-80">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-serif text-warm-black text-[20px] leading-snug">
              What&apos;s possible here
            </h3>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-muted/50 hover:text-warm-black transition-colors duration-150 text-lg leading-none mt-0.5 ml-4 flex-shrink-0"
            >
              ×
            </button>
          </div>

          {/* Feature list */}
          <ul className="flex flex-col gap-3 mb-5">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-sage flex-shrink-0" />
                <span className="font-sans font-light text-[13px] text-warm-black/80 leading-relaxed">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* Footer note */}
          <p className="font-sans font-light text-[11px] text-muted/60 leading-relaxed border-t border-muted/15 pt-4">
            This panel is for demo purposes only — easily removed before launch
          </p>
        </div>
      )}

      {/* Pill toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-sage text-white font-sans font-light text-[12px] tracking-wide px-4 py-2.5 rounded-full shadow-md hover:bg-sage/90 transition-colors duration-200"
      >
        <span>💡</span>
        <span>Site features</span>
      </button>
    </div>
  );
}
