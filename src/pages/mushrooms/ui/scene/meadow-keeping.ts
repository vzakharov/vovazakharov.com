/**
 * The scene's side of keeping: the record of the meadow on screen, handed to
 * the opening's keeper after every change, once a second as time passes and
 * when the tab hides. With no keeper (no store) nothing is kept and nothing
 * is listened to.
 */

import type { Opening } from '../../api/open-kept';
import type { Meadow } from '../../model/game';
import type { Eyed } from '../../model/ground';
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

/** The page events keeping listens to, and the reload a hash edit asks for. */
export type KeptPage = {
  document: EventTarget & Pick<Document, 'visibilityState'>;
  window: EventTarget;
  reload: () => void;
};

export type MeadowKeeping = {
  /** Keeps the meadow as it stands now: after a dispatch that changed it. */
  keep: () => void;
  /** Keeps it at most once a second (`POLL_MS`), `at` being the frame's time in ms. */
  poll: (at: number) => void;
  /**
   * Keeps it when the tab hides, and reloads the page on a hash edited while
   * playing, as the boot is the one path that opens a meadow; returns what
   * lets go of both.
   */
  bind: () => () => void;
};

type Held = Meadowed & Eyed;

/**
 * Keeps what `scened` holds, seen through `eye`, through `opening.keeper`;
 * `now` is the scene's clock in seconds.
 */
export function meadowKeeping(
  opening: Pick<Opening, 'seed' | 'keeper'>,
  scened: Pick<Scened, 'meadow'>,
  eye: Pick<EyeInput, 'eye' | 'gait'>,
  now: () => number,
  page: () => KeptPage = thePage,
): MeadowKeeping {
  const { keeper } = opening;
  // None before the scene's first paint fits the eye.
  const held = (): Held | undefined => {
    const [meadow, seen] = [scened.meadow(), eye.eye()];
    return meadow && seen && { meadow, eye: seen };
  };
  const record = ({ meadow, ...seen }: Held) =>
    keptRecord(opening, meadow, now() * 1000, { ...seen, gait: eye.gait() });
  const keep = () => {
    const still = keeper && held();
    if (still) keeper.keep(record(still));
  };
  return {
    keep,
    poll: (at) => {
      const still = keeper && held();
      if (still) keeper.poll(at, () => record(still));
    },
    bind: () => {
      if (!keeper) {
        return () => {
          // Nothing was bound.
        };
      }
      const { document, window, reload } = page();
      const hidden = () => {
        if (document.visibilityState === 'hidden') keep();
      };
      document.addEventListener('visibilitychange', hidden);
      window.addEventListener('hashchange', reload);
      return () => {
        document.removeEventListener('visibilitychange', hidden);
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
  };
}
