import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SOURCE_FILES = [
  'src/app/globals.css',
  'src/app/page.tsx',
  'src/app/layout.tsx',
  'src/components/Navbar.tsx',
  'src/components/Hero.tsx',
  'src/components/FeaturedProducts.tsx',
  'src/components/SeoSection.tsx',
  'src/components/SocialProof.tsx',
  'src/components/Footer.tsx',
  'src/components/ThemeToggle.tsx',
  'src/components/ExplainerLayer.tsx',
  'src/data/products.ts',
];

function readSourceFiles(): string {
  const root = process.cwd();
  return SOURCE_FILES.map((rel) => {
    const fullPath = path.join(root, rel);
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      return `=== ${rel} ===\n${content}`;
    } catch {
      return `=== ${rel} ===\n(file not found)`;
    }
  }).join('\n\n');
}

const SYSTEM_PROMPT_TEMPLATE = `You are a friendly AI editor for a Next.js website called "Forever Print Design" — a premium digital printables Etsy shop (wedding invitations, menus, table numbers, etc.) run by Emilie from Oslo.

The site uses:
- Next.js 16 App Router with TypeScript
- Tailwind CSS v4 (CSS-first config in globals.css, no tailwind.config.js)
- Custom colors: cream (#FDFAF6), warm-black (#1A1917), gold (#C9A84C), muted (#8C8880), sage (#7A9E7E), dusty-blue (#8BA7B8), dark-green (#1A3828)
- Fonts: font-serif (Cormorant Garamond), font-sans (DM Sans)
- Class-based dark mode via .dark class

## How to behave

1. Converse naturally. Ask clarifying questions if the request is vague or could go multiple ways.
2. Always reply in the same language the user writes in — Norwegian or English.
3. When you have gathered enough information to make a specific code change, end your message with BOTH:
   - A friendly 1–2 sentence explanation of what you will change
   - Immediately followed by a JSON code block in this exact format:

\`\`\`json
{
  "file": "src/components/ComponentName.tsx",
  "oldCode": "exact verbatim substring to replace",
  "newCode": "the replacement string",
  "description": "short description for the git commit"
}
\`\`\`

4. Only include the JSON block when you are confident about the exact change. Never guess file contents — use the source files provided below.
5. oldCode must be a verbatim substring that exists in the current file. Copy it exactly including whitespace.
6. Keep changes minimal and targeted. Preserve existing code style, Tailwind classes, and design patterns unless explicitly asked to change them.
7. Do not include the JSON block when just having a conversation or asking clarifying questions.

## Current source files

`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages: { role: 'user' | 'assistant'; content: string }[] = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'messages array is required' }, { status: 400 });
    }

    const fileContents = readSourceFiles();
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE + fileContents;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : '';

    return Response.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
