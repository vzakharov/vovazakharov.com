import { paceFields } from '../lib/pace';
import { formatPlace } from '../lib/place-hash';
import { shareLink, whereFields } from '../lib/where-line';
import type { IslandScene } from './island-scene-api';
import { measure, MEASURE_QUERY } from './measure';

/** Toggles the diagnostics panel, by `KeyboardEvent.code`: `I`, for info, on every layout. */
export const DIAGNOSTICS_KEY = 'KeyI';

/** How often the open panel reads the scene again, ms. */
const REFRESH_MS = 250;

/** How a copy to the clipboard went: the text, and the error the clipboard gave if it refused. */
export type Copied =
  | { readonly text: string; readonly ok: true }
  | { readonly text: string; readonly ok: false; readonly error: Error };

/** Where the measurement stands: on a reading, done with its table, or failed. */
type Measured =
  | { readonly step: string }
  | { readonly table: string }
  | { readonly error: Error };

/** What the open panel shows, and what its buttons do. */
export type Panel = {
  readonly rows: readonly string[];
  /**
   * Writes the view's share link into the address bar, without a history
   * entry or a `hashchange`, and onto the clipboard; resolves with how the
   * copy went, never rejecting.
   */
  readonly copyLink: () => Promise<Copied>;
  /** The measurement this page ran or is running; none before the first. */
  readonly measured: Measured | null;
  /** Starts a measurement, unless one is running. */
  readonly measure: () => void;
  /** Puts `table` on the clipboard, resolving as `copyLink` does. */
  readonly copyTable: (table: string) => Promise<Copied>;
};

/**
 * Lets the player open a panel over the view of what reproduces it, the
 * eye's height over the sea, its speed and the frame time, with a button
 * copying the view's share link and one measuring what each look and each of
 * `?without=`'s costs takes: `I` toggles it, and `?measure` opens it and
 * starts a measurement once the scene is up. While it is open `onPanel` is
 * told it every `REFRESH_MS` from the first drawn frame on, and `null` when it
 * closes; closed, nothing reads the scene. Returns the uninstaller.
 */
export function installDiagnostics(
  scene: IslandScene,
  canvas: HTMLCanvasElement,
  onPanel: (panel: Panel | null) => void,
): () => void {
  const view = canvas.ownerDocument.defaultView ?? globalThis;
  let refresh: ReturnType<typeof setInterval> | undefined;
  let measured: Measured | null = null;
  /** Whether `?measure` asked for a measurement no frame has started yet. */
  let measureOnLoad = new URLSearchParams(view.location.search).has(
    MEASURE_QUERY,
  );

  const toClipboard = async (text: string): Promise<Copied> => {
    try {
      await view.navigator.clipboard.writeText(text);
      return { text, ok: true };
    } catch (error) {
      // A page with no clipboard (no secure context) fails here too, as a TypeError.
      const cause = error instanceof Error ? error : new Error(String(error));
      return { text, ok: false, error: cause };
    }
  };

  const copyLink = async (): Promise<Copied> => {
    const where = scene.where();
    view.history.replaceState(view.history.state, '', formatPlace(where.place));
    return toClipboard(shareLink(where.page, where.place));
  };

  const heading = () => [
    ...whereFields(scene.where()),
    `backend ${scene.backend()}, canvas ${String(canvas.width)}×${String(canvas.height)} device px`,
  ];

  const show = () => {
    const pace = scene.pace();
    if (pace === undefined) return;
    if (measureOnLoad) {
      measureOnLoad = false;
      start();
    }
    onPanel({
      rows: [...whereFields(scene.where()), ...paceFields(pace)],
      copyLink,
      measured,
      measure: start,
      copyTable: toClipboard,
    });
  };

  function start(): void {
    if (measured !== null && 'step' in measured) return;
    const tell = (next: Measured) => {
      measured = next;
      if (refresh !== undefined) show();
    };
    tell({ step: '' });
    measure(scene, view, heading, (step) => {
      tell({ step });
    }).then(
      (table) => {
        tell({ table });
      },
      (error: unknown) => {
        tell({
          error: error instanceof Error ? error : new Error(String(error)),
        });
      },
    );
  }

  const open = () => {
    show();
    refresh = setInterval(show, REFRESH_MS);
  };

  const toggle = () => {
    if (refresh === undefined) {
      open();
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
  // The panel opens at once; `show` starts the measurement at the first drawn frame.
  if (measureOnLoad) open();
  return () => {
    bound.abort();
    clearInterval(refresh);
  };
}
