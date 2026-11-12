/** What `flier-watch.ts` saw over a whole run, held to its bounds. */

import {
  FLIGHT_HABITS,
  type InsectKind,
  LEAST_SPANS,
  LIGHT_STEP,
} from '@/mushrooms/entities/insect/index.node-safe';

import {
  HEADING_AFTER,
  MOST_HEADING_OFF,
  MOST_REST_TURN,
  MOST_SPIN,
  MOST_TURN_RATE,
  Watch,
} from './flier-watch.ts';
import type { Expect, Page } from './mushroom-probe-drive.ts';

/**
 * Holds what `flier-watch.ts` saw over every frame of `page` to its bounds: no
 * body more than `MOST_HEADING_OFF` off its way once its leg is
 * `HEADING_AFTER` old, none spinning more than `MOST_SPIN` over a leg or
 * settled more than `MOST_REST_TURN` off facing up, no two hovering fliers
 * overlapping while the air had a spot open, and each of `kinds` at least its
 * `LEAST_SPANS` across at its own size. The least drawn span is only noted: a
 * far perch draws an insect smaller by depth, and `tapReach` still reaches it.
 */
export async function checkWatch(
  page: Page,
  expect: Expect,
  note: (line: string) => void,
  kinds: readonly InsectKind[],
): Promise<void> {
  const {
    worstHeading,
    headings,
    worstSpin,
    worstRest,
    worstHover,
    leastSpan,
    leastOwnSpan,
    capRests,
    hoverOverlaps,
    hoverForced,
    crossings,
    frames,
    beeVisits,
    pollinating,
    worstTurn,
    worstLight,
  } = await page.evaluate('window.__watch', Watch);
  expect(
    worstTurn.kind === null ||
      worstTurn.rate <= (MOST_TURN_RATE[worstTurn.kind] ?? 0),
    `${String(worstTurn.id)} (${String(worstTurn.kind)}) turned ${worstTurn.rate.toFixed(2)} rad/s from one frame to the next at ${worstTurn.at.toFixed(0)} ms, past its kind's ${String(worstTurn.kind && MOST_TURN_RATE[worstTurn.kind]?.toFixed(2))}`,
  );
  expect(
    worstLight.off <= LIGHT_STEP + 1e-3,
    `${String(worstLight.id)} (${String(worstLight.kind)}) was shown ${worstLight.off.toFixed(3)} rad from the turn its light was painted for at ${worstLight.at.toFixed(0)} ms, past LIGHT_STEP ${LIGHT_STEP.toFixed(3)}`,
  );
  expect(
    worstHeading.off <= MOST_HEADING_OFF,
    `${String(worstHeading.id)} (${String(worstHeading.kind)}) faced ${worstHeading.off.toFixed(2)} rad off the way it flew at ${worstHeading.at.toFixed(0)} ms, past its leg's first ${String(HEADING_AFTER)} ms: ${String(worstHeading.leg)}`,
  );
  expect(
    worstSpin.spin <= MOST_SPIN,
    `${String(worstSpin.id)} (${String(worstSpin.kind)}) turned round ${(worstSpin.spin / MOST_SPIN).toFixed(2)} times on its leg ${String(worstSpin.legs)}`,
  );
  expect(
    worstRest.turn <= MOST_REST_TURN,
    `${String(worstRest.id)} (${String(worstRest.kind)}) sat ${worstRest.turn.toFixed(2)} rad off facing up at ${worstRest.at.toFixed(0)} ms`,
  );
  expect(
    hoverOverlaps === 0,
    `${String(hoverOverlaps)} frames with two fliers overlapping hovering in the air while a spot stood open: ${JSON.stringify(worstHover)}`,
  );
  for (const kind of kinds) {
    const span = leastOwnSpan[kind];
    expect(
      span !== undefined && span >= LEAST_SPANS[kind],
      `a ${kind} ${String(span?.toFixed(1))} px across at its own size, under ${String(LEAST_SPANS[kind])}`,
    );
  }
  note(
    `over ${String(frames)} frames: fastest turn ${worstTurn.rate.toFixed(2)} rad/s (${String(worstTurn.kind)}), light at most ${worstLight.off.toFixed(3)} rad off its painted turn, worst heading ${worstHeading.off.toFixed(2)} rad off its way, frames in flight facing over ${String(MOST_HEADING_OFF)} off ${Object.entries(
      headings,
    )
      .map(
        ([kind, { frames: seen, off }]) =>
          `${kind} ${String(off)} of ${String(seen)}`,
      )
      .join(
        ', ',
      )}, most turning round on one leg ${(worstSpin.spin / MOST_SPIN).toFixed(2)} times, worst rest ${worstRest.turn.toFixed(2)} rad, ${String(crossings)} frames with fliers crossing in flight, ${String(hoverForced)} with two hovering overlapped for want of an open spot, least spans at rest ${kinds
      .map(
        (kind) =>
          `${kind} ${String(leastSpan[kind]?.toFixed(1))} px drawn, ${String(leastOwnSpan[kind]?.toFixed(1))} at its own size`,
      )
      .join(
        ', ',
      )}; bees drank ${String(beeVisits)} times, ${String(pollinating)} pollinating; flies rested ${String(capRests.spotted)} times on fly agarics, ${String(capRests.other)} on other caps (pull ${String(FLIGHT_HABITS.fly.spottedPull)})`,
  );
}
