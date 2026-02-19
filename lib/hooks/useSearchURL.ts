import type { FilterValues } from '@/components/search/SearchFilters';

interface SearchParams {
  q: string;
  freshness?: string;
  country?: string;
  safesearch?: string;
}

export function getSearchParams(): { query: string; filters: FilterValues } {
  const params = new URLSearchParams(window.location.search);
  return {
    query: params.get('q') || params.get('query') || '',
    filters: {
      freshness: params.get('freshness') || '',
      country: params.get('country') || '',
      safesearch: params.get('safesearch') || 'moderate',
    },
  };
}

export function setSearchParams(params: SearchParams) {
  const url = new URLSearchParams();
  if (params.q) url.set('q', params.q);
  if (params.freshness) url.set('freshness', params.freshness);
  if (params.country) url.set('country', params.country);
  if (params.safesearch && params.safesearch !== 'moderate') {
    url.set('safesearch', params.safesearch);
  }

  const search = url.toString();
  const newUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;
  history.pushState(null, '', newUrl);
}
