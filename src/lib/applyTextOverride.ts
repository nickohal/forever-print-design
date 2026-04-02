import type { PendingChange } from './types';

function stripJsx(s: string): string {
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

/**
 * Check if any change in the array targets the given component file
 * and replaces text that matches `defaultText`. Returns the override
 * text if found, otherwise the original defaultText.
 */
export function applyTextOverride(
  defaultText: string,
  componentFile: string,
  changes: PendingChange[],
): string {
  for (const change of changes) {
    if (change.file !== componentFile) continue;
    if (change.changeType === 'css-var' || change.changeType === 'component') continue;
    const oldStripped = stripJsx(change.oldCode);
    const newStripped = stripJsx(change.newCode);
    if (!oldStripped || !newStripped) continue;
    // Match if the stripped old text contains the default text
    // or the default text contains the stripped old text
    if (oldStripped.includes(defaultText) || defaultText.includes(oldStripped)) {
      return newStripped;
    }
  }
  return defaultText;
}

/**
 * Extract CSS variable overrides from globals.css changes.
 * Returns a CSS string like `:root { --color-sage: #E8B4CB; }` or empty string.
 */
/**
 * Return all changes with changeType === 'component'.
 */
export function getComponentChanges(changes: PendingChange[]): PendingChange[] {
  return changes.filter((c) => c.changeType === 'component');
}

export function extractCssOverrides(changes: PendingChange[]): string {
  const lines: string[] = [];
  for (const change of changes) {
    if (change.changeType !== 'css-var' && change.file !== 'src/app/globals.css') continue;
    if (change.changeType === 'component') continue;
    const matches = [...change.newCode.matchAll(/--([\w-]+):\s*([^;\n]+)/g)];
    for (const m of matches) {
      lines.push(`--${m[1]}: ${m[2].trim()};`);
    }
  }
  if (lines.length === 0) return '';
  return `:root { ${lines.join(' ')} }`;
}
