import type { SearchResult } from '@/lib/you-search';

export function formatResultsAsMarkdown(
  results: SearchResult[],
  newsResults?: SearchResult[]
): string {
  const lines: string[] = [];

  results.forEach((result, i) => {
    lines.push(`${i + 1}. [${result.title}](${result.url})`);
    if (result.description) {
      lines.push(`   ${result.description}`);
    }
    if (result.snippets && result.snippets.length > 0) {
      lines.push(`   > ${result.snippets[0]}`);
    }
    lines.push('');
  });

  if (newsResults && newsResults.length > 0) {
    lines.push('## News');
    lines.push('');
    newsResults.forEach((result, i) => {
      lines.push(`${i + 1}. [${result.title}](${result.url})`);
      if (result.description) {
        lines.push(`   ${result.description}`);
      }
      lines.push('');
    });
  }

  return lines.join('\n').trim();
}
