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

const SYSTEM_PROMPT = `You are an AI editor for a Next.js website called "Forever Print Design" — a premium digital printables Etsy shop (wedding invitations, menus, table numbers, etc.).

The site uses:
- Next.js 16 App Router with TypeScript
- Tailwind CSS v4 (CSS-first config in globals.css, no tailwind.config.js)
- Custom colors: cream (#FDFAF6), warm-black (#1A1917), gold (#C9A84C), muted (#8C8880), sage (#7A9E7E), dusty-blue (#8BA7B8), dark-green (#1A3828)
- Fonts: font-serif (Cormorant Garamond), font-sans (DM Sans)
- Class-based dark mode via .dark class

The user will describe a change to make. You must respond with a JSON object (no markdown, no explanation — raw JSON only) with exactly this shape:
{
  "file": "src/components/ComponentName.tsx",
  "oldCode": "exact string to find and replace in the file",
  "newCode": "the replacement string",
  "description": "short description of the change (used as git commit message suffix)"
}

Rules:
- oldCode must be a verbatim substring of the current file content — copy it exactly
- oldCode should be the minimal unique excerpt needed to identify the change location
- newCode should use the same indentation and code style as the rest of the file
- Only change one file at a time
- Preserve all existing Tailwind classes and design patterns unless the user explicitly asks to change them
- Do not add comments or docstrings

Current source files:`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'message is required' }, { status: 400 });
    }

    const fileContents = readSourceFiles();
    const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n${fileContents}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: fullSystemPrompt,
      messages: [{ role: 'user', content: message }],
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Strip markdown code fences if the model wraps the JSON
    const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    let parsed: { file: string; oldCode: string; newCode: string; description: string };
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return Response.json({ error: 'Model returned invalid JSON', raw: rawText }, { status: 500 });
    }

    const required = ['file', 'oldCode', 'newCode', 'description'];
    for (const key of required) {
      if (typeof parsed[key as keyof typeof parsed] !== 'string') {
        return Response.json({ error: `Missing field: ${key}`, raw: rawText }, { status: 500 });
      }
    }

    return Response.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
