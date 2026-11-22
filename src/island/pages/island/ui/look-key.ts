import type { CanDispose } from '@/kernel/shared/typings';

/** Steps to the next look, by `KeyboardEvent.code`: `B`, on every layout. */
const LOOK_KEY = 'KeyB';

/** Calls `onStep` on each press of `LOOK_KEY` on `element`'s window, a held key once. */
export function bindLookKey(
  element: HTMLElement,
  onStep: () => void,
): CanDispose {
  const view = element.ownerDocument.defaultView ?? globalThis;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.code !== LOOK_KEY || event.repeat) return;
    event.preventDefault();
    onStep();
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
