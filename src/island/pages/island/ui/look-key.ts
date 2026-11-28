import type { CanDispose } from '@/kernel/shared/typings';

import { type Look, LOOKS, nextLook } from '@/island/shared/play';

/** Steps to the next look, by `KeyboardEvent.code`: `B`, on every layout. */
export const STEP_KEY = 'KeyB';

/** A digit's place in `LOOKS`, from 1, on the top row or the keypad. */
const PICK = /^(?:Digit|Numpad)([1-9])$/;

/** The look a press of `code` asks for while `current` is shown: the next one for `B`, `LOOKS`' n-th for the digit n, none for any other key. */
export function lookAsked(code: string, current: Look): Look | undefined {
  if (code === STEP_KEY) return nextLook(current);
  const place = PICK.exec(code)?.[1];
  return place === undefined ? undefined : LOOKS[Number(place) - 1];
}

/** Calls `setLook` on each press of a look key on `element`'s window that asks for a look other than `look()`, a held key once. */
export function bindLookKeys(
  element: HTMLElement,
  look: () => Look,
  setLook: (look: Look) => void,
): CanDispose {
  const view = element.ownerDocument.defaultView ?? globalThis;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    const asked = lookAsked(event.code, look());
    if (asked === undefined) return;
    event.preventDefault();
    if (asked !== look()) setLook(asked);
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
