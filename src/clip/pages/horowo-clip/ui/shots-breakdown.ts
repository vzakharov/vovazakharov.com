import { INK_PALETTE, STAGE } from '@/clip/shared/ink';
import {
  beatSeconds,
  KICKS,
  POSTROLL,
  SONG_SECONDS,
} from '@/clip/shared/score';
import type { Drawing, Shot } from '@/clip/shared/timeline';
import {
  bedroomFoot,
  bedroomWide,
  bedroomWindow,
} from '@/clip/widgets/bedroom';
import { channel } from '@/clip/widgets/channels';
import {
  chewing,
  type Fury,
  pullBack,
  STABS,
  staringHead,
  stillHole,
} from '@/clip/widgets/ending';
import { gigClose, gigWide } from '@/clip/widgets/gig';
import { meadowParty } from '@/clip/widgets/meadow-party';
import { wardHole, wardTv, wardTwoShot, wardWall } from '@/clip/widgets/ward';

import { sectionNamed } from './stand-in';

/**
 * Everything the clip has shown, for the breakdown to tear through a picture
 * a cut. Any `Drawing` appended here joins the rotation as it stands.
 */
const BREAKDOWN_POOL: readonly Drawing[] = [
  meadowParty('wide'),
  gigClose('drums'),
  channel(5, 1),
  bedroomFoot,
  STABS[0],
  meadowParty('band'),
  wardWall,
  gigClose('vocal'),
  channel(0, 0.95),
  STABS[1],
  bedroomWide,
  meadowParty('hill'),
  gigWide(undefined, 0.9),
  channel(6, 0.95),
  wardTwoShot,
  STABS[2],
  gigClose('guitar'),
  bedroomWindow,
  channel(2, 0.95),
  wardTv,
  gigClose('bass'),
  STABS[3],
  channel(4, 0.95),
].filter((drawing) => drawing !== undefined);

const BREAKDOWN = sectionNamed('breakdown');
const BEAT = beatSeconds(BREAKDOWN);

// The song's shape past the slam at 96.1 s, read off the master: two riffs,
// each followed by a hole where the drums drop to a held chord, then a wash
// of noise under the last «Хорошо!» (115.92 s, the song's last word; the
// vocal stem ends at 89.6 s, so this is the master's word timing). The
// master falls silent at 117.2 s.
const HOLE_1 = { from: 103.3, to: 105.523 } as const;
const HOLE_2 = { from: 112.7, to: 114.724 } as const;
/** Where the held chord of the second hole changes: his head steps nearer. */
const HOLE_2_STEPS = [113.2, 113.8, 114.3] as const;
/** Instants the whole band stops dead inside a riff. */
const DROPOUTS = [
  { from: 97.33, to: 97.51 },
  { from: 106.56, to: 106.75 },
] as const;
const LAST_SHOUT = 115.92;
const SILENCE = 117.25;
const FILM_END = SONG_SECONDS + POSTROLL;
// The pull back's steps in the silence, and the tube going off at the end.
const STEPS = [SILENCE, SILENCE + 1.7, SILENCE + 3.4] as const;
const SWITCH_OFF = FILM_END - 1.5;

// Two cuts nearer than this are one, the kick's kept.
const MERGE = 0.07;

/** Cuts on every `division` of a beat across `[from, to)`, and on every kick there. */
function cutsOver(from: number, to: number, division: number): number[] {
  const step = BEAT / division;
  const kicks = KICKS.filter((k) => k >= from && k < to);
  const grid: number[] = [];
  for (let t = from; t < to - MERGE; t += step) {
    if (!kicks.some((k) => Math.abs(k - t) < MERGE)) grid.push(t);
  }
  return [...grid, ...kicks].toSorted((a, b) => a - b);
}

const riff = (
  from: number,
  to: number,
  division: number,
  options: Fury,
): Shot => ({
  from,
  to,
  draw: chewing(BREAKDOWN_POOL, {
    cuts: cutsOver(from, to, division),
    ...options,
  }),
});

const black: Drawing = ({ ctx }) => {
  ctx.fillStyle = INK_PALETTE.ink;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
};

/**
 * The breakdown and the ending: the clip's pictures torn through on every
 * half beat and every kick, the holes gone still and wrong, then the bunny
 * with the globe on the last shout and the pull back into silence.
 */
export const BREAKDOWN_SHOTS: readonly Shot[] = [
  riff(BREAKDOWN.from, HOLE_1.from, 2, { fury: [0.3, 0.7], seed: 31 }),
  { ...HOLE_1, draw: stillHole(wardHole) },
  riff(HOLE_1.to, HOLE_2.from, 2, { fury: [0.6, 1], seed: 47 }),
  ...DROPOUTS.map((span) => ({ ...span, draw: black })),
  { ...HOLE_2, draw: staringHead(HOLE_2_STEPS) },
  riff(HOLE_2.to, LAST_SHOUT, 4, { fury: [1, 1], seed: 59 }),
  { from: LAST_SHOUT, to: FILM_END, draw: pullBack(STEPS, SWITCH_OFF) },
];
