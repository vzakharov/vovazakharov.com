import type { CanDispose } from '@/kernel/shared/typings';

/** Turns the fine look on and off, by `KeyboardEvent.code`: `B`, on every layout. */
export const FINE_KEY = 'KeyB';

/** Calls `onToggle` on each press of `FINE_KEY` on `element`'s window, a held key once. */
export function bindFineKey(
  element: HTMLElement,
  onToggle: () => void,
): CanDispose {
  const view = element.ownerDocument.defaultView ?? globalThis;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.code !== FINE_KEY || event.repeat) return;
    event.preventDefault();
    onToggle();
  };
  const bound = new AbortController();
  const { signal } = bound;
  view.addEventListener('keydown', onKeyDown, { signal });
  return {
    dispose: () => {
      bound.abort();
    },
  };
}
