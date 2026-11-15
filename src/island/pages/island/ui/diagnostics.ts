import { paceFields } from '../lib/pace';
import { formatPlace } from '../lib/place-hash';
import { shareLink, whereFields } from '../lib/where-line';
import type { IslandScene } from './island-scene';

/** Toggles the diagnostics panel, by `KeyboardEvent.code`: `I`, for info, on every layout. */
export const DIAGNOSTICS_KEY = 'KeyI';

/** How often the open panel reads the scene again, ms. */
const REFRESH_MS = 250;

/** How a copy of the share link went: the link, and the error the clipboard gave if it refused. */
export type Copied =
  | { readonly link: string; readonly ok: true }
  | { readonly link: string; readonly ok: false; readonly error: Error };

/** What the open panel shows, and what its button does. */
export type Panel = {
  readonly rows: readonly string[];
  /**
   * Writes the view's share link into the address bar, without a history
   * entry or a `hashchange`, and onto the clipboard; resolves with how the
   * copy went, never rejecting.
   */
  readonly copyLink: () => Promise<Copied>;
};

/**
 * Lets the player open a panel over the view of what reproduces it, the
 * eye's height over the sea, its speed and the frame time, with a button
 * copying the view's share link: `I` toggles it. While it is open `onPanel`
 * is told it every `REFRESH_MS` from the first drawn frame on, and `null`
 * when it closes; closed, nothing reads the scene. Returns the uninstaller.
 */
export function installDiagnostics(
  scene: IslandScene,
  element: HTMLElement,
  onPanel: (panel: Panel | null) => void,
): () => void {
  const view = element.ownerDocument.defaultView ?? globalThis;
  let refresh: ReturnType<typeof setInterval> | undefined;

  const copyLink = async (): Promise<Copied> => {
    const where = scene.where();
    view.history.replaceState(view.history.state, '', formatPlace(where.place));
    const link = shareLink(where.page, where.place);
    try {
      await view.navigator.clipboard.writeText(link);
      return { link, ok: true };
    } catch (error) {
      // A page with no clipboard (no secure context) fails here too, as a TypeError.
      const cause = error instanceof Error ? error : new Error(String(error));
      return { link, ok: false, error: cause };
    }
  };

  const show = () => {
    const pace = scene.pace();
    if (pace === undefined) return;
    onPanel({
      rows: [...whereFields(scene.where()), ...paceFields(pace)],
      copyLink,
    });
  };

  const toggle = () => {
    if (refresh === undefined) {
      show();
      refresh = setInterval(show, REFRESH_MS);
      return;
    }
    clearInterval(refresh);
    refresh = undefined;
    onPanel(null);
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
