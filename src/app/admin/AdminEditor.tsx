'use client';
import { useRef, useCallback } from 'react';
import AiEditor from '@/components/AiEditor';

export default function AdminEditor() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleDeployed = useCallback(() => {
    if (iframeRef.current) {
      // Reassigning src forces a reload
      iframeRef.current.src = iframeRef.current.src;
    }
  }, []);

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      {/* Top bar */}
      <div className="h-10 flex-shrink-0 bg-warm-black flex items-center justify-between px-4">
        <span className="font-sans font-light text-[12px] text-cream/90 tracking-wide">
          ✦ AI Site Editor &nbsp;—&nbsp; Live — changes go to GitHub
        </span>
        <a
          href="/"
          className="font-sans font-light text-[11px] text-cream/60 hover:text-cream transition-colors duration-150"
        >
          ← Back to site
        </a>
      </div>

      {/* Site iframe */}
      <iframe
        ref={iframeRef}
        src="/"
        className="w-full flex-1 border-none"
        title="Forever Print Design"
      />

      {/* AiEditor floats on top via its own fixed positioning */}
      <AiEditor mode="live" onDeployed={handleDeployed} />
    </div>
  );
}
