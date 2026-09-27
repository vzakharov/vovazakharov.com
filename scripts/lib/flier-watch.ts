/**
 * A watch over every frame the insects are flown, installed in the page
 * `play-mushrooms.ts` plays: the play steps many frames between looks and
 * draws only the last, so what must hold on every frame is checked there,
 * by the scene's own objects, and read back once at the end. Like
 * `mushroom-probe.ts`, it reaches into the scene's fields by name.
 */

import { z } from 'zod';

import { INSECT_KINDS } from '../../src/pages/mushrooms/model/insect-genes.ts';
import {
  LANDING,
  REST_LEAN,
} from '../../src/pages/mushrooms/model/insect-motion.ts';

/**
 * How long after landing a flier has turned to its rest facing, in ms: its
 * landing's bob and the settling turn (`SETTLE_TURN` in `insect-motion.ts`),
 * with room to spare.
 */
const SETTLED_AFTER = LANDING + 800;
/** How far through a flight to a spot in the air a flier counts as hovering there. */
const HOVERING = 0.85;

/** Installs `window.__watch`, which the scene's insect view feeds every frame. */
export const WATCH = `(() => {
  const scene = window.__game.scene.scenes[0];
  const view = scene.insects;
  const fly = view.update.bind(view);
  const last = new Map();
  const watch = {
    worstTurn: { id: null, kind: null, step: 0, at: 0, leg: null },
    beeVisits: 0,
    pollinating: 0,
    worstRest: { id: null, kind: null, turn: 0, at: 0 },
    hoverOverlaps: 0,
    hoverForced: 0,
    worstHover: { a: null, b: null, apart: 0, need: 0 },
    crossings: 0,
    leastSpan: {},
    capRests: { spotted: 0, other: 0 },
    frames: 0,
  };
  const counted = new Set();
  /**
   * Whether the air has a spot no flier is taking and none taken crowds: a
   * flier with nowhere else to go hovers where it is only crowded, so as
   * not to be lost, and its overlap is forced.
   */
  const airOpen = () => {
    const { air, crowded } = scene.sight;
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
      const turn = shown.container.rotation;
      const was = last.get(id);
      if (was !== undefined) {
        const step = Math.abs(wrap(turn - was));
        if (step > watch.worstTurn.step) {
          watch.worstTurn = {
            id,
            kind,
            step,
            at: now,
            leg: JSON.stringify({ ...leg, legs: flier.legs, was, turn, facing: shown.facing, at: shown.at, from: shown.from, end: shown.end, turns: shown.turns, turnedFrom: shown.turnedFrom }),
          };
        }
      }
      last.set(id, turn);
      const span = shown.span * shown.container.scaleX;
      if (leg.to.kind !== 'away' && now > leg.arrives) {
        watch.leastSpan[kind] = Math.min(watch.leastSpan[kind] ?? Infinity, span);
      }
      const seat = leg.to.kind === 'cap' || leg.to.kind === 'flower';
      if (seat && now >= leg.arrives + ${String(SETTLED_AFTER)} && now < leg.leaves - 50) {
        const off = Math.abs(wrap(turn));
        if (off > watch.worstRest.turn) {
          watch.worstRest = { id, kind, turn: off, at: now };
        }
      }
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
          watch.capRests[cap?.cap === 'spotted' ? 'spotted' : 'other'] += 1;
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
  worstTurn: z.object({
    id: z.string().nullable(),
    kind: Kind.nullable(),
    step: z.number(),
    at: z.number(),
    /** The leg it was on, and how the view held it, for a report to read. */
    leg: z.string().nullable(),
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
  leastSpan: z.partialRecord(Kind, z.number()),
  capRests: z.object({ spotted: z.number(), other: z.number() }),
  frames: z.number(),
});

/** The most a flier's body turns between two frames, in radians. */
export const MOST_TURN = 0.2;
/** How far off facing up the screen a settled flier may sit: its rest lean, and a little for its perch's sway. */
export const MOST_REST_TURN = REST_LEAN + 0.12;
