import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

interface ApplyBody {
  file: string;
  oldCode: string;
  newCode: string;
  description: string;
}

// Resolve a relative project path like "src/components/Hero.tsx" to an absolute path
// and guard against path traversal outside the project root.
function resolveProjectPath(rel: string): string {
  const root = process.cwd();
  const resolved = path.resolve(root, rel);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error('Path traversal attempt detected');
  }
  return resolved;
}

// Convert an absolute local path to the GitHub API path (relative, forward slashes)
function toGitHubPath(rel: string): string {
  return rel.replace(/\\/g, '/');
}

async function getFileSha(githubPath: string, token: string, repo: string): Promise<string> {
  const url = `https://api.github.com/repos/${repo}/contents/${githubPath}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub GET ${url} → ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.sha as string;
}

async function pushFileToGitHub(
  githubPath: string,
  content: string,
  sha: string,
  commitMessage: string,
  token: string,
  repo: string,
): Promise<string> {
  const url = `https://api.github.com/repos/${repo}/contents/${githubPath}`;
  const encoded = Buffer.from(content, 'utf-8').toString('base64');

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: encoded,
      sha,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub PUT ${url} → ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.commit?.html_url ?? `https://github.com/${repo}/commits/main`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ApplyBody = await request.json();
    const { file, oldCode, newCode, description } = body;

    if (!file || !oldCode || !newCode || !description) {
      return Response.json({ error: 'Missing required fields: file, oldCode, newCode, description' }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    if (!token || !repo) {
      return Response.json({ error: 'GITHUB_TOKEN or GITHUB_REPO not configured' }, { status: 500 });
    }

    // 1. Read current file from disk
    const absolutePath = resolveProjectPath(file);
    let currentContent: string;
    try {
      currentContent = fs.readFileSync(absolutePath, 'utf-8');
    } catch {
      return Response.json({ error: `Could not read file: ${file}` }, { status: 404 });
    }

    // 2. Verify oldCode exists in the file
    if (!currentContent.includes(oldCode)) {
      return Response.json(
        { error: 'oldCode not found in file — the file may have changed since the suggestion was generated' },
        { status: 409 },
      );
    }

    // 3. Apply the replacement (replace first occurrence only)
    const updatedContent = currentContent.replace(oldCode, newCode);

    // 4. Write to disk
    fs.writeFileSync(absolutePath, updatedContent, 'utf-8');

    // 5. Push to GitHub via API
    const githubPath = toGitHubPath(file);
    const sha = await getFileSha(githubPath, token, repo);
    const commitUrl = await pushFileToGitHub(
      githubPath,
      updatedContent,
      sha,
      `AI edit: ${description}`,
      token,
      repo,
    );

    return Response.json({ success: true, commitUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
