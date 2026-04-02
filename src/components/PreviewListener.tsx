'use client';
import { useEffect } from 'react';

export default function PreviewListener() {
  useEffect(() => {
    const originalTexts = new Map<Element, string>();

    function handleMessage(e: MessageEvent) {
      if (e.data.type === 'preview-css') {
        let style = document.getElementById('preview-overrides');
        if (!style) {
          style = document.createElement('style');
          style.id = 'preview-overrides';
          document.head.appendChild(style);
        }
        style.textContent = e.data.css;
      }

      if (e.data.type === 'preview-text') {
        document.querySelectorAll('[data-preview-id]').forEach((el) => {
          const current = el.textContent ?? '';
          if (current.includes(e.data.oldText)) {
            if (!originalTexts.has(el)) {
              originalTexts.set(el, current);
            }
            el.textContent = e.data.newText;
          }
        });
      }

      if (e.data.type === 'preview-reset') {
        document.getElementById('preview-overrides')?.remove();
        originalTexts.forEach((text, el) => {
          el.textContent = text;
        });
        originalTexts.clear();
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return null;
}
