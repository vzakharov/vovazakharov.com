import type { FlowerColour } from '../../model/flower-genes';
import {
  type FlowerShape,
  type FlowerSound,
  shapeSeeds,
} from '../../model/flower-sounds';
import { type Action, type Meadow, sameFoot } from '../../model/game';
import { mulberry32, type Random } from '../../model/random';
import { type Stand, takesFlower } from './flower-sight';
import { keyPlanting } from './keyed-flowers';
import type { MeadowSound } from './sound';
import type { Grass, Sprout } from './tufts';

/** What the planter acts through: the scene's stand and reducer. */
export type Scened = {
  stand: () => Stand | undefined;
  meadow: () => Meadow | undefined;
  dispatch: (action: Action) => void;
};

/**
 * The child planting flowers: a tap on a tuft opens the flower picker on it,
 * a colour picked draws the seeds its four shapes grow from, and a shape
 * picked plants that flower — while the tuft can take one (`takesFlower`),
 * refused otherwise the way a full forest refuses `+`. A note or drum key
 * picks both at once (`plantSounding`).
 */
export class Planter {
  private readonly voice: MeadowSound;
  /** Seconds on the scene's clock. */
  private readonly now: () => number;
  private readonly scene: Scened;
  /** The seeds of the flowers the child plants, drawn a colour's four shapes at a time. */
  private readonly sowing: Random;

  constructor(
    voice: MeadowSound,
    now: () => number,
    scene: Scened,
    seed: number,
  ) {
    this.voice = voice;
    this.now = now;
    this.scene = scene;
    this.sowing = mulberry32(seed);
  }

  readonly colour = (colour: FlowerColour): void => {
    this.voice.pop();
    this.scene.dispatch({
      kind: 'colour',
      colour,
      seeds: shapeSeeds(this.sowing, colour),
    });
  };

  readonly plant = (shape: FlowerShape): void => {
    this.scene.dispatch({ kind: 'plant', shape });
  };

  /**
   * A key making `sound` while the flower picker is open: the picker's own
   * pick of the flower that makes it (`keyPlanting`), refused as that pick
   * would be where the picker cannot plant. Returns whether the picker was
   * open to take it.
   */
  readonly plantSounding = (sound: FlowerSound): boolean => {
    const meadow = this.scene.meadow();
    const actions = keyPlanting(meadow?.planting, sound, (colour) =>
      shapeSeeds(this.sowing, colour),
    );
    if (!meadow || !actions) return false;
    if (!this.plantable(meadow)) {
      this.voice.nuhUh();
      return true;
    }
    for (const action of actions) this.scene.dispatch(action);
    return true;
  };

  /**
   * Whether the flower picker's pick can plant where it is open: always on a
   * flower, which the pick replaces where it stands; on a tuft while it can
   * still take a flower.
   */
  readonly plantable = ({ planting }: Meadow): boolean => {
    if (planting?.flower !== undefined) return true;
    const stand = this.scene.stand();
    return (
      planting !== undefined &&
      stand !== undefined &&
      takesFlower(stand, planting.foot)
    );
  };

  /**
   * A tap on `tuft` of `grass` opens the flower picker on it, or closes it
   * when it is open there already; a tuft that cannot take a flower shakes
   * its head and lets go of the selection and any open picker, as any tap on
   * the meadow does.
   */
  tapTuft({ tuft, foot }: Sprout, grass: Grass): void {
    const { stand, meadow, dispatch } = this.scene;
    const standing = stand();
    if (!standing) return;
    const open = meadow()?.planting?.foot;
    const again = open !== undefined && sameFoot(open, foot);
    if (!again && !takesFlower(standing, foot)) {
      grass.refuse(tuft, this.now());
      this.voice.nuhUh();
      dispatch({ kind: 'deselect' });
      return;
    }
    dispatch({ kind: 'tuft', foot });
  }
}
