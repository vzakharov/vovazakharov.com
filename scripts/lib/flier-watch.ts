/**
 * A watch over every frame the insects are flown, installed in the page
 * `play-mushrooms.ts` plays: the play steps many frames between looks and
 * draws only the last, so what must hold on every frame is checked there,
 * by the scene's own objects, and read back once at the end. Like
 * `mushroom-probe.ts`, it reaches into the scene's fields by name.
 */

import { z } from 'zod';

import { D_SEE } from '../../src/pages/mushrooms/model/ground.ts';
import { INSECT_KINDS } from '../../src/pages/mushrooms/model/insect-genes.ts';
import {
  LANDING,
  REST_LEAN,
} from '../../src/pages/mushrooms/model/insect-motion.ts';
import { PATH_SHAPES } from '../../src/pages/mushrooms/model/insect-paths.ts';
import { TURN_RATE } from '../../src/pages/mushrooms/model/insect-steering.ts';

/**
 * How long after landing a flier has turned to its rest facing, in ms: its
 * landing's bob and the settling turn (`SETTLE_TURN` in `insect-motion.ts`),
 * with room to spare.
 */
const SETTLED_AFTER = LANDING + 800;
/** How far through a flight to a spot in the air a flier counts as hovering there. */
const HOVERING = 0.85;
/** How long into a leg its body may still be turning into its heading, in ms. */
export const HEADING_AFTER = 150;
/** How far off the way it travels a flier's body may point, in radians, once its leg is `HEADING_AFTER` old. */
export const MOST_HEADING_OFF = 0.3;
/** The most a flier's body turns round over one leg: once. */
export const MOST_SPIN = Math.PI * 2;
/**
 * How many frames each kind's way is read over, from where it was drawn at
 * the first to where it is drawn at the last, and its heading at the middle:
 * one bob of its flutter, which the eye reads as a bob about its way rather
 * than as the way itself.
 */
const TRAVEL_FRAMES = Object.fromEntries(
  INSECT_KINDS.map((kind) => [
    kind,
    2 * Math.round(30 / PATH_SHAPES[kind].flutterRate),
  ]),
);
/**
 * How fast a flier must travel to be seen going anywhere, in spans a second:
 * slower, it reads as hovering, facing any way.
 */
const MOVING = 1;

/**
 * How much faster the screen may draw a turn than the flight makes it: the
 * bend of the pinhole's rows (`bentTurn` in `insect-drawn.ts`) maps the
 * frame's turn to the screen's at a local slope a little over 1 (~1.005 where
 * meadow's flies land), with room for rounding. Its slope varies with place
 * and pose, so it is bounded here rather than derived.
 */
const BEND_SLOPE = 1.01;
/** How fast a body shown on screen may turn, in radians a second: its kind's `TURN_RATE`, as the bend draws it. */
export const MOST_TURN_RATE = Object.fromEntries(
  INSECT_KINDS.map((kind) => [kind, TURN_RATE[kind] * BEND_SLOPE]),
);
/** How far a body's light may turn from the sun, in radians: a quarter turn, where its lit side would face away. */
const MOST_LIGHT_OFF = Math.PI / 2;

/** Installs `window.__watch`, which the scene's insect view feeds every frame. */
export const WATCH = `(() => {
  const scene = window.__game.scene.scenes[0];
  const view = scene.insects;
  const fly = view.update.bind(view);
  /** Each flier's trail on its current leg: its last frames as drawn, and how far its body has turned round, each way, since the leg set off. */
  const trails = new Map();
  const travelFrames = ${JSON.stringify(TRAVEL_FRAMES)};
  const watch = {
    worstHeading: { id: null, kind: null, off: 0, at: 0, leg: null },
    headings: {},
    worstSpin: { id: null, kind: null, spin: 0, legs: 0 },
    beeVisits: 0,
    pollinating: 0,
    worstRest: { id: null, kind: null, turn: 0, at: 0 },
    hoverOverlaps: 0,
    hoverForced: 0,
    worstHover: { a: null, b: null, apart: 0, need: 0 },
    crossings: 0,
    leastSpan: {},
    leastOwnSpan: {},
    capRests: { spotted: 0, other: 0 },
    turnSteps: {},
    worstTurn: { id: null, kind: null, rate: 0, at: 0 },
    light: {},
    worstLight: { id: null, kind: null, off: 0, at: 0 },
    frames: 0,
  };
  const mostTurnRate = ${JSON.stringify(MOST_TURN_RATE)};
  const counted = new Set();
  /**
   * Whether the air has a spot no flier is taking and none taken crowds: a
   * flier with nowhere else to go hovers where it is only crowded, so as
   * not to be lost, and its overlap is forced.
   */
  const airOpen = () => {
    const { air, crowded } = scene.perches.sight;
    const taken = scene.meadow.insects
      .map(({ leg }) => leg.to)
      .filter((to) => to.kind === 'air')
      .map(({ id }) => id);
    return air.some(
      (id) =>
        !taken.includes(id) &&
        !crowded.some(
          ([a, b]) =>
            (a.kind === 'air' && b.kind === 'air') &&
            ((a.id === id && taken.includes(b.id)) ||
              (b.id === id && taken.includes(a.id))),
        ),
    );
  };
  const wrap = (angle) => angle - Math.PI * 2 * Math.round(angle / (Math.PI * 2));
  view.update = (t, perchAt) => {
    fly(t, perchAt);
    const now = t * 1000;
    watch.frames += 1;
    const aloft = [];
    for (const flier of scene.meadow.insects) {
      const shown = view.shown.get(flier.id);
      if (!shown) continue;
      const { leg, kind, id } = flier;
      if (kind === 'bee' && leg.to.kind === 'flower' && now >= leg.arrives) {
        const key = id + ' ' + leg.departs;
        if (!counted.has(key)) {
          counted.add(key);
          watch.beeVisits += 1;
          if (flier.pollen.pollinates) watch.pollinating += 1;
        }
      }
      if (kind === 'fly' && leg.to.kind === 'cap' && now >= leg.arrives) {
        const key = id + ' ' + leg.departs;
        if (!counted.has(key)) {
          counted.add(key);
          const cap = scene.meadow.mushrooms.find((each) => each.id === leg.to.id);
          watch.capRests[cap?.species === 'fly-agaric' ? 'spotted' : 'other'] += 1;
        }
      }
      // A hidden body keeps the turn and place it was last drawn at, which
      // its flight has since left: only what is drawn is judged, and its
      // trail starts afresh when it shows again.
      if (!shown.container.visible) {
        trails.delete(id);
        continue;
      }
      const turn = shown.container.rotation;
      const span = shown.span * shown.container.scaleX;
      const { x, y } = shown.container;
      const held = trails.get(id);
      const trail =
        held?.legs === flier.legs
          ? held
          : { legs: flier.legs, frames: [], round: 0, least: 0, most: 0 };
      const previous = trail.frames.at(-1) ?? held?.frames.at(-1);
      // Whether its body's middle is on the screen: a body is drawn until a
      // whole span is past the edge, and what turns where no one sees it is
      // not judged.
      const onScreen =
        __probe.shows(x) && y >= 0 && y <= scene.layout.height;
      if (onScreen && previous && now > previous.now) {
        const step = Math.abs(wrap(turn - previous.turn));
        const steps = (watch.turnSteps[kind] ??= { steps: 0, over: 0, most: 0 });
        steps.steps += 1;
        if (step > 0.2) steps.over += 1;
        steps.most = Math.max(steps.most, step);
        const rate = (step * 1000) / (now - previous.now);
        if (rate / mostTurnRate[kind] > watch.worstTurn.rate / (mostTurnRate[watch.worstTurn.kind] ?? 1)) {
          watch.worstTurn = { id, kind, rate, at: now };
        }
      }
      // The light its lit parts were painted in turns with its body from the
      // turn they were painted for.
      const lightOff = Math.abs(wrap(turn - (shown.look.litTurn ?? 0)));
      if (lightOff > watch.worstLight.off) {
        watch.worstLight = { id, kind, off: lightOff, at: now };
      }
      if (now >= leg.departs && now < leg.arrives) {
        const lit = (watch.light[kind] ??= { frames: 0, off: 0 });
        lit.frames += 1;
        if (lightOff > ${String(MOST_LIGHT_OFF)}) lit.off += 1;
      }
      if (previous) {
        trail.round += wrap(turn - previous.turn);
        trail.least = Math.min(trail.least, trail.round);
        trail.most = Math.max(trail.most, trail.round);
        if (trail.most - trail.least > watch.worstSpin.spin) {
          watch.worstSpin = { id, kind, spin: trail.most - trail.least, legs: flier.legs };
        }
      }
      const window = travelFrames[kind];
      const eye = scene.eye.eye();
      // Past the brow it is drawn sinking behind it (\`sunk\` in \`view.ts\`),
      // which moves it down the screen however it flies: that slide is not
      // its way, and its body does not turn to it.
      const sinking =
        Math.hypot(shown.drawn.x - eye.x, shown.drawn.y - eye.y) > ${String(D_SEE)};
      const inView = onScreen && !sinking;
      trail.frames = [...trail.frames, { x, y, turn, now, inView }].slice(-window - 1);
      trails.set(id, trail);
      const [first] = trail.frames;
      const middle = trail.frames[window / 2];
      const travel = first && Math.hypot(x - first.x, y - first.y);
      // The body judged is the middle frame's and its way runs from the
      // first to this one, so all three must be in view, short of the brow.
      const judged = inView && first?.inView && middle?.inView;
      // A shying flier darts (\`insect-dart.ts\`), which moves it without
      // turning it: its body faces its flight to the perch, not its dart.
      const shying = flier.shied === flier.legs;
      if (
        !shying &&
        trail.frames.length > window &&
        middle.now >= leg.departs + ${String(HEADING_AFTER)} &&
        now < leg.arrives &&
        judged &&
        travel >= (span * ${String(MOVING)} * (now - first.now)) / 1000
      ) {
        // A body's turn is clockwise from up the screen, a heading from +x.
        const off = Math.abs(
          wrap(middle.turn - Math.PI / 2 - Math.atan2(y - first.y, x - first.x)),
        );
        const seen = (watch.headings[kind] ??= { frames: 0, off: 0 });
        seen.frames += 1;
        if (off > ${String(MOST_HEADING_OFF)}) seen.off += 1;
        if (off > watch.worstHeading.off) {
          watch.worstHeading = {
            id,
            kind,
            off,
            at: now,
            leg: JSON.stringify({ ...leg, legs: flier.legs, turn: middle.turn, travel, steering: shown.steering, from: shown.from, end: shown.end }),
          };
        }
      }
      if (leg.to.kind !== 'away' && now > leg.arrives) {
        watch.leastSpan[kind] = Math.min(watch.leastSpan[kind] ?? Infinity, span);
        watch.leastOwnSpan[kind] = Math.min(watch.leastOwnSpan[kind] ?? Infinity, shown.span);
      }
      const seat = ['cap', 'flower', 'shelter'].includes(leg.to.kind);
      if (seat && now >= leg.arrives + ${String(SETTLED_AFTER)} && now < leg.leaves - 50) {
        const off = Math.abs(wrap(turn));
        if (off > watch.worstRest.turn) {
          watch.worstRest = { id, kind, turn: off, at: now };
        }
      }
      const flying = now >= leg.departs && now < leg.arrives;
      if (flying && leg.to.kind !== 'away') {
        const through = (now - leg.departs) / (leg.arrives - leg.departs);
        aloft.push({
          id,
          x: shown.container.x,
          y: shown.container.y,
          span,
          hovering: leg.to.kind === 'air' && through >= ${String(HOVERING)},
        });
      }
    }
    for (const [index, a] of aloft.entries()) {
      for (const b of aloft.slice(index + 1)) {
        const apart = Math.hypot(a.x - b.x, a.y - b.y);
        const need = (a.span + b.span) / 2;
        if (apart >= need) continue;
        watch.crossings += 1;
        if (!a.hovering || !b.hovering) continue;
        if (!airOpen()) {
          watch.hoverForced += 1;
          continue;
        }
        watch.hoverOverlaps += 1;
        if (need - apart > watch.worstHover.need - watch.worstHover.apart) {
          watch.worstHover = { a: a.id, b: b.id, apart, need };
        }
      }
    }
  };
  window.__watch = watch;
})()`;

const Kind = z.enum(INSECT_KINDS);
export const Watch = z.object({
  worstHeading: z.object({
    id: z.string().nullable(),
    kind: Kind.nullable(),
    /** How far its body pointed off the way it travelled, in radians. */
    off: z.number(),
    at: z.number(),
    /** The leg it was on, and how the view held it, for a report to read. */
    leg: z.string().nullable(),
  }),
  /** Per kind, frames a flier not shying was seen travelling, and in how many it faced more than `MOST_HEADING_OFF` off its way. */
  headings: z.partialRecord(
    Kind,
    z.object({ frames: z.number(), off: z.number() }),
  ),
  worstSpin: z.object({
    id: z.string().nullable(),
    kind: Kind.nullable(),
    /** How far round its body swung over one leg, between the furthest it turned either way, in radians. */
    spin: z.number(),
    legs: z.number(),
  }),
  beeVisits: z.number(),
  pollinating: z.number(),
  worstRest: z.object({
    id: z.string().nullable(),
    kind: Kind.nullable(),
    turn: z.number(),
    at: z.number(),
  }),
  hoverOverlaps: z.number(),
  /** Frames with two hovering fliers overlapping where the air had no spot uncrowded. */
  hoverForced: z.number(),
  worstHover: z.object({
    a: z.string().nullable(),
    b: z.string().nullable(),
    apart: z.number(),
    need: z.number(),
  }),
  crossings: z.number(),
  /** Per kind, the narrowest wings drawn at rest, in px, a far perch's depth included. */
  leastSpan: z.partialRecord(Kind, z.number()),
  /** Per kind, the narrowest wings at rest at the insect's own size, the depth it sits at aside, in px. */
  leastOwnSpan: z.partialRecord(Kind, z.number()),
  capRests: z.object({ spotted: z.number(), other: z.number() }),
  /** Per kind, frame-to-frame turns of its body while its middle is on screen, how many were over 0.2 rad, and the largest, in radians. */
  turnSteps: z.partialRecord(
    Kind,
    z.object({ steps: z.number(), over: z.number(), most: z.number() }),
  ),
  /** The fastest a body turned from one frame to the next, onto a frame with its middle on screen, against its kind's `MOST_TURN_RATE`, in radians a second. */
  worstTurn: z.object({
    id: z.string().nullable(),
    kind: Kind.nullable(),
    rate: z.number(),
    at: z.number(),
  }),
  /** Per kind, frames in flight, and in how many its light stood more than `MOST_LIGHT_OFF` off the sun. */
  light: z.partialRecord(
    Kind,
    z.object({ frames: z.number(), off: z.number() }),
  ),
  /** The furthest a body's light stood off the sun on any frame, in radians. */
  worstLight: z.object({
    id: z.string().nullable(),
    kind: Kind.nullable(),
    off: z.number(),
    at: z.number(),
  }),
  frames: z.number(),
});

/** How far off facing up the screen a settled flier may sit: its rest lean, and a little for its perch's sway. */
export const MOST_REST_TURN = REST_LEAN + 0.12;
