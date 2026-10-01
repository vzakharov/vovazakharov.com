import type { Point } from '../../model/geometry';
import type { CarryingOver } from '../../model/insect-paths';
import { firstSteering, type Steering } from '../../model/insect-steering';
import { type Bobbed, phaseOf } from '../../model/motion';
import type { TappedFigure } from './hit-areas';
import type { Spanned } from './insect-away';
import type { Flying, Look } from './insect-look';

/** An insect on screen (`InsectView`): its look, and where and how it flies. */
export type Shown = TappedFigure &
  Flying &
  CarryingOver &
  // Its span as last painted.
  Spanned &
  // How far its landing's bob sank it last frame, in units of its size.
  Bobbed & {
    look: Look;
    /**
     * Where its current leg set off: across, in ground units from the
     * world's midline; down, as a fraction of the screen's height.
     */
    from: Point;
    /**
     * Whether its leg in from away has yet to pick the screen edge it
     * enters by, which it does on its first frame, once its perch stands.
     */
    entering: boolean;
    /** The ground row, in world px, its current leg set off standing over. */
    fromRow: number;
    /** The ground row it was drawn standing over last frame. */
    row: number;
    /** Where its flight had it last frame, in the world. */
    at: Point;
    /** How far its fidgets on its perch moved it off `at` last frame. */
    offset: Point;
    /** How far a landing's bob had sunk it as its current leg set off, which dies away over `BOB_FADE`. */
    bobFrom: number;
    /** Where its perch stood last frame, which it keeps to while the perch has nowhere to be. */
    end: Point | undefined;
    /** How its body is held from one frame to the next (`steer`). */
    steering: Steering;
    /**
     * Where its perch stood on its current leg's first frame, or the first
     * since the screen was last painted, which its leg sets off by; `undefined`
     * before it.
     */
    aim: Point | undefined;
    /** How it was turned as its leg set off, which it turns from into its heading; `undefined` flying in. */
    turnedFrom: number | undefined;
  };

/**
 * An insect just shown, before its first paint and its first frame: still,
 * untapped, standing over `row`.
 */
export function freshShown(
  parts: Pick<Shown, 'container' | 'hit' | 'look' | 'flier'>,
  row: number,
): Shown {
  return {
    ...parts,
    span: 0,
    from: { x: 0, y: 0 },
    entering: false,
    fromRow: row,
    row,
    at: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    bob: 0,
    bobFrom: 0,
    end: undefined,
    steering: firstSteering({ facing: 0, turn: 0 }),
    aim: undefined,
    turnedFrom: undefined,
    carried: { launch: 0, speed: 0, drink: 0 },
    phase: phaseOf(parts.flier),
    tappedAt: -Infinity,
  };
}
