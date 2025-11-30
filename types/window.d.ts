import type { SearchAPIResponse } from '@/lib/you-search';

declare global {
  interface Window {
    lastSearchData?: SearchAPIResponse;
  }
}

export {};
