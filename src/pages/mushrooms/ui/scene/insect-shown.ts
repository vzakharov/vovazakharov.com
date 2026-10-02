import { pick } from '@/shared/lib/collections';

import type { Leg, Span } from '../../model/flight';
import type { Point } from '../../model/geometry';
import type { CarryingOver } from '../../model/insect-paths';
import {
  firstSteering,
  startLeg,
  type Steering,
} from '../../model/insect-steering';
import { type Bobbed, phaseOf } from '../../model/motion';
import type { TappedFigure } from './hit-areas';
import type { SetOff, Spanned } from './insect-away';
import type { Aloft, Framed } from './insect-frame';
import type { Flying, Look } from './insect-look';

/** An insect on screen (`InsectView`): its look, and where and how it flies. */
export type Shown = TappedFigure &
  Flying &
  CarryingOver &
  // Its span as last painted.
  Spanned &
  // How far its landing's bob sank it last frame, in units of its size.
  Bobbed &
  // Where its current leg set off.
  SetOff &
  // When the stretch of its leg drawn now set off: the leg's departure, or
  // once it is `out`, when it flew out of view.
  Pick<Span, 'departs'> & {
    look: Look;
    /**
     * Where it was drawn last frame, veered round the eye and fidgets and
     * all, its bob aside, hidden or not: where a new leg sets off.
     */
    drawn: Aloft;
    /**
     * The centre azimuth of its current leg's frame (`centreOf`), fixed on
     * the leg's first frame; `undefined` before it.
     */
    centre: number | undefined;
    /** How far along the stretch drawn now it was last frame, from 0 to 1. */
    flown: number;
    /** Where its flight had it last frame, in its leg's frame. */
    at: Point;
    /** Where its perch stood last frame, in its leg's frame; `undefined` before its leg's first frame. */
    end: Framed | undefined;
    /**
     * Where its leg ended last frame (`legEnd`): where its perch stood, which
     * it keeps to while the perch has nowhere to be; on a leg to away, where
     * it leaves by, fixed on the leg's first frame.
     */
    goal: Aloft | undefined;
    /**
     * Whether its leg in from away has yet to pick where it sets off
     * (`entryAloft`), which it does on its first frame, once its perch stands.
     */
    entering: boolean;
    /**
     * Where a release with no open perch in view flies out of it, past the
     * screen's side (`entryAloft`); `undefined` once it is out, and on every
     * other leg.
     */
    out: Aloft | undefined;
    /** How far its fidgets on its perch moved it off its flight last frame, in px at its own size. */
    offset: Point;
    /** How far a landing's bob had sunk it as its current leg set off, which dies away over `BOB_FADE`. */
    bobFrom: number;
    /** How its body is held from one frame to the next (`steer`). */
    steering: Steering;
    /**
     * Where its perch stood on its current leg's first frame, or the first
     * since the screen was last painted, in its leg's frame, which its leg
     * sets off by; `undefined` before it.
     */
    aim: Point | undefined;
    /** How it was turned as its leg set off, which it turns from into its heading; `undefined` flying in. */
    turnedFrom: number | undefined;
    /** The way it darts on a leg it shies on (`dartWay`), from where the finger that caught it last landed. */
    dartWay: Point;
  };

/** An insect just shown, before its first paint and its first frame: still, untapped, at `from`. */
export function freshShown(
  parts: Pick<Shown, 'container' | 'hit' | 'look' | 'flier'>,
  from: Aloft,
): Shown {
  return {
    ...parts,
    span: 0,
    from,
    drawn: from,
    centre: undefined,
    flown: 0,
    entering: false,
    out: undefined,
    ...pick(parts.flier.leg, 'departs'),
    at: { x: 0, y: 0 },
    end: undefined,
    goal: undefined,
    offset: { x: 0, y: 0 },
    bob: 0,
    bobFrom: 0,
    steering: firstSteering({ facing: 0, turn: 0 }),
    aim: undefined,
    turnedFrom: undefined,
    dartWay: { x: 0, y: -1 },
    carried: { launch: 0, speed: 0, drink: 0 },
    phase: phaseOf(parts.flier),
    tappedAt: -Infinity,
  };
}

/**
 * What `shown` resets as its flier's new leg sets off: from where it was
 * drawn, fidgets and all, so a startle never jumps, and turned as its
 * steering holds it — never as its container was last drawn, which a flier
 * hidden off the screen or behind the brow has turned on from unseen. One in
 * from away picks its start on its first frame (`InsectView`'s `enter`).
 */
export function legSetOff(
  shown: Pick<Shown, 'drawn' | 'bob' | 'steering'>,
  { from, departs }: Pick<Leg, 'from' | 'departs'>,
) {
  return {
    from: shown.drawn,
    out: undefined,
    departs,
    centre: undefined,
    flown: 0,
    end: undefined,
    goal: undefined,
    entering: from.kind === 'away',
    bobFrom: shown.bob,
    steering: startLeg(shown.steering),
    aim: undefined,
    turnedFrom: from.kind === 'away' ? undefined : shown.steering.turn,
  } satisfies Partial<Shown>;
}
