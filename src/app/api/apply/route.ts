import { NextRequest } from 'next/server';

interface ApplyBody {
  file: string;
  oldCode: string;
  newCode: string;
  description: string;
}

const GITHUB_API = 'https://api.github.com';

async function getFile(repo: string, filePath: string, token: string) {
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${filePath}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub GET ${filePath} → ${res.status}: ${body}`);
  }
  const data = await res.json();
  return { sha: data.sha as string, content: Buffer.from(data.content, 'base64').toString('utf-8') };
}

async function putFile(
  repo: string,
  filePath: string,
  content: string,
  sha: string,
  message: string,
  token: string,
): Promise<string> {
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      sha,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub PUT ${filePath} → ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.commit?.html_url ?? `https://github.com/${repo}/commits/main`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ApplyBody = await request.json();
    const { file, oldCode, newCode, description } = body;

    if (!file || !oldCode || !newCode || !description) {
      return Response.json(
        { error: 'Missing required fields: file, oldCode, newCode, description' },
        { status: 400 },
      );
    }

    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    if (!token || !repo) {
      return Response.json({ error: 'GITHUB_TOKEN or GITHUB_REPO not configured' }, { status: 500 });
    }

    // Normalise to forward slashes for the GitHub API path
    const filePath = file.replace(/\\/g, '/');

    // 1. Fetch current content + SHA from GitHub
    const { sha, content: currentContent } = await getFile(repo, filePath, token);

    // 2. Verify oldCode is present
    if (!currentContent.includes(oldCode)) {
      return Response.json(
        { error: 'oldCode not found in file — the file may have changed since the suggestion was generated' },
        { status: 409 },
      );
    }

    // 3. Apply replacement (first occurrence only)
    const updatedContent = currentContent.replace(oldCode, newCode);

    // 4. Push back to GitHub
    const commitUrl = await putFile(repo, filePath, updatedContent, sha, `AI edit: ${description}`, token);

    return Response.json({ success: true, commitUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
