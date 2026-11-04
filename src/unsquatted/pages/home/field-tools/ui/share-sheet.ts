'use client';

import {
  useEffect,
  useEffectEvent,
  useState,
  useSyncExternalStore,
} from 'react';

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
 * Whether the share button hands the card straight to the system's share
 * sheet rather than opening the popover: a touch screen, a phone in practice,
 * whose browser shares files.
 */
export const useShareSheet = () =>
  useSyncExternalStore(subscribe, sheetHere, () => false);

type Drawn = { key: string; file: File };

/**
 * The card for `key`, drawn by `draw` before anyone asks for it: a share
 * started after an await may have outlived the tap that allows it. `key`
 * names what the card shows, so the card is drawn afresh when it changes and
 * a drawing for an older key is never returned.
 */
export function useDrawnAhead(
  key: string | undefined,
  draw: (() => Promise<File>) | undefined,
  enabled: boolean,
): File | undefined {
  const [drawn, setDrawn] = useState<Drawn>();
  // The drawing of the render the key changed in, not of the one it changed from.
  const latestDraw = useEffectEvent(() => draw);

  useEffect(() => {
    const drawing = latestDraw();

    if (!enabled || key === undefined || drawing === undefined) return;
    let current = true;

    drawing().then(
      (file) => {
        if (current) setDrawn({ key, file });
      },
      (error: unknown) => {
        reportError(error);
      },
    );

    return () => {
      current = false;
    };
  }, [key, enabled]);

  return drawn?.key === key ? drawn?.file : undefined;
}
