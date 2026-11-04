'use client';

import { useSyncExternalStore } from 'react';

const COARSE = '(pointer: coarse)';

function subscribe(changed: () => void) {
  const query = globalThis.matchMedia(COARSE);

  query.addEventListener('change', changed);

  return () => {
    query.removeEventListener('change', changed);
  };
}

const sheetHere = () =>
  globalThis.matchMedia(COARSE).matches &&
  typeof navigator.canShare === 'function';

/**
 * Whether the popover's buttons hand the link or the card to the system's
 * share sheet rather than the clipboard: a touch screen, a phone in practice,
 * whose browser shares files.
 */
export const useShareSheet = () =>
  useSyncExternalStore(subscribe, sheetHere, () => false);
