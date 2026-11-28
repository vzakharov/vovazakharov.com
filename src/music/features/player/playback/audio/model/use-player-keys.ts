import { useEffect } from 'react';

import type { PlayerControls } from '../../../station';

/** How far a seek key moves, in seconds. */
const SEEK_STEP = 5;

export function usePlayerKeys(controls: PlayerControls) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      // A key pressed inside a modal dialog is the dialog's — a song's video
      // takes the space bar for its own play/pause, and the song must stay
      // silent under it.
      const elsewhere =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
          target.closest('[aria-modal="true"]') !== null);

      if (elsewhere || event.metaKey || event.ctrlKey || event.altKey) return;

      const handled: Record<string, () => void> = {
        ' ': controls.toggle,
        ArrowLeft: event.shiftKey
          ? controls.previous
          : () => {
              controls.seekBy(-SEEK_STEP);
            },
        ArrowRight: event.shiftKey
          ? controls.next
          : () => {
              controls.seekBy(SEEK_STEP);
            },
      };
      const handler = handled[event.key];

      if (handler === undefined) return;

      event.preventDefault();
      handler();
    }

    globalThis.addEventListener('keydown', onKeyDown);

    return () => {
      globalThis.removeEventListener('keydown', onKeyDown);
    };
  }, [controls]);
}
