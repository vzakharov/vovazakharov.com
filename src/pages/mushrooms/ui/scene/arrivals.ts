import type { Sight } from '../../model/flight';
import type { Ground } from '../../model/ground';
import type { InsectKind } from '../../model/insect-genes';
import type { Species } from '../../model/mushroom-genes';
import { mulberry32, nextSeed, type Random } from '../../model/random';
import type { MeadowLayout } from './layout';
import { keptRoom } from './mushroom-room';
import { onscreenOf } from './perch-sight';
import type { Scened } from './planter';
import type { MeadowSound } from './sound';
import type { View } from './view';

/** What the arrivals act through: the scene's stand and reducer, and what it sees now. */
type Arriving = Scened & {
  layout: () => MeadowLayout;
  view: () => View | undefined;
  sight: () => Sight;
};

/**
 * The mushrooms `+` grows and the insects their buttons release, each from
 * a seeded stream of its own, apart from the visit's other streams. The seed
 * the next mushroom grows from is drawn before the tap, so where it grows is
 * known while `+` stands waiting.
 */
export class Arrivals {
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
    this.scene.dispatch({ kind: 'grow', species, seed: this.upcoming, foot });
    this.upcoming = nextSeed(this.growing);
  };

  /** Whether the meadow has room for another mushroom as it stands now. */
  readonly roomy = (): boolean => this.roomNow() !== undefined;

  readonly release = (insect: InsectKind): void => {
    const { dispatch, layout, view, sight } = this.scene;
    this.voice.takeOff(insect);
    const seed = nextSeed(this.releasing);
    dispatch({
      kind: 'release',
      insect,
      seed,
      now: this.now() * 1000,
      ...sight(),
      onscreen: onscreenOf(layout(), view(), { kind: insect, seed }),
    });
  };

  /** Where the next mushroom grows as the meadow stands now: `undefined` where there is no room. */
  private roomNow(): Ground | undefined {
    const stand = this.scene.stand();
    return stand && this.room(stand, this.upcoming, this.scene.view());
  }
}
