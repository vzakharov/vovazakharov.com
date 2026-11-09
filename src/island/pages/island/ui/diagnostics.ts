import { whereFields } from '../lib/where-line';
import type { IslandScene } from './island-scene';

/** Toggles the diagnostics panel, by `KeyboardEvent.code`: `I`, for info, on every layout. */
export const DIAGNOSTICS_KEY = 'KeyI';

/** How often the open panel reads the scene again, ms. */
const REFRESH_MS = 250;

/** The panel's rows: the where-line's fields and the smoothed frame time. */
const rowsOf = (scene: IslandScene, frameMs: number) => [
  ...whereFields(scene.where()),
  `frame ${frameMs.toFixed(1)} ms`,
];

/**
 * Lets the player open a panel of what the where-line copies, and the frame
 * time, over the view: `I` toggles it. While it is open `onRows` is told the
 * rows every `REFRESH_MS` from the first drawn frame on, and `null` when it
 * closes; closed, nothing reads the scene. Returns the uninstaller.
 */
export function installDiagnostics(
  scene: IslandScene,
  element: HTMLElement,
  onRows: (rows: readonly string[] | null) => void,
): () => void {
  const view = element.ownerDocument.defaultView ?? globalThis;
  let refresh: ReturnType<typeof setInterval> | undefined;

  const show = () => {
    const frameMs = scene.frameMs();
    if (frameMs !== undefined) onRows(rowsOf(scene, frameMs));
  };

  const toggle = () => {
    if (refresh === undefined) {
      show();
      refresh = setInterval(show, REFRESH_MS);
      return;
    }
    clearInterval(refresh);
    refresh = undefined;
    onRows(null);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.code !== DIAGNOSTICS_KEY || event.repeat) return;
    event.preventDefault();
    toggle();
  };

  const bound = new AbortController();
  const { signal } = bound;
  view.addEventListener('keydown', onKeyDown, { signal });
  return () => {
    bound.abort();
    clearInterval(refresh);
  };
}
