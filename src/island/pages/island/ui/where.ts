import { formatPlace } from '../lib/place-hash';
import { whereLine } from '../lib/where-line';
import type { IslandScene } from './island-scene';

/** Copies the where-line, by `KeyboardEvent.code`: `P`, for place, on every layout. */
export const WHERE_KEY = 'KeyP';

/** The `globalThis` property a console reaches the where-line by: `island.where()`. */
const CONSOLE_HOOK = 'island';

/** How a copy of the where-line went: copied, or the error the clipboard gave. */
export type Copied =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: Error };

/**
 * Lets the player take the line that reproduces their view: the `P` key, and
 * `island.where()` in the console, which also returns it. Each writes the
 * view's place into the address bar without a history entry or a
 * `hashchange`, copies the line, and tells `onCopy` how the copy went.
 * Returns the uninstaller.
 */
export function installWhere(
  scene: IslandScene,
  element: HTMLElement,
  onCopy: (copied: Copied) => void,
): () => void {
  const view = element.ownerDocument.defaultView ?? globalThis;

  const where = () => {
    const now = scene.where();
    view.history.replaceState(view.history.state, '', formatPlace(now.place));
    const line = whereLine(now);
    // Chained, so a page with no clipboard (no secure context) fails the same way.
    Promise.resolve()
      .then(async () => view.navigator.clipboard.writeText(line))
      .then(
        () => {
          onCopy({ ok: true });
        },
        (error: unknown) => {
          onCopy({
            ok: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        },
      );
    return line;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.code !== WHERE_KEY || event.repeat) return;
    event.preventDefault();
    where();
  };

  const bound = new AbortController();
  const { signal } = bound;
  view.addEventListener('keydown', onKeyDown, { signal });
  Object.assign(globalThis, { [CONSOLE_HOOK]: { where } });
  return () => {
    bound.abort();
    Reflect.deleteProperty(globalThis, CONSOLE_HOOK);
  };
}
