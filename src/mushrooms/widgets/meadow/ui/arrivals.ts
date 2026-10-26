import {
  mulberry32,
  nextSeed,
  type Random,
} from '@/mushrooms/shared/lib/random';
import {
  type InsectKind,
  panOf,
  perchName,
} from '@/mushrooms/entities/insect/index.node-safe';
import type {
  Footed,
  Species,
} from '@/mushrooms/entities/mushroom/index.node-safe';
import { keptRoom } from '@/mushrooms/features/grow-mushroom/index.node-safe';
import { onscreenOf } from '@/mushrooms/features/insects-fly/index.node-safe';

import type { MeadowLayout } from './layout';
import type { Scened, SightSeen } from './planter';
import type { MeadowSound } from './sound';

/** What the arrivals act through: the scene's stand and reducer, and what it sees now. */
type Arriving = Scened & SightSeen & { layout: () => MeadowLayout };

export type Summoning = {
  readonly grow: (species: Species) => void;
  readonly roomy: () => boolean;
  readonly release: (insect: InsectKind) => void;
};

/**
 * The mushrooms `+` grows and the insects their buttons release, each from
 * a seeded stream of its own, apart from the visit's other streams. The seed
 * the next mushroom grows from is drawn before the tap, so where it grows is
 * known while `+` stands waiting.
 */
export class Arrivals implements Summoning {
  private readonly voice: MeadowSound;
  /** Seconds on the scene's clock. */
  private readonly now: () => number;
  private readonly scene: Arriving;
  /** The seeds each grown mushroom takes. */
  private readonly growing: Random;
  /** The seed the next mushroom grows from. */
  private upcoming: number;
  /** Where the next mushroom grows (`roomFor`), found again once the stand changes. */
  private readonly room = keptRoom();
  /** The seeds each released insect takes. */
  private readonly releasing: Random;

  constructor(
    voice: MeadowSound,
    now: () => number,
    scene: Arriving,
    visitSeed: number,
  ) {
    this.voice = voice;
    this.now = now;
    this.scene = scene;
    this.growing = mulberry32(visitSeed ^ 0x9e_0a);
    this.upcoming = nextSeed(this.growing);
    this.releasing = mulberry32(visitSeed ^ 0xb7_7e_f1);
  }

  readonly grow = (species: Species): void => {
    const foot = this.roomNow();
    if (!foot) return;
    this.scene.dispatch({
      kind: 'grow',
      species,
      seed: this.upcoming,
      ...foot,
    });
    this.upcoming = nextSeed(this.growing);
  };

  /** Whether the meadow has room for another mushroom as it stands now. */
  readonly roomy = (): boolean => this.roomNow() !== undefined;

  /**
   * Releases an insect of kind `insect`, its take-off sounding where its
   * first perch stands (`panOf`), in the middle where it has none placed.
   */
  readonly release = (insect: InsectKind): void => {
    const { dispatch, layout, view, sight, meadow } = this.scene;
    const seed = nextSeed(this.releasing);
    const seen = sight();
    dispatch({
      kind: 'release',
      insect,
      seed,
      now: this.now() * 1000,
      ...seen,
      onscreen: onscreenOf(layout(), view(), { kind: insect, seed }),
    });
    const flier = meadow()?.insects.findLast(
      (released) => released.seed === seed && released.kind === insect,
    );
    const first = flier && seen.places?.[perchName(flier.leg.to)]?.pose;
    const eye = view()?.eye;
    this.voice.takeOff(insect, first && eye ? panOf(eye, first.aloft) : 0);
  };

  /** Where the next mushroom grows as the meadow stands now: `undefined` where there is no room. */
  private roomNow(): Footed | undefined {
    const stand = this.scene.stand();
    return stand && this.room(stand, this.upcoming, this.scene.view());
  }
}
