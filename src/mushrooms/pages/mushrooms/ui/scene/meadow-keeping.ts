/**
 * The scene's side of keeping: the record of the meadow on screen, handed to
 * the opening's keeper after every change, and at most once a second and when
 * the tab hides if anything moved since, until another tab keeps the same
 * meadow. With no keeper (no store) nothing is kept and nothing is listened
 * to.
 */

import type { Opening } from '../../api/open-kept';
import { sameAnchor } from '../../model/anchor';
import type { Meadow } from '../../model/game';
import { settled } from '../../model/keeping';
import { type Kept, KEPT_VERSION } from '../../model/kept-record';
import type { Seeded } from '../../model/random';
import type { WalkStart } from '../../model/walk';
import type { EyeInput } from './eye-input';
import type { Scened } from './planter';
import type { Meadowed } from './visit-play';

/** The record of `meadow` at rest as of `now` (ms on the scene's clock), seen from `start`. */
export function keptRecord(
  { seed }: Seeded,
  meadow: Meadow,
  now: number,
  { eye, gait }: WalkStart,
): Kept {
  return {
    version: KEPT_VERSION,
    seed,
    meadow: settled(meadow, now),
    eye,
    gait,
  };
}

/**
 * The page events keeping listens to, the reload a hash edit or another
 * tab's keeping asks for, and where a failed check of the store is reported.
 */
export type KeptPage = {
  document: EventTarget & Pick<Document, 'visibilityState'>;
  window: EventTarget;
  reload: () => void;
  report: (error: unknown) => void;
};

export type MeadowKeeping = {
  /** Keeps the meadow as it stands now: after a dispatch that changed it. */
  keep: () => void;
  /** Keeps it at most once a second (`POLL_MS`), `at` being the frame's time in ms. */
  poll: (at: number) => void;
  /**
   * Keeps it when the tab hides, and reloads the page on a hash edited while
   * playing, as the boot is the one path that opens a meadow; returns what
   * lets go of both. From the hide until the tab, shown again, has checked
   * the store, nothing is kept: another tab may have kept the meadow
   * meanwhile, and then this one reloads to open that rather than write
   * over it.
   */
  bind: () => () => void;
};

type Held = Meadowed & WalkStart;

/** Whether the eye stands where it stood, in the same gait. */
function sameStart(a: WalkStart, b: WalkStart): boolean {
  return sameAnchor(a.eye, b.eye) && a.gait === b.gait;
}

/**
 * Keeps what `scened` holds, seen through `eye`, through `opening.keeper`;
 * `now` is the scene's clock in seconds. The poll and the hide keep only what
 * changed since the last record handed over. A fresh meadow (no `opening.kept`)
 * is kept only once played — an action's `keep`, or the eye or gait moved off
 * the first frame's — so a stray link leaves no empty meadow behind.
 */
export function meadowKeeping(
  opening: Pick<Opening, 'seed' | 'keeper' | 'kept' | 'overwritten'>,
  scened: Pick<Scened, 'meadow'>,
  eye: Pick<EyeInput, 'eye' | 'gait'>,
  now: () => number,
  page: () => KeptPage = thePage,
): MeadowKeeping {
  const { keeper, kept, overwritten } = opening;
  // A fresh meadow's first frame stands in for a record handed over unwritten.
  let handed: Held | undefined;
  let played = kept !== undefined;
  // Set from a hide until the check on show passes; a keep asked meanwhile is owed.
  let paused = false;
  let owed = false;
  // None before the scene's first paint fits the eye.
  const held = (): Held | undefined => {
    const [meadow, seen] = [scened.meadow(), eye.eye()];
    return meadow && seen && { meadow, eye: seen, gait: eye.gait() };
  };
  const record = (still: Held) => {
    handed = still;
    played = true;
    const { meadow, ...start } = still;
    return keptRecord(opening, meadow, now() * 1000, start);
  };
  // What is held when it is worth keeping unasked; none otherwise.
  const changed = (): Held | undefined => {
    const still = keeper && held();
    if (!still) return undefined;
    if (!handed) {
      if (played) return still;
      handed = still;
      return undefined;
    }
    // An idle tick returns the meadow it was handed, so a reference compares it.
    const stood = sameStart(still, handed);
    if (stood && still.meadow === handed.meadow) return undefined;
    return played || !stood ? still : undefined;
  };
  const keep = () => {
    if (paused) {
      owed = true;
      return;
    }
    const still = keeper && held();
    if (still) keeper.keep(record(still));
  };
  return {
    keep,
    poll: (at) => {
      if (paused) return;
      const still = changed();
      if (still) keeper?.poll(at, () => record(still));
    },
    bind: () => {
      if (!keeper) {
        return () => {
          // Nothing was bound.
        };
      }
      const { document, window, reload, report } = page();
      const resume = (stale: boolean) => {
        if (stale) {
          reload();
          return;
        }
        // Hidden again before the answer: the next show checks afresh.
        if (document.visibilityState === 'hidden') return;
        paused = false;
        if (owed) {
          owed = false;
          keep();
        }
      };
      const shown = () => {
        if (document.visibilityState === 'hidden') {
          const still = paused ? undefined : changed();
          if (still) keeper.keep(record(still));
          paused = true;
        } else if (paused) {
          // A check that fails leaves keeping paused for the rest of the load.
          (overwritten?.() ?? Promise.resolve(false)).then(resume, report);
        }
      };
      document.addEventListener('visibilitychange', shown);
      window.addEventListener('hashchange', reload);
      return () => {
        document.removeEventListener('visibilitychange', shown);
        window.removeEventListener('hashchange', reload);
      };
    },
  };
}

function thePage(): KeptPage {
  return {
    document,
    window: globalThis,
    reload: () => {
      location.reload();
    },
    report: (error) => {
      reportError(error);
    },
  };
}
