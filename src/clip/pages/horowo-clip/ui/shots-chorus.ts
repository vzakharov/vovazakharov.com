import { KICKS, pulse } from '@/clip/shared/score';
import type { Drawing, Shot } from '@/clip/shared/timeline';
import { aerobics } from '@/clip/widgets/channels';
import { gigInsert } from '@/clip/widgets/gig';
import {
  FRAMINGS,
  lyricBreak,
  meadowBurst,
  meadowParty,
} from '@/clip/widgets/meadow-party';
import { spoonBunny } from '@/clip/widgets/spoon-bunny';
import { wardInsert } from '@/clip/widgets/ward';

import { sectionNamed } from './stand-in';

/** A storyline's picture `along` the chorus, 0 to 1, so each return can be further on. */
type Storyline = (along: number) => Drawing;

/**
 * The storylines the `I` slots cut to, one after another round the list. The
 * meadow, the ward wall and the aerobics show have slots of their own.
 */
const STORYLINES: readonly Storyline[] = [
  () => gigInsert,
  (along) => spoonBunny(0.5 + 0.3 * along),
];

const { from: opening, to: closing } = sectionNamed('chorus');

// «счастья» is sung from 44.84 s, where the vocal stem opens again, and a
// kick lands with it: the meadow's first frame.
const SCHASTYA = 44.84;
const BURST =
  KICKS.toSorted(
    (a, b) => Math.abs(a - SCHASTYA) - Math.abs(b - SCHASTYA),
  )[0] ?? SCHASTYA;
// The burst holds through the pulse it lands in and two more.
const BURST_PULSES = 3;

// From the pulse after the burst, a slot a half-time pulse: M the meadow, W the
// ward wall, A the aerobics show, I the next of `STORYLINES`. A run of one
// letter is one shot. Laid on the lines: the wall on «ненастье», «на стене
// дурдома», «выскребу три слова» and «Как, сука, хорошо», which finishes it.
const ROTATION = 'AAMWMIMIWMAAWIMIMW';

// The aerobics show's nearness across the chorus: its backing line freezes
// and turns to the camera between its first return and its second.
const AEROBICS_NEARNESS = [0.5, 0.75] as const;

/** Where each pulse after the burst starts; a last sliver under half a pulse joins the one before. */
function pulseStarts(): number[] {
  const { fraction, seconds } = pulse(BURST);
  const first = BURST - fraction * seconds + BURST_PULSES * seconds;
  const starts: number[] = [];
  for (let at = first; at < closing - seconds / 2; at += seconds) {
    starts.push(at);
  }
  return starts;
}

const slotAt = (n: number): string => ROTATION[n % ROTATION.length] ?? 'M';

const alongAt = (t: number): number => (t - opening) / (closing - opening);

/**
 * The rotation after the burst. The meadow's framing changes at every return,
 * the ward's words are gouged a share further at each of its slots, the last
 * finishing the line, and the storylines are taken in turn.
 */
function rotation(): Shot[] {
  const starts = pulseStarts();
  const runs = starts.filter((_, n) => n === 0 || slotAt(n) !== slotAt(n - 1));
  const wardRuns = runs.filter((from) => slotAt(starts.indexOf(from)) === 'W');
  let framing = 1;
  let storyline = 0;
  return runs.map((from, r) => {
    const to = runs[r + 1] ?? closing;
    const slot = slotAt(starts.indexOf(from));
    const along = alongAt(from);
    if (slot === 'W') {
      const gouged = wardRuns.indexOf(from);
      const draw = wardInsert(
        gouged / wardRuns.length,
        (gouged + 1) / wardRuns.length,
      );
      return { from, to, draw };
    }
    if (slot === 'A') {
      const [first, last] = AEROBICS_NEARNESS;
      return { from, to, draw: aerobics(first + (last - first) * along) };
    }
    if (slot === 'I') {
      const pick =
        STORYLINES[storyline % STORYLINES.length] ?? (() => gigInsert);
      storyline += 1;
      return { from, to, draw: pick(along) };
    }
    const name = FRAMINGS[framing % FRAMINGS.length] ?? 'wide';
    framing += 1;
    return { from, to, draw: meadowParty(name) };
  });
}

const rotated = rotation();

/**
 * The chorus: «не сдохнуть бы» on black, word by word, then the meadow, seen
 * for the first time, slamming in on the kick under «счастья» and cut on the
 * half-time pulse with the ward wall, the aerobics show and the other
 * storylines.
 */
export const CHORUS_SHOTS: readonly Shot[] = [
  { from: opening, to: BURST, draw: lyricBreak },
  { from: BURST, to: rotated[0]?.from ?? closing, draw: meadowBurst },
  ...rotated,
];
