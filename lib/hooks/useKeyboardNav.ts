import { useState, useEffect, useCallback } from 'react';

interface UseKeyboardNavOptions {
  resultCount: number;
  onOpen: (index: number) => void;
  onFocusSearch: () => void;
  enabled: boolean;
}

export function useKeyboardNav({
  resultCount,
  onOpen,
  onFocusSearch,
  enabled,
}: UseKeyboardNavOptions) {
  // Track both index and the count it was set for
  const [state, setState] = useState<{ index: number; forCount: number }>({
    index: -1,
    forCount: 0,
  });

  // Reset when resultCount changes
  const activeIndex = state.forCount !== resultCount ? -1 : state.index;

  const setActiveIndex = useCallback(
    (updater: (prev: number) => number) => {
      setState((prev) => {
        const base = prev.forCount !== resultCount ? -1 : prev.index;
        return { index: updater(base), forCount: resultCount };
      });
    },
    [resultCount]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';

      if (e.key === 'Escape') {
        if (isInput) {
          (target as HTMLInputElement).blur();
        } else {
          setActiveIndex(() => -1);
        }
        return;
      }

      if (isInput) return;
      if (resultCount === 0) return;

      if (e.key === 'j') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, resultCount - 1));
      } else if (e.key === 'k') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        onOpen(activeIndex);
      } else if (e.key === '/') {
        e.preventDefault();
        onFocusSearch();
      }
    },
    [enabled, resultCount, activeIndex, onOpen, onFocusSearch, setActiveIndex]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { activeIndex };
}
