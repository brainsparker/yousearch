/**
 * You.com Research API — minimal reference implementation
 *
 * Returns an AI-synthesized answer with inline citations from web sources.
 * Same API key as Search. See: https://documentation.you.com/quickstart
 */

// "lite" | "standard" | "deep" | "exhaustive"
type ResearchEffort = 'lite' | 'standard' | 'deep' | 'exhaustive';

// { url: "https://react.dev/learn", title: "Quick Start – React", snippets: ["React lets you build..."] }
interface Source {
  url: string;
  title: string;
  snippets: string[];
}

// { content: "Next.js is a React framework [[1, 3]] that...", content_type: "text", sources: Source[] }
interface ResearchOutput {
  content: string;
  content_type: string;
  sources: Source[];
}

// { output: ResearchOutput }
interface ResearchResponse {
  output: ResearchOutput;
}

// "https://api.you.com/v1/research"
const RESEARCH_URL = 'https://api.you.com/v1/research';

/**
 * Call the You.com Research API and return the parsed response.
 *
 * @example
 *   const res = await research("How does React Server Components work?");
 *   console.log(res.output.content);   // Markdown answer with [[1]] citations
 *   console.log(res.output.sources);   // [{ url, title, snippets }]
 */
// research("What is Next.js?", "lite") → ResearchResponse
export async function research(
  // "What is Next.js?"
  query: string,
  // "standard"
  effort: ResearchEffort = 'standard',
  // "ydc_xxxxxxxxxxxx"
  apiKey: string = process.env.YOU_API_KEY || ''
): Promise<ResearchResponse> {
  // { input: "What is Next.js?", research_effort: "standard" }
  const body = { input: query, research_effort: effort };

  // POST https://api.you.com/v1/research  { X-API-Key: "ydc_xxx", Content-Type: "application/json" }
  const res = await fetch(RESEARCH_URL, {
    method: 'POST',
    headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  // 401 | 403 | 429 | 200
  if (!res.ok) {
    // "Research API error: 429 Too Many Requests"
    throw new Error(`Research API error: ${res.status} ${res.statusText}`);
  }

  // { output: { content: "...", content_type: "text", sources: [...] } }
  return res.json();
}

export type { ResearchEffort, Source, ResearchOutput, ResearchResponse };
