import type { CanDispose } from '@/kernel/shared/typings';

import type { Scrub, Scrubbing } from '../lib/day';

/** The scrub keys by `KeyboardEvent.code`: `[` back, `]` forward, on every layout. */
export const SCRUBS: Readonly<Record<string, Scrub>> = {
  BracketLeft: -1,
  BracketRight: 1,
};

/** Pauses the clock, and runs it again. */
export const PAUSE = 'KeyT';

export type TimeKeys = CanDispose & {
  /**
   * The keys since the last read: which way a held scrub key moves the clock,
   * fast with Shift, and whether the pause key was pressed meanwhile, which
   * the read then clears. One read a frame.
   */
  readonly read: () => Scrubbing & { readonly toggled: boolean };
};

/** Binds the clock's keys on `element`'s window, none of them a key the eye holds. */
export function bindTimeKeys(element: HTMLElement): TimeKeys {
  const view = element.ownerDocument.defaultView ?? globalThis;
  const held = new Set<string>();
  let fast = false;
  let toggled = false;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    fast = event.shiftKey;
    if (event.code === PAUSE) {
      event.preventDefault();
      if (!event.repeat) toggled = !toggled;
      return;
    }
    if (!(event.code in SCRUBS)) return;
    event.preventDefault();
    held.add(event.code);
  };
  const onKeyUp = (event: KeyboardEvent) => {
    fast = event.shiftKey;
    held.delete(event.code);
  };
  const onBlur = () => {
    held.clear();
  };

  const bound = new AbortController();
  const { signal } = bound;
  view.addEventListener('keydown', onKeyDown, { signal });
  view.addEventListener('keyup', onKeyUp, { signal });
  view.addEventListener('blur', onBlur, { signal });

  return {
    read: () => {
      let sum = 0;
      for (const code of held) sum += SCRUBS[code] ?? 0;
      const scrub: Scrub = sum > 0 ? 1 : sum < 0 ? -1 : 0;
      const keys = { scrub, fast, toggled };
      toggled = false;
      return keys;
    },
    dispose: () => {
      bound.abort();
    },
  };
}
