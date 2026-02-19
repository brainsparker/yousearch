export interface BangResult {
  cleanQuery: string;
  freshness?: string;
  country?: string;
  safesearch?: string;
  count?: number;
  isNews?: boolean;
  activeBangs: string[];
}

const FRESHNESS_BANGS: Record<string, string> = {
  '!day': 'day',
  '!week': 'week',
  '!month': 'month',
  '!year': 'year',
};

const COUNTRY_BANGS: Record<string, string> = {
  '!us': 'US',
  '!gb': 'GB',
  '!de': 'DE',
  '!fr': 'FR',
  '!jp': 'JP',
  '!ca': 'CA',
};

const SAFESEARCH_BANGS: Record<string, string> = {
  '!strict': 'strict',
  '!safe': 'strict',
};

const COUNT_BANGS: Record<string, number> = {
  '!10': 10,
  '!20': 20,
  '!50': 50,
};

export function parseBangs(query: string): BangResult {
  const tokens = query.split(/\s+/);
  const cleanTokens: string[] = [];
  const activeBangs: string[] = [];
  let freshness: string | undefined;
  let country: string | undefined;
  let safesearch: string | undefined;
  let count: number | undefined;
  let isNews = false;

  for (const token of tokens) {
    const lower = token.toLowerCase();

    if (FRESHNESS_BANGS[lower]) {
      freshness = FRESHNESS_BANGS[lower];
      activeBangs.push(lower);
    } else if (COUNTRY_BANGS[lower]) {
      country = COUNTRY_BANGS[lower];
      activeBangs.push(lower);
    } else if (SAFESEARCH_BANGS[lower]) {
      safesearch = SAFESEARCH_BANGS[lower];
      activeBangs.push(lower);
    } else if (COUNT_BANGS[lower]) {
      count = COUNT_BANGS[lower];
      activeBangs.push(lower);
    } else if (lower === '!news') {
      isNews = true;
      activeBangs.push(lower);
    } else {
      cleanTokens.push(token);
    }
  }

  return {
    cleanQuery: cleanTokens.join(' '),
    freshness,
    country,
    safesearch,
    count,
    isNews,
    activeBangs,
  };
}
