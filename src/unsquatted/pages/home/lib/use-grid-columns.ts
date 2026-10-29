'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * How many columns `grid` lays out at its current width, `undefined` until it
 * is mounted. Read off the computed style, so the stylesheet stays the one
 * place that says how many there are.
 */
export function useGridColumns(grid: HTMLElement | null): number | undefined {
  const subscribe = useCallback(
    (notify: () => void) => {
      const observer = new ResizeObserver(notify);

      if (grid !== null) observer.observe(grid);

      return () => {
        observer.disconnect();
      };
    },
    [grid],
  );

  const read = () =>
    grid === null
      ? undefined
      : getComputedStyle(grid).gridTemplateColumns.split(' ').length;

  return useSyncExternalStore(subscribe, read, read);
}
