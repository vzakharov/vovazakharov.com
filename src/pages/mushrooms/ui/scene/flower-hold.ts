import type { FlowerFoot } from '../../model/ground';
import type { Scened } from './planter';

/**
 * How long, in seconds, a finger stays on a flower inside the slop before the
 * press opens the flower picker on it: long enough that a melody's taps never
 * do, short enough that a six-year-old waits it out.
 */
export const LONG_PRESS = 0.45;

/** What a long press reads and acts through. */
type Holding = Pick<Scened, 'dispatch'> & {
  /** How long the pressed finger has stood inside the slop (`EyeInput.heldStill`); none once it turned or stepped, or lifted. */
  heldStill: () => number | undefined;
  /** Where the flower `id` stands on the ground; none while the screen has no room for it. */
  footOf: (id: string) => FlowerFoot | undefined;
};

/**
 * A long press on a flower: the press that lands on its head is remembered,
 * and once the finger has stayed down `LONG_PRESS` without leaving the slop
 * it opens the flower picker there (`{ kind: 'flower' }`), once. A lift, or a
 * drag that turns or steps the eye, forgets it; the press's own tap has
 * already sounded the flower.
 */
export class FlowerHold {
  /** The flower the finger went down on, until it opens or is let go. */
  private pressed: string | undefined;
  private readonly holding: Holding;

  constructor(holding: Holding) {
    this.holding = holding;
  }

  /** The finger went down on the flower `id`'s head. */
  press(id: string): void {
    this.pressed = id;
  }

  /** Opens the picker on the pressed flower once the press has lasted. */
  update(): void {
    const { pressed, holding } = this;
    if (pressed === undefined) return;
    const { heldStill, footOf, dispatch } = holding;
    const still = heldStill();
    if (still === undefined) {
      this.pressed = undefined;
      return;
    }
    if (still < LONG_PRESS) return;
    this.pressed = undefined;
    const foot = footOf(pressed);
    if (foot) dispatch({ kind: 'flower', id: pressed, foot });
  }
}
